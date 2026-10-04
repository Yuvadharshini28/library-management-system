const Book = require('../models/Book');
const Member = require('../models/Member');
const Transaction = require('../models/Transaction');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const totalMembers = await Member.countDocuments();
    const issuedBooks = await Transaction.countDocuments({ status: 'issued' });
    const returnedBooks = await Transaction.countDocuments({ status: 'returned' });

    // Aggregate total quantity of book copies
    const totalCopiesAgg = await Book.aggregate([
      {
        $group: {
          _id: null,
          totalQty: { $sum: '$quantity' },
          totalAvailable: { $sum: '$availableQuantity' },
        },
      },
    ]);

    const totalCopies = totalCopiesAgg[0] ? totalCopiesAgg[0].totalQty : 0;
    const totalAvailable = totalCopiesAgg[0] ? totalCopiesAgg[0].totalAvailable : 0;

    // Recent 5 transactions
    const recentTransactions = await Transaction.find()
      .populate('bookId', 'title author')
      .populate('memberId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Categories aggregation
    const categoryStats = await Book.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalBooks,
        totalCopies,
        totalAvailable,
        totalMembers,
        issuedBooks,
        returnedBooks,
        categoryStats,
        recentTransactions,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
