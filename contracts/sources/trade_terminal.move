/// Smart Assembly Trade Terminal - EVE Frontier Integration
///
/// This module provides the bridge between EVE Frontier Smart Assemblies
/// and the Frontier Trade Hub marketplace. It enables in-game players to
/// interact with the marketplace directly from their Smart Storage Units (SSU).
///
/// Architecture:
/// - Smart Assemblies register with this module to become "Trade Terminals"
/// - Players interact with Trade Terminals in-game to list/buy items
/// - The module bridges in-game item data to the on-chain TradeHub contract
/// - Events are emitted for off-chain indexing and UI updates
///
/// Author: Frontier Trade Hub Team
/// License: MIT
/// Hackathon: EVE Frontier Hackathon 2026

module frontier_trade_hub::trade_terminal {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use sui::table::{Self, Table};
    use sui::clock::{Self, Clock};
    use std::string::{Self, String};
    use std::vector;

    // Import the TradeHub module
    use frontier_trade_hub::trade_hub::{Self, TradeHub};

    // ============== Error Codes ==============

    const ENotTerminalOwner: u64 = 0;
    const ETerminalNotActive: u64 = 1;
    const EInvalidAssemblyId: u64 = 2;
    const EItemNotInSsu: u64 = 3;
    const EInvalidQuantity: u64 = 4;
    const ETerminalAlreadyRegistered: u64 = 5;

    // ============== Structs ==============

    /// Represents an item stored in a Smart Storage Unit (SSU)
    /// This mirrors the in-game SSU inventory state on-chain
    public struct SsuItem has store, copy, drop {
        /// Unique item type identifier (e.g., "TRIT_001" for Tritanium)
        item_id: String,
        /// Human-readable item name
        item_name: String,
        /// Quantity available in the SSU
        quantity: u64,
        /// Item category (mineral, ore, ship, module, etc.)
        category: String,
    }

    /// A Trade Terminal - an SSU registered as a marketplace access point
    /// Players interact with this in-game to trade items
    public struct TradeTerminal has key {
        id: UID,
        /// The EVE Frontier Smart Assembly ID (in-game object reference)
        assembly_id: String,
        /// Owner of this terminal (the player who deployed it)
        owner: address,
        /// Location name in EVE Frontier (system/station)
        location: String,
        /// Whether the terminal is active and accepting trades
        is_active: bool,
        /// Items currently stored in this terminal's SSU
        inventory: Table<String, SsuItem>,
        /// Total trades facilitated through this terminal
        total_trades: u64,
        /// Terminal creation timestamp
        created_at: u64,
    }

    /// Capability for terminal management
    public struct TerminalCap has key, store {
        id: UID,
        terminal_id: ID,
    }

    /// Bridge record linking in-game item to on-chain listing
    public struct BridgeRecord has store, copy, drop {
        /// The on-chain listing ID in TradeHub
        listing_id: u64,
        /// The SSU item being listed
        item_id: String,
        /// Terminal that facilitated the bridge
        terminal_id: ID,
        /// Timestamp of bridge creation
        timestamp: u64,
    }

    // ============== Events ==============

    /// Emitted when a new Trade Terminal is registered
    public struct TerminalRegistered has copy, drop {
        terminal_id: ID,
        assembly_id: String,
        owner: address,
        location: String,
        timestamp: u64,
    }

    /// Emitted when an item is synced from SSU to the terminal
    public struct ItemSynced has copy, drop {
        terminal_id: ID,
        item_id: String,
        item_name: String,
        quantity: u64,
        timestamp: u64,
    }

    /// Emitted when a player lists an item through the terminal
    public struct TerminalListed has copy, drop {
        terminal_id: ID,
        item_id: String,
        item_name: String,
        quantity: u64,
        price: u64,
        seller: address,
        timestamp: u64,
    }

    /// Emitted when a purchase is made through the terminal
    public struct TerminalPurchased has copy, drop {
        terminal_id: ID,
        listing_id: u64,
        item_id: String,
        buyer: address,
        price: u64,
        timestamp: u64,
    }

    // ============== Public Functions ==============

    /// Register a new Trade Terminal from an existing Smart Assembly
    ///
    /// # Arguments
    /// * `assembly_id` - The EVE Frontier Smart Assembly ID
    /// * `location` - Location name in EVE Frontier (e.g., "Jita IV - Moon 4")
    /// * `clock` - Sui Clock for timestamp
    /// * `ctx` - Transaction context
    public entry fun register_terminal(
        assembly_id: vector<u8>,
        location: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let timestamp = clock::timestamp_ms(clock);

        let terminal = TradeTerminal {
            id: object::new(ctx),
            assembly_id: string::utf8(assembly_id),
            owner: sender,
            location: string::utf8(location),
            is_active: true,
            inventory: table::new(ctx),
            total_trades: 0,
            created_at: timestamp,
        };

        let terminal_id = object::id(&terminal);

        // Create management capability
        let cap = TerminalCap {
            id: object::new(ctx),
            terminal_id,
        };

        event::emit(TerminalRegistered {
            terminal_id,
            assembly_id: string::utf8(assembly_id),
            owner: sender,
            location: string::utf8(location),
            timestamp,
        });

        transfer::share_object(terminal);
        transfer::transfer(cap, sender);
    }

    /// Sync an item from the player's SSU to the terminal's inventory
    /// This represents the in-game action of moving items into the Trade Terminal
    ///
    /// # Arguments
    /// * `terminal` - The Trade Terminal object
    /// * `_cap` - Terminal management capability (validates ownership)
    /// * `item_id` - Item type identifier
    /// * `item_name` - Human-readable item name
    /// * `quantity` - Quantity to sync
    /// * `category` - Item category
    /// * `clock` - Sui Clock for timestamp
    /// * `ctx` - Transaction context
    public entry fun sync_item_from_ssu(
        terminal: &mut TradeTerminal,
        _cap: &TerminalCap,
        item_id: vector<u8>,
        item_name: vector<u8>,
        quantity: u64,
        category: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(terminal.is_active, ETerminalNotActive);
        assert!(tx_context::sender(ctx) == terminal.owner, ENotTerminalOwner);
        assert!(quantity > 0, EInvalidQuantity);

        let item_id_str = string::utf8(item_id);
        let item_name_str = string::utf8(item_name);
        let timestamp = clock::timestamp_ms(clock);

        if (table::contains(&terminal.inventory, item_id_str)) {
            // Update existing item quantity
            let existing = table::borrow_mut(&mut terminal.inventory, item_id_str);
            existing.quantity = existing.quantity + quantity;
        } else {
            // Add new item to inventory
            let item = SsuItem {
                item_id: item_id_str,
                item_name: item_name_str,
                quantity,
                category: string::utf8(category),
            };
            table::add(&mut terminal.inventory, item_id_str, item);
        };

        event::emit(ItemSynced {
            terminal_id: object::id(terminal),
            item_id: item_id_str,
            item_name: item_name_str,
            quantity,
            timestamp,
        });
    }

    /// List an item from the terminal's inventory on the marketplace
    /// This bridges the in-game SSU item to the on-chain TradeHub
    ///
    /// # Arguments
    /// * `terminal` - The Trade Terminal object
    /// * `trade_hub` - The shared TradeHub marketplace object
    /// * `_cap` - Terminal management capability
    /// * `item_id` - Item to list
    /// * `quantity` - Quantity to list
    /// * `price` - Price in SUI (MIST)
    /// * `clock` - Sui Clock for timestamp
    /// * `ctx` - Transaction context
    public entry fun list_item_through_terminal(
        terminal: &mut TradeTerminal,
        trade_hub: &mut TradeHub,
        _cap: &TerminalCap,
        item_id: vector<u8>,
        quantity: u64,
        price: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(terminal.is_active, ETerminalNotActive);
        assert!(tx_context::sender(ctx) == terminal.owner, ENotTerminalOwner);

        let item_id_str = string::utf8(item_id);

        // Verify item exists in terminal inventory
        assert!(table::contains(&terminal.inventory, item_id_str), EItemNotInSsu);

        let item = table::borrow_mut(&mut terminal.inventory, item_id_str);
        assert!(item.quantity >= quantity, EInvalidQuantity);

        // Reduce inventory
        item.quantity = item.quantity - quantity;

        let item_name = item.item_name;
        let timestamp = clock::timestamp_ms(clock);

        // Call the TradeHub to create the listing
        trade_hub::list_item(
            trade_hub,
            item_id,
            *string::as_bytes(&item_name),
            quantity,
            price,
            clock,
            ctx,
        );

        terminal.total_trades = terminal.total_trades + 1;

        event::emit(TerminalListed {
            terminal_id: object::id(terminal),
            item_id: item_id_str,
            item_name,
            quantity,
            price,
            seller: tx_context::sender(ctx),
            timestamp,
        });
    }

    /// Toggle terminal active status
    public entry fun toggle_terminal(
        terminal: &mut TradeTerminal,
        _cap: &TerminalCap,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == terminal.owner, ENotTerminalOwner);
        terminal.is_active = !terminal.is_active;
    }

    /// Update terminal location (e.g., if the player moves the SSU)
    public entry fun update_location(
        terminal: &mut TradeTerminal,
        _cap: &TerminalCap,
        new_location: vector<u8>,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == terminal.owner, ENotTerminalOwner);
        terminal.location = string::utf8(new_location);
    }

    // ============== View Functions ==============

    /// Get terminal details
    public fun get_terminal_info(terminal: &TradeTerminal): (String, String, address, bool, u64, u64) {
        (
            terminal.assembly_id,
            terminal.location,
            terminal.owner,
            terminal.is_active,
            terminal.total_trades,
            terminal.created_at,
        )
    }

    /// Get item from terminal inventory
    public fun get_item(terminal: &TradeTerminal, item_id: vector<u8>): (String, String, u64, String) {
        let item_id_str = string::utf8(item_id);
        assert!(table::contains(&terminal.inventory, item_id_str), EItemNotInSsu);
        let item = table::borrow(&terminal.inventory, item_id_str);
        (item.item_id, item.item_name, item.quantity, item.category)
    }

    /// Check if terminal has an item
    public fun has_item(terminal: &TradeTerminal, item_id: vector<u8>): bool {
        table::contains(&terminal.inventory, string::utf8(item_id))
    }

    /// Get item count in terminal
    public fun get_inventory_size(terminal: &TradeTerminal): u64 {
        // Note: Table doesn't have a length() function in Sui,
        // this would need a counter field in production
        0
    }
}
