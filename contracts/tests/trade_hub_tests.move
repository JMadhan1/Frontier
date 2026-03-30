#[test_only]
module frontier_trade_hub::trade_hub_tests {
    use sui::test_scenario;
    use sui::clock;
    use sui::coin;
    use sui::sui::SUI;
    use frontier_trade_hub::trade_hub::{Self, TradeHub, AdminCap};

    #[test]
    fun test_init_and_list_item() {
        let admin = @0xAD;
        let seller = @0xB0B;

        let mut scenario_val = test_scenario::begin(admin);
        let scenario = &mut scenario_val;

        // Initialize the trade hub
        test_scenario::next_tx(scenario, admin);
        {
            trade_hub::init_for_testing(test_scenario::ctx(scenario));
        };

        // List an item
        test_scenario::next_tx(scenario, seller);
        {
            let mut trade_hub = test_scenario::take_shared<TradeHub>(scenario);
            let mut clock = clock::create_for_testing(test_scenario::ctx(scenario));
            clock::set_for_testing(&mut clock, 1000);

            trade_hub::list_item(
                &mut trade_hub,
                b"TRIT_001",
                b"Tritanium Ore",
                100,
                1000000000, // 1 SUI
                &clock,
                test_scenario::ctx(scenario),
            );

            let count = trade_hub::get_active_listing_count(&trade_hub);
            assert!(count == 1, 0);

            test_scenario::return_shared(trade_hub);
            clock::destroy_for_testing(clock);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    fun test_buy_item() {
        let admin = @0xAD;
        let seller = @0xB0B;
        let buyer = @0xCAFE;

        let mut scenario_val = test_scenario::begin(admin);
        let scenario = &mut scenario_val;

        // Initialize
        test_scenario::next_tx(scenario, admin);
        {
            trade_hub::init_for_testing(test_scenario::ctx(scenario));
        };

        // List an item
        test_scenario::next_tx(scenario, seller);
        {
            let mut trade_hub = test_scenario::take_shared<TradeHub>(scenario);
            let mut clock = clock::create_for_testing(test_scenario::ctx(scenario));
            clock::set_for_testing(&mut clock, 1000);

            trade_hub::list_item(
                &mut trade_hub,
                b"TRIT_001",
                b"Tritanium Ore",
                100,
                1000000000, // 1 SUI
                &clock,
                test_scenario::ctx(scenario),
            );

            test_scenario::return_shared(trade_hub);
            clock::destroy_for_testing(clock);
        };

        // Buy the item
        test_scenario::next_tx(scenario, buyer);
        {
            let mut trade_hub = test_scenario::take_shared<TradeHub>(scenario);
            let mut clock = clock::create_for_testing(test_scenario::ctx(scenario));
            clock::set_for_testing(&mut clock, 2000);

            let payment = coin::mint_for_testing<SUI>(1000000000, test_scenario::ctx(scenario));

            trade_hub::buy_item(
                &mut trade_hub,
                0, // listing_id
                payment,
                &clock,
                test_scenario::ctx(scenario),
            );

            let count = trade_hub::get_active_listing_count(&trade_hub);
            assert!(count == 0, 0);

            let (volume, trades, _, _) = trade_hub::get_stats(&trade_hub);
            assert!(trades == 1, 1);
            assert!(volume == 1000000000, 2);

            test_scenario::return_shared(trade_hub);
            clock::destroy_for_testing(clock);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    fun test_cancel_listing() {
        let admin = @0xAD;
        let seller = @0xB0B;

        let mut scenario_val = test_scenario::begin(admin);
        let scenario = &mut scenario_val;

        // Initialize
        test_scenario::next_tx(scenario, admin);
        {
            trade_hub::init_for_testing(test_scenario::ctx(scenario));
        };

        // List an item
        test_scenario::next_tx(scenario, seller);
        {
            let mut trade_hub = test_scenario::take_shared<TradeHub>(scenario);
            let mut clock = clock::create_for_testing(test_scenario::ctx(scenario));
            clock::set_for_testing(&mut clock, 1000);

            trade_hub::list_item(
                &mut trade_hub,
                b"TRIT_001",
                b"Tritanium Ore",
                100,
                1000000000,
                &clock,
                test_scenario::ctx(scenario),
            );

            test_scenario::return_shared(trade_hub);
            clock::destroy_for_testing(clock);
        };

        // Cancel the listing
        test_scenario::next_tx(scenario, seller);
        {
            let mut trade_hub = test_scenario::take_shared<TradeHub>(scenario);
            let mut clock = clock::create_for_testing(test_scenario::ctx(scenario));
            clock::set_for_testing(&mut clock, 2000);

            trade_hub::cancel_listing(
                &mut trade_hub,
                0,
                &clock,
                test_scenario::ctx(scenario),
            );

            let count = trade_hub::get_active_listing_count(&trade_hub);
            assert!(count == 0, 0);

            test_scenario::return_shared(trade_hub);
            clock::destroy_for_testing(clock);
        };

        test_scenario::end(scenario_val);
    }
}
