const Book = require('./models/Book');
const Member = require('./models/Member');
const Transaction = require('./models/Transaction');

const sampleBooks = [
  {
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    category: 'Computer Science',
    isbn: '978-0132350884',
    quantity: 5,
    availableQuantity: 4,
  },
  {
    title: 'Introduction to Algorithms (CLRS)',
    author: 'Thomas H. Cormen, Charles E. Leiserson',
    category: 'Computer Science',
    isbn: '978-0262033848',
    quantity: 3,
    availableQuantity: 2,
  },
  {
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    category: 'Literature',
    isbn: '978-0060935467',
    quantity: 4,
    availableQuantity: 3,
  },
  {
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    category: 'Science',
    isbn: '978-0553380163',
    quantity: 4,
    availableQuantity: 4,
  },
  {
    title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
    author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
    category: 'Computer Science',
    isbn: '978-0201633610',
    quantity: 3,
    availableQuantity: 2,
  },
  {
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    category: 'History',
    isbn: '978-0062316097',
    quantity: 6,
    availableQuantity: 5,
  },
  {
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt, David Thomas',
    category: 'Computer Science',
    isbn: '978-0135957059',
    quantity: 4,
    availableQuantity: 4,
  },
  {
    title: '1984',
    author: 'George Orwell',
    category: 'Literature',
    isbn: '978-0451524935',
    quantity: 5,
    availableQuantity: 5,
  }
];

const sampleMembers = [
  {
    name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    phone: '+1 (555) 234-5678',
    membershipDate: new Date('2025-01-15'),
  },
  {
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    phone: '+1 (555) 876-5432',
    membershipDate: new Date('2025-02-01'),
  },
  {
    name: 'Sophia Rodriguez',
    email: 'sophia.rodriguez@example.com',
    phone: '+1 (555) 345-6789',
    membershipDate: new Date('2025-02-20'),
  },
  {
    name: 'David Kim',
    email: 'david.kim@example.com',
    phone: '+1 (555) 901-2345',
    membershipDate: new Date('2025-03-05'),
  },
  {
    name: 'Emily Watson',
    email: 'emily.watson@example.com',
    phone: '+1 (555) 678-1234',
    membershipDate: new Date('2025-03-12'),
  }
];

const seedData = async () => {
  try {
    const bookCount = await Book.countDocuments();
    if (bookCount > 0) {
      console.log('Database already contains data, skipping auto-seed.');
      return;
    }

    console.log('Seeding initial library data...');
    const createdBooks = await Book.insertMany(sampleBooks);
    const createdMembers = await Member.insertMany(sampleMembers);

    // Create a few realistic transactions
    const transactions = [
      {
        bookId: createdBooks[0]._id, // Clean Code
        memberId: createdMembers[0]._id, // Alice
        issueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        status: 'issued',
      },
      {
        bookId: createdBooks[1]._id, // CLRS
        memberId: createdMembers[1]._id, // Michael
        issueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        status: 'issued',
      },
      {
        bookId: createdBooks[2]._id, // To Kill a Mockingbird
        memberId: createdMembers[2]._id, // Sophia
        issueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        returnDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // returned 2 days ago
        status: 'returned',
      },
      {
        bookId: createdBooks[4]._id, // Design Patterns
        memberId: createdMembers[3]._id, // David
        issueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        status: 'issued',
      },
      {
        bookId: createdBooks[5]._id, // Sapiens
        memberId: createdMembers[4]._id, // Emily
        issueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        status: 'issued',
      }
    ];

    await Transaction.insertMany(transactions);
    console.log('Library sample data successfully seeded!');
  } catch (err) {
    console.error('Error during data seeding:', err.message);
  }
};

module.exports = seedData;
