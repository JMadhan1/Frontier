/// Frontier Trade Hub - A decentralized marketplace for EVE Frontier
/// 
/// This module implements a peer-to-peer trading system that allows players
/// to list items for sale and purchase items from other players directly
/// on the Sui blockchain, integrated with EVE Frontier's Smart Storage Units.
///
/// Author: Frontier Trade Hub Team
/// License: MIT
/// Hackathon: EVE Frontier Hackathon 2026

module frontier_trade_hub::trade_hub {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::event;
    use sui::table::{Self, Table};
    use sui::clock::{Self, Clock};
    use std::string::{Self, String};
    use std::vector;

    // ============== Error Codes ==============
    
    /// Error when listing is not found
    const EListingNotFound: u64 = 0;
    /// Error when caller is not the seller
    const ENotSeller: u64 = 1;
    /// Error when payment is insufficient
    const EInsufficientPayment: u64 = 2;
    /// Error when trying to buy own listing
    const ECannotBuyOwnListing: u64 = 3;
    /// Error when listing is already inactive
    const EListingInactive: u64 = 4;
    /// Error when caller is not the owner
    const ENotOwner: u64 = 5;
    /// Error when item ID is invalid
    const EInvalidItemId: u64 = 6;
    /// Error when price is zero or negative
    const EInvalidPrice: u64 = 7;

    // ============== Structs ==============

    /// Represents a single listing in the marketplace
    /// Contains all necessary information about an item for sale
    public struct Listing has store, copy, drop {
        /// Unique identifier for this listing
        listing_id: u64,
        /// The in-game item ID being sold
        item_id: String,
        /// Item name/description for display
        item_name: String,
        /// Quantity of items being sold
        quantity: u64,
        /// Price in SUI (MIST - smallest unit)
        price: u64,
        /// Address of the seller
        seller: address,
        /// Timestamp when listing was created
        timestamp: u64,
        /// Whether the listing is still active
        is_active: bool,
    }

    /// The main TradeHub object that manages all marketplace operations
    /// This is a shared object accessible by all players
    public struct TradeHub has key {
        id: UID,
        /// Counter for generating unique listing IDs
        listing_counter: u64,
        /// Table mapping listing_id to Listing
        listings: Table<u64, Listing>,
        /// Vector of active listing IDs for iteration
        active_listing_ids: vector<u64>,
        /// Owner/admin of the trade hub
        owner: address,
        /// Total volume traded (in MIST)
        total_volume: u64,
        /// Total number of successful trades
        total_trades: u64,
        /// Fee percentage (basis points, 100 = 1%)
        fee_bps: u64,
        /// Accumulated fees
        accumulated_fees: u64,
    }

    /// Capability object for admin operations
    public struct AdminCap has key, store {
        id: UID,
        trade_hub_id: ID,
    }

    // ============== Events ==============

    /// Emitted when a new item is listed for sale
    public struct ItemListed has copy, drop {
        listing_id: u64,
        item_id: String,
        item_name: String,
        quantity: u64,
        price: u64,
        seller: address,
        timestamp: u64,
    }

    /// Emitted when an item is successfully sold
    public struct ItemSold has copy, drop {
        listing_id: u64,
        item_id: String,
        item_name: String,
        quantity: u64,
        price: u64,
        seller: address,
        buyer: address,
        timestamp: u64,
    }

    /// Emitted when a listing is cancelled by the seller
    public struct ListingCancelled has copy, drop {
        listing_id: u64,
        item_id: String,
        seller: address,
        timestamp: u64,
    }

    /// Emitted when the trade hub is initialized
    public struct TradeHubCreated has copy, drop {
        trade_hub_id: ID,
        owner: address,
        timestamp: u64,
    }

    // ============== Initialization ==============

    /// Initialize the TradeHub - called once when the module is published
    fun init(ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        
        let trade_hub = TradeHub {
            id: object::new(ctx),
            listing_counter: 0,
            listings: table::new(ctx),
            active_listing_ids: vector::empty(),
            owner: sender,
            total_volume: 0,
            total_trades: 0,
            fee_bps: 100, // 1% fee
            accumulated_fees: 0,
        };

        let trade_hub_id = object::id(&trade_hub);

        // Create admin capability for the deployer
        let admin_cap = AdminCap {
            id: object::new(ctx),
            trade_hub_id,
        };

        // Emit creation event
        event::emit(TradeHubCreated {
            trade_hub_id,
            owner: sender,
            timestamp: 0, // Will be set properly with clock in production
        });

        // Share the TradeHub so anyone can interact with it
        transfer::share_object(trade_hub);
        // Transfer admin cap to the deployer
        transfer::transfer(admin_cap, sender);
    }

    // ============== Public Entry Functions ==============

    /// List a new item for sale on the marketplace
    /// 
    /// # Arguments
    /// * `trade_hub` - The shared TradeHub object
    /// * `item_id` - The in-game item identifier
    /// * `item_name` - Human-readable name of the item
    /// * `quantity` - Number of items being sold
    /// * `price` - Total price in SUI (MIST)
    /// * `clock` - Sui Clock object for timestamp
    /// * `ctx` - Transaction context
    public entry fun list_item(
        trade_hub: &mut TradeHub,
        item_id: vector<u8>,
        item_name: vector<u8>,
        quantity: u64,
        price: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Validate inputs
        assert!(vector::length(&item_id) > 0, EInvalidItemId);
        assert!(price > 0, EInvalidPrice);
        assert!(quantity > 0, EInvalidPrice);

        let seller = tx_context::sender(ctx);
        let timestamp = clock::timestamp_ms(clock);
        let listing_id = trade_hub.listing_counter;
        
        // Increment the listing counter
        trade_hub.listing_counter = listing_id + 1;

        // Create the listing
        let listing = Listing {
            listing_id,
            item_id: string::utf8(item_id),
            item_name: string::utf8(item_name),
            quantity,
            price,
            seller,
            timestamp,
            is_active: true,
        };

        // Add to the listings table
        table::add(&mut trade_hub.listings, listing_id, listing);
        
        // Add to active listings vector
        vector::push_back(&mut trade_hub.active_listing_ids, listing_id);

        // Emit the ItemListed event
        event::emit(ItemListed {
            listing_id,
            item_id: string::utf8(item_id),
            item_name: string::utf8(item_name),
            quantity,
            price,
            seller,
            timestamp,
        });
    }

    /// Purchase a listed item
    /// 
    /// # Arguments
    /// * `trade_hub` - The shared TradeHub object
    /// * `listing_id` - The ID of the listing to purchase
    /// * `payment` - The SUI coin used for payment
    /// * `clock` - Sui Clock object for timestamp
    /// * `ctx` - Transaction context
    public entry fun buy_item(
        trade_hub: &mut TradeHub,
        listing_id: u64,
        mut payment: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Verify listing exists
        assert!(table::contains(&trade_hub.listings, listing_id), EListingNotFound);
        
        let listing = table::borrow_mut(&mut trade_hub.listings, listing_id);
        
        // Verify listing is still active
        assert!(listing.is_active, EListingInactive);
        
        let buyer = tx_context::sender(ctx);
        let seller = listing.seller;
        
        // Prevent buying own listing
        assert!(buyer != seller, ECannotBuyOwnListing);
        
        // Verify payment amount
        let payment_amount = coin::value(&payment);
        assert!(payment_amount >= listing.price, EInsufficientPayment);

        // Calculate fee
        let fee_amount = (listing.price * trade_hub.fee_bps) / 10000;
        let seller_amount = listing.price - fee_amount;

        // Mark listing as inactive
        listing.is_active = false;

        // Update trade hub stats
        trade_hub.total_volume = trade_hub.total_volume + listing.price;
        trade_hub.total_trades = trade_hub.total_trades + 1;
        trade_hub.accumulated_fees = trade_hub.accumulated_fees + fee_amount;

        // Remove from active listings vector
        let (found, index) = vector::index_of(&trade_hub.active_listing_ids, &listing_id);
        if (found) {
            vector::remove(&mut trade_hub.active_listing_ids, index);
        };

        // Get listing data before dropping the borrow
        let item_id = listing.item_id;
        let item_name = listing.item_name;
        let quantity = listing.quantity;
        let price = listing.price;
        let timestamp = clock::timestamp_ms(clock);

        // Split payment: seller gets their share, fee stays in contract
        let seller_payment = coin::split(&mut payment, seller_amount, ctx);
        transfer::public_transfer(seller_payment, seller);
        
        // Return excess payment to buyer if any
        if (coin::value(&payment) > fee_amount) {
            let refund_amount = coin::value(&payment) - fee_amount;
            let refund = coin::split(&mut payment, refund_amount, ctx);
            transfer::public_transfer(refund, buyer);
        };
        
        // Transfer remaining (fee) to trade hub owner
        transfer::public_transfer(payment, trade_hub.owner);

        // Emit the ItemSold event
        event::emit(ItemSold {
            listing_id,
            item_id,
            item_name,
            quantity,
            price,
            seller,
            buyer,
            timestamp,
        });
    }

    /// Cancel a listing (only the seller can do this)
    /// 
    /// # Arguments
    /// * `trade_hub` - The shared TradeHub object
    /// * `listing_id` - The ID of the listing to cancel
    /// * `clock` - Sui Clock object for timestamp
    /// * `ctx` - Transaction context
    public entry fun cancel_listing(
        trade_hub: &mut TradeHub,
        listing_id: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Verify listing exists
        assert!(table::contains(&trade_hub.listings, listing_id), EListingNotFound);
        
        let listing = table::borrow_mut(&mut trade_hub.listings, listing_id);
        
        // Verify listing is still active
        assert!(listing.is_active, EListingInactive);
        
        // Verify caller is the seller
        let caller = tx_context::sender(ctx);
        assert!(caller == listing.seller, ENotSeller);

        // Mark listing as inactive
        listing.is_active = false;

        // Remove from active listings vector
        let (found, index) = vector::index_of(&trade_hub.active_listing_ids, &listing_id);
        if (found) {
            vector::remove(&mut trade_hub.active_listing_ids, index);
        };

        let item_id = listing.item_id;
        let timestamp = clock::timestamp_ms(clock);

        // Emit the ListingCancelled event
        event::emit(ListingCancelled {
            listing_id,
            item_id,
            seller: caller,
            timestamp,
        });
    }

    // ============== View Functions ==============

    /// Get the number of active listings
    public fun get_active_listing_count(trade_hub: &TradeHub): u64 {
        vector::length(&trade_hub.active_listing_ids)
    }

    /// Get all active listing IDs
    public fun get_active_listing_ids(trade_hub: &TradeHub): vector<u64> {
        trade_hub.active_listing_ids
    }

    /// Get a specific listing by ID
    public fun get_listing(trade_hub: &TradeHub, listing_id: u64): &Listing {
        assert!(table::contains(&trade_hub.listings, listing_id), EListingNotFound);
        table::borrow(&trade_hub.listings, listing_id)
    }

    /// Get listing details
    public fun get_listing_details(listing: &Listing): (u64, String, String, u64, u64, address, u64, bool) {
        (
            listing.listing_id,
            listing.item_id,
            listing.item_name,
            listing.quantity,
            listing.price,
            listing.seller,
            listing.timestamp,
            listing.is_active
        )
    }

    /// Get trade hub statistics
    public fun get_stats(trade_hub: &TradeHub): (u64, u64, u64, u64) {
        (
            trade_hub.total_volume,
            trade_hub.total_trades,
            trade_hub.listing_counter,
            trade_hub.fee_bps
        )
    }

    /// Get the trade hub owner
    public fun get_owner(trade_hub: &TradeHub): address {
        trade_hub.owner
    }

    // ============== Admin Functions ==============

    /// Update the fee percentage (admin only)
    public entry fun update_fee(
        _admin_cap: &AdminCap,
        trade_hub: &mut TradeHub,
        new_fee_bps: u64,
        _ctx: &mut TxContext
    ) {
        // Max fee is 10% (1000 basis points)
        assert!(new_fee_bps <= 1000, EInvalidPrice);
        trade_hub.fee_bps = new_fee_bps;
    }

    /// Transfer ownership of the trade hub
    public entry fun transfer_ownership(
        admin_cap: AdminCap,
        trade_hub: &mut TradeHub,
        new_owner: address,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == trade_hub.owner, ENotOwner);
        trade_hub.owner = new_owner;
        transfer::transfer(admin_cap, new_owner);
    }

    // ============== Test Functions ==============

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx)
    }
}