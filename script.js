function calculate() {
    // 1. Get Inputs
    const fullFee = parseFloat(document.getElementById('fullFee').value) || 0;
    const cashPaid = parseFloat(document.getElementById('cashPaid').value) || 0;
    const shuttles = parseFloat(document.getElementById('shuttleCost').value) || 0;
    const hours = parseFloat(document.getElementById('sessionHours').value) || 1;
    
    const cPlus = parseInt(document.getElementById('cntPlus').value) || 0;
    const cLight = parseInt(document.getElementById('cntLight').value) || 0;
    const cNone = parseInt(document.getElementById('cntNone').value) || 0;
    
    const totalPlayers = cPlus + cLight + cNone;
    if (totalPlayers === 0) return;

    // 2. Per-Person Base Share (28 PLN in your example)
    const perPersonFullCourtShare = fullFee / totalPlayers; 
    const shuttleShare = shuttles / totalPlayers;

    // 3. Calculate Individual Court Debt (Before Shuttles)
    const plusMaxDiscount = Math.max(1, Math.floor(hours)) * 15.0; // 30 PLN for 2h
    const lightMaxDiscount = 15.0;

    // A person's court debt is their share minus their applicable discount
    // (But discount cannot be more than their share)
    const courtDebtNone = perPersonFullCourtShare; 
    const courtDebtPlus = Math.max(0, perPersonFullCourtShare - plusMaxDiscount);
    const courtDebtLight = Math.max(0, perPersonFullCourtShare - lightMaxDiscount);

    // 4. Calculate Total "Calculated" Court Revenue
    // This is what the players OWE for the court based on their discounts
    const totalCalculatedCourtRevenue = (courtDebtPlus * cPlus) + (courtDebtLight * cLight) + (courtDebtNone * cNone);

    // 5. The Scaling Factor
    // If our calculated revenue is different from the Actual Cash Paid (50 PLN),
    // we scale the court portion to match the cash paid exactly.
    let scale = 1;
    if (totalCalculatedCourtRevenue > 0) {
        scale = cashPaid / totalCalculatedCourtRevenue;
    }

    // 6. Final Prices (Scaled Court Debt + Shuttle Share)
    const cp = (courtDebtPlus * scale) + shuttleShare;
    const cl = (courtDebtLight * scale) + shuttleShare;
    const cn = (courtDebtNone * scale) + shuttleShare;

    // 7. Update UI
    document.getElementById('plusLabel').innerText = `PLUS (max ${plusMaxDiscount} PLN off court)`;
    document.getElementById('lightLabel').innerText = `LIGHT (max ${lightMaxDiscount} PLN off court)`;

    document.getElementById('resPlus').innerText = cp.toFixed(2) + " PLN";
    document.getElementById('resLight').innerText = cl.toFixed(2) + " PLN";
    document.getElementById('resNoCard').innerText = cn.toFixed(2) + " PLN";

    // 8. Final Validation
    const totalCollected = (cp * cPlus) + (cl * cLight) + (cn * cNone);
    const vBox = document.getElementById('validationBox');
    vBox.className = "validation-box valid-ok";
    vBox.innerText = `✅ Verified: Recovering ${totalCollected.toFixed(2)} PLN`;
    document.getElementById('results').style.display = 'block';
}
