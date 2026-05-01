/**
 * EXTENDED TEST SUITE
 * Matches the logic where:
 * 1. Court Share = Full Fee / Total Players
 * 2. Discount is capped by the Court Share
 * 3. Scaling Factor = Cash Paid / Total Calculated Court Debt
 */

function runTests() {
    console.log("🏸 Starting Extended Court Splitter Tests...");

    // CASE 1: FULLY COVERED (0 PLN Cash Paid)
    // Full Fee: 140, Cash Paid: 0, Shuttles: 12.5, Hours: 2
    // Players: 1 Plus, 1 Light, 3 No-Card (Total 5)
    // Court Share per person: 28 PLN. 
    // Plus (30) caps at 28. Light (15) takes 15.
    // Even if discounts cover everything, if Cash Paid is 0, court cost is 0 for all.
    test("Case 1: Total Cash Paid is 0", {
        fullFee: 140, cashPaid: 0, shuttles: 12.5, hours: 2,
        cntPlus: 1, cntLight: 1, cntNone: 3
    }, {
        plus: 2.50,  // Only shuttle share
        light: 2.50, // Only shuttle share
        none: 2.50,  // Only shuttle share
        total: 12.50
    });

    // CASE 2: LOW CASH RECOVERY
    // Full Fee: 40, Cash Paid: 10, Shuttles: 12.5, Hours: 2
    // Players: 1 Plus, 1 Light, 1 No-Card (Total 3)
    // Court Share per person: 13.33 PLN.
    // Plus (30) caps at 13.33 -> Debt 0
    // Light (15) caps at 13.33 -> Debt 0
    // No-Card -> Debt 13.33
    // Scale = 10 / 13.33 = 0.75
    test("Case 2: Low Bill / Scaling Factor", {
        fullFee: 40, cashPaid: 10, shuttles: 12.5, hours: 2,
        cntPlus: 1, cntLight: 1, cntNone: 1
    }, {
        plus: 4.17,  // 0 + 4.17 shuttle
        light: 4.17, // 0 + 4.17 shuttle
        none: 14.17, // (13.33 * 0.75) + 4.17
        total: 22.50 // 10 Cash + 12.50 Shuttles
    });

    // CASE 3: HIGH VALUE WINTER SESSION
    // Full Fee: 600, Cash Paid: 300, Shuttles: 100, Hours: 2
    // Players: 10 Plus, 0 Light, 0 No-Card (Total 10)
    // Court Share: 60 PLN. Plus Disc: 30. Remaining: 30.
    // 10 players * 30 = 300. Scale = 300/300 = 1.
    test("Case 3: All Plus Users / Perfect Scale", {
        fullFee: 600, cashPaid: 300, shuttles: 100, hours: 2,
        cntPlus: 10, cntLight: 0, cntNone: 0
    }, {
        plus: 40.00, // (30 court + 10 shuttle)
        total: 400.00
    });

    console.log("✅ All tests completed.");
}

function test(name, inputs, expected) {
    const totalPlayers = inputs.cntPlus + inputs.cntLight + inputs.cntNone;
    const perPersonFullCourtShare = inputs.fullFee / totalPlayers;
    const shuttleShare = inputs.shuttles / totalPlayers;

    const plusMaxDiscount = Math.max(1, Math.floor(inputs.hours)) * 15.0;
    const lightMaxDiscount = 15.0;

    // Debt calculation with caps
    const courtDebtNone = perPersonFullCourtShare;
    const courtDebtPlus = Math.max(0, perPersonFullCourtShare - plusMaxDiscount);
    const courtDebtLight = Math.max(0, perPersonFullCourtShare - lightMaxDiscount);

    const totalCalculatedCourtRevenue = (courtDebtPlus * inputs.cntPlus) + 
                                       (courtDebtLight * inputs.cntLight) + 
                                       (courtDebtNone * inputs.cntNone);

    let scale = 1;
    if (totalCalculatedCourtRevenue > 0) {
        scale = inputs.cashPaid / totalCalculatedCourtRevenue;
    } else if (inputs.cashPaid > 0 && totalCalculatedCourtRevenue === 0) {
        // Fallback: if everyone has 0 debt but there's still cash paid (shouldn't happen with No-Cards)
        scale = 0; 
    }

    const cp = (courtDebtPlus * scale) + shuttleShare;
    const cl = (courtDebtLight * scale) + shuttleShare;
    const cn = (courtDebtNone * scale) + shuttleShare;
    
    const actualTotal = (cp * inputs.cntPlus) + (cl * inputs.cntLight) + (cn * inputs.cntNone);

    console.group(`Test: ${name}`);
    if (expected.plus) console.log(`Plus: ${cp.toFixed(2)} (Expected: ${expected.plus.toFixed(2)})`);
    if (expected.light) console.log(`Light: ${cl.toFixed(2)} (Expected: ${expected.light.toFixed(2)})`);
    if (expected.none) console.log(`None: ${cn.toFixed(2)} (Expected: ${expected.none.toFixed(2)})`);
    
    const isTotalCorrect = Math.abs(actualTotal - expected.total) < 0.05;
    console.log(`Total Recovery: ${actualTotal.toFixed(2)} / ${expected.total.toFixed(2)} -> ${isTotalCorrect ? "✅ PASS" : "❌ FAIL"}`);
    console.groupEnd();
}
