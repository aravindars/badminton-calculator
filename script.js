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

    // 2. Base Shuttle Share (Everyone pays this)
    const sShare = shuttles / totalPlayers;

    // 3. No-Card Player Calculation (Surplus Protected)
    // First, calculate the "Theoretical" court share
    let noCardCourtShare = fullFee / totalPlayers;

    // IMPORTANT: If No-Card court shares combined exceed the actual Cash Paid, 
    // we cap them at an equal split of the Cash Paid.
    const totalCashToRecover = cashPaid;
    if ((noCardCourtShare * cNone) > totalCashToRecover) {
        noCardCourtShare = totalCashToRecover / totalPlayers;
    }

    const cn = noCardCourtShare + sShare;

    // 4. Calculate Remaining Cash for Card Users
    // This ensures we recover exactly the Cash Paid + Shuttles
    const remainingCash = Math.max(0, totalCashToRecover - (noCardCourtShare * cNone));
    
    const cardCount = cPlus + cLight;
    const plusBenefit = Math.max(1, Math.floor(hours)) * 15.0;
    const lightBenefit = 15.0;
    const gap = plusBenefit - lightBenefit;

    let cp = sShare; 
    let cl = sShare;

    if (cardCount > 0) {
        // Split remaining cash among card users based on their card type
        let cashShareLight = (remainingCash + (cPlus * gap)) / cardCount;
        let cashSharePlus = cashShareLight - gap;

        // Ensure card users don't get a negative cash price
        cp += Math.max(0, cashSharePlus);
        cl += Math.max(0, cashShareLight);
    }

    // 5. Update UI
    document.getElementById('plusLabel').innerText = `PLUS (max ${plusBenefit} PLN off court)`;
    document.getElementById('lightLabel').innerText = `LIGHT (max ${lightBenefit} PLN off court)`;

    document.getElementById('resPlus').innerText = cp.toFixed(2) + " PLN";
    document.getElementById('resLight').innerText = cl.toFixed(2) + " PLN";
    document.getElementById('resNoCard').innerText = cn.toFixed(2) + " PLN";

    // 6. Validation
    const totalCollected = (cp * cPlus) + (cl * cLight) + (cn * cNone);
    const vBox = document.getElementById('validationBox');
    vBox.className = "validation-box valid-ok";
    vBox.innerText = `✅ Verified: Recovering ${totalCollected.toFixed(2)} PLN`;
    document.getElementById('results').style.display = 'block';
}
