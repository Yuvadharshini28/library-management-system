const Book = require('../models/Book');
const Transaction = require('../models/Transaction');

// @desc    Get all books
// @route   GET /api/books
exports.getAllBooks = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    const books = await Book.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: books.length, data: books });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single book
// @route   GET /api/books/:id
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    res.status(200).json({ success: true, data: book });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a book
// @route   POST /api/books
exports.createBook = async (req, res) => {
  try {
    const { title, author, category, isbn, quantity } = req.body;

    if (!title || !author || !category || !isbn || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, author, category, isbn, quantity',
      });
    }

    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      return res.status(400).json({
        success: false,
        message: `Book with ISBN '${isbn}' already exists`,
      });
    }

    const parsedQuantity = parseInt(quantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive number',
      });
    }

    const book = await Book.create({
      title,
      author,
      category,
      isbn,
      quantity: parsedQuantity,
      availableQuantity: parsedQuantity,
    });

    res.status(201).json({ success: true, data: book });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a book
// @route   PUT /api/books/:id
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const { title, author, category, isbn, quantity } = req.body;

    if (isbn && isbn !== book.isbn) {
      const existing = await Book.findOne({ isbn });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Book with ISBN '${isbn}' already exists`,
        });
      }
    }

    if (quantity !== undefined) {
      const newQuantity = parseInt(quantity, 10);
      if (isNaN(newQuantity) || newQuantity < 0) {
        return res.status(400).json({ success: false, message: 'Invalid quantity' });
      }

      const currentlyIssued = book.quantity - book.availableQuantity;
      if (newQuantity < currentlyIssued) {
        return res.status(400).json({
          success: false,
          message: `Cannot decrease total quantity to ${newQuantity} because ${currentlyIssued} copies are currently issued to members`,
        });
      }

      book.availableQuantity = newQuantity - currentlyIssued;
      book.quantity = newQuantity;
    }

    if (title) book.title = title;
    if (author) book.author = author;
    if (category) book.category = category;
    if (isbn) book.isbn = isbn;

    const updatedBook = await book.save();
    res.status(200).json({ success: true, data: updatedBook });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Check if there are active issued transactions
    const activeIssued = await Transaction.findOne({
      bookId: book._id,
      status: 'issued',
    });

    if (activeIssued) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete book: Copies are currently issued to members. Please return them first.',
      });
    }

    await Book.findByIdAndDelete(req.params.id);
    // Optionally delete transaction history or keep records
    res.status(200).json({ success: true, message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
