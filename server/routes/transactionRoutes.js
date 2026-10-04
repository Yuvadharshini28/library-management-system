const express = require('express');
const router = express.Router();
const {
  getAllTransactions,
  issueBook,
  returnBook,
} = require('../controllers/transactionController');

router.get('/', getAllTransactions);
router.post('/issue', issueBook);
router.put('/:id/return', returnBook);

module.exports = router;
