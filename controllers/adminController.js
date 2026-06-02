import User from "../model/userModel.js";
import Wallet from "../model/walletModel.js";

// PATCH /api/admin/users/:id/status
// Approve or reject a worker or facility account
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, accountType } = req.body;

    // Step 1: Validate the status value
    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ 
        message: "Status must be either Approved or Rejected" 
      });
    }

    // Step 2: Find the user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Step 3: Update the correct status field based on account type
    if (accountType === "facility") {
      user.facilityStatus = status;
    } else {
      user.verificationStatus = status;
    }

    await user.save();

    res.status(200).json({
      message: `Account has been ${status.toLowerCase()} successfully`,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        verificationStatus: user.verificationStatus,
        facilityStatus: user.facilityStatus
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

// POST /api/admin/payout/:shiftId
// Triggered when a shift is completed — splits payment automatically
export const processShiftPayout = async (req, res) => {
  try {
    const { shiftId } = req.params;
    const { workerId, facilityId, hoursWorked, hourlyRate } = req.body;

    // Step 1: Calculate the total shift cost
    const totalCost = hoursWorked * hourlyRate;
    const commissionRate = 0.10;
    const commissionAmount = totalCost * commissionRate;
    const workerEarnings = totalCost - commissionAmount;

    // Step 2: Find the facility wallet and deduct total cost
    const facilityWallet = await Wallet.findOne({ userId: facilityId });
    if (!facilityWallet) {
      return res.status(404).json({ message: "Facility wallet not found" });
    }
    if (facilityWallet.balance < totalCost) {
      return res.status(400).json({ message: "Insufficient funds in facility wallet" });
    }

    facilityWallet.balance -= totalCost;
    facilityWallet.transactions.push({
      type: "Debit",
      amount: totalCost,
      description: `Payment for shift ${shiftId}`
    });
    await facilityWallet.save();

    // Step 3: Find the platform wallet and deposit commission
    const platformWallet = await Wallet.findOne({ isPlatformSystemWallet: true });
    if (!platformWallet) {
      return res.status(404).json({ message: "Platform wallet not found" });
    }

    platformWallet.balance += commissionAmount;
    platformWallet.transactions.push({
      type: "Commission",
      amount: commissionAmount,
      description: `Commission from shift ${shiftId}`
    });
    await platformWallet.save();

    // Step 4: Find the worker wallet and deposit earnings
    const workerWallet = await Wallet.findOne({ userId: workerId });
    if (!workerWallet) {
      return res.status(404).json({ message: "Worker wallet not found" });
    }

    workerWallet.balance += workerEarnings;
    workerWallet.transactions.push({
      type: "Credit",
      amount: workerEarnings,
      description: `Earnings from shift ${shiftId}`
    });
    await workerWallet.save();

    // Step 5: Return the breakdown
    res.status(200).json({
      message: "Payout processed successfully",
      breakdown: {
        totalCost,
        commissionAmount,
        workerEarnings,
        facilityNewBalance: facilityWallet.balance,
        workerNewBalance: workerWallet.balance
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};