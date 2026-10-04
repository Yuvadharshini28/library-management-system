const Transaction = require('../models/Transaction');
const Book = require('../models/Book');
const Member = require('../models/Member');

// @desc    Get all transactions
// @route   GET /api/transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const { status, memberId, bookId } = req.query;
    let query = {};

    if (status && ['issued', 'returned'].includes(status)) {
      query.status = status;
    }
    if (memberId) query.memberId = memberId;
    if (bookId) query.bookId = bookId;

    const transactions = await Transaction.find(query)
      .populate('bookId', 'title author category isbn quantity availableQuantity')
      .populate('memberId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Issue a book to a member
// @route   POST /api/transactions/issue
exports.issueBook = async (req, res) => {
  try {
    const { bookId, memberId, issueDate } = req.body;

    if (!bookId || !memberId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both bookId and memberId',
      });
    }

    // Check if book exists and has available copies
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    if (book.availableQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: `No copies of "${book.title}" are currently available for issue.`,
      });
    }

    // Check if member exists
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    // Check if member already has this exact book issued and not returned
    const alreadyIssued = await Transaction.findOne({
      bookId,
      memberId,
      status: 'issued',
    });

    if (alreadyIssued) {
      return res.status(400).json({
        success: false,
        message: `Member "${member.name}" already has a copy of "${book.title}" issued.`,
      });
    }

    // Decrement available copies
    book.availableQuantity -= 1;
    await book.save();

    // Create transaction
    const transaction = await Transaction.create({
      bookId,
      memberId,
      issueDate: issueDate || new Date(),
      status: 'issued',
    });

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('bookId', 'title author category isbn')
      .populate('memberId', 'name email phone');

    res.status(201).json({
      success: true,
      message: `Book "${book.title}" successfully issued to "${member.name}"`,
      data: populatedTransaction,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Return an issued book
// @route   PUT /api/transactions/:id/return
exports.returnBook = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction record not found' });
    }

    if (transaction.status === 'returned') {
      return res.status(400).json({
        success: false,
        message: 'This book has already been returned.',
      });
    }

    // Mark transaction as returned
    transaction.status = 'returned';
    transaction.returnDate = new Date();
    await transaction.save();

    // Increment available copies of the book
    const book = await Book.findById(transaction.bookId);
    if (book) {
      book.availableQuantity = Math.min(book.quantity, book.availableQuantity + 1);
      await book.save();
    }

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('bookId', 'title author category isbn')
      .populate('memberId', 'name email phone');

    res.status(200).json({
      success: true,
      message: 'Book successfully returned to the library',
      data: populatedTransaction,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
