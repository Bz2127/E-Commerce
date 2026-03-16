const calculateCommission = (amount) => {

    const commissionRate = 0.10; // 10%

    // Calculate platform fee
    let platformFee = amount * commissionRate;

    // Fix floating point rounding
    platformFee = Number(platformFee.toFixed(2));

    const sellerAmount = Number((amount - platformFee).toFixed(2));

    return {
        platformFee,
        sellerAmount
    };

};

module.exports = calculateCommission;