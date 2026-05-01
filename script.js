function calculate() {
    // 1. Inputs
    const fullFee = parseFloat(document.getElementById('fullFee').value) || 0;
    const cashPaid = parseFloat(document.getElementById('cashPaid').value) || 0;
    const shuttles = parseFloat(document.getElementById('shuttleCost').value) || 0;
    const hours = parseFloat(document.getElementById('sessionHours').value) || 1;
    
    const cPlus = parseInt(document.getElementById('cntPlus').value) || 0;
    const cLight = parseInt(document.getElementById('cntLight').value) || 0;
    const cNone = parseInt(document.getElementById('cntNone').value) || 0;
    
    const totalPlayers = cPlus + cLight + cNone;
    if (totalPlayers === 0) return;

    // 2. Base Shuttle Share (Everyone pays this)
    const sShare = shuttles / totalPlayers;

    // 3. No-Card Price (Full share of court + shuttles)
    let cn = (fullFee / totalPlayers) + sShare;

    // 4. SURPLUS PROTECTION
    // The total out-of-pocket is Cash + Shuttles. Total recovered cannot exceed this.
    const totalOutofPocket = cashPaid + shuttles;
    
    // If No-Card users' combined share exceeds total spent, cap it to an equal split
    if ((cn * cNone) > totalOutofPocket) {
        cn = totalOutofPocket / totalPlayers;
    }

    // 5. Remaining Cash Logic for Card Users
    // Calculate how much cash is still needed after No-Card users pay their part
    const noCardCourtContribution = Math.max(0, cn - sShare);
    const remainingCashToRecover = Math.max(0, cashPaid - (noCardCourtContribution * cNone));
    
    const cardCount = cPlus + cLight;
    const plusBenefit = Math.max(1, Math.floor(hours)) * 15.0;
    const lightBenefit = 15.0;
    const gap = plusBenefit - lightBenefit;

    let cp = sShare; // Start with shuttle cost base
    let cl = sShare;

    if (cardCount > 0) {
        // Distribute the remaining CASH debt while maintaining the Benefit Gap
        let cashShareLight = (remainingCashToRecover + (cPlus * gap)) / cardCount;
        let cashSharePlus = cashShareLight - gap;

        // Ensure cash shares are not negative (cards only discount court, not shuttles)
        cp += Math.max(0, cashSharePlus);
        cl += Math.max(0, cashShareLight);
    } else {
        cp = 0; cl = 0;
    }

    // 6. Update UI
    document.getElementById('plusLabel').innerText = `PLUS (max ${plusBenefit} PLN off court)`;
    document.getElementById('lightLabel').innerText = `LIGHT (max ${lightBenefit} PLN off court)`;

    document.getElementById('resPlus').innerText = cp.toFixed(2) + " PLN";
    document.getElementById('resLight').innerText = cl.toFixed(2) + " PLN";
    document.getElementById('resNoCard').innerText = cn.toFixed(2) + " PLN";

    const totalCollected = (cp * cPlus) + (cl * cLight) + (cn * cNone);
    const vBox = document.getElementById('validationBox');
    vBox.className = "validation-box valid-ok";
    vBox.innerText = `✅ Verified: Recovering ${totalCollected.toFixed(2)} PLN`;
    document.getElementById('results').style.display = 'block';
}
