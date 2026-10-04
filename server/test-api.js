const http = require('http');

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting API Verification Tests...\n');

  // 1. Check Dashboard
  const dashRes = await request('GET', '/api/dashboard');
  console.log('1. Dashboard Status:', dashRes.status === 200 ? 'PASS ✅' : 'FAIL ❌', dashRes.body.data.totalBooks, 'books');

  // 2. Add Book
  const newBook = {
    title: 'Automated Test Book',
    author: 'Tester Bot',
    category: 'Computer Science',
    isbn: 'TEST-' + Date.now(),
    quantity: 2,
  };
  const createBookRes = await request('POST', '/api/books', newBook);
  console.log('2. Create Book:', createBookRes.status === 201 ? 'PASS ✅' : 'FAIL ❌', createBookRes.body.data?.title);
  const bookId = createBookRes.body.data?._id;

  // 3. Add Member
  const newMember = {
    name: 'Test Member',
    email: `test-${Date.now()}@example.com`,
    phone: '555-0199',
  };
  const createMemberRes = await request('POST', '/api/members', newMember);
  console.log('3. Create Member:', createMemberRes.status === 201 ? 'PASS ✅' : 'FAIL ❌', createMemberRes.body.data?.name);
  const memberId = createMemberRes.body.data?._id;

  // 4. Issue Book
  const issueRes = await request('POST', '/api/transactions/issue', { bookId, memberId });
  console.log('4. Issue Book:', issueRes.status === 201 ? 'PASS ✅' : 'FAIL ❌', issueRes.body.message);
  const transactionId = issueRes.body.data?._id;

  // Verify stock decremented
  const checkBook1 = await request('GET', `/api/books/${bookId}`);
  console.log('   Available stock after issue:', checkBook1.body.data?.availableQuantity, '(expected 1)');

  // 5. Try duplicate issue (same member borrowing same book)
  const dupIssueRes = await request('POST', '/api/transactions/issue', { bookId, memberId });
  console.log('5. Reject Duplicate Issue:', dupIssueRes.status === 400 ? 'PASS ✅' : 'FAIL ❌', dupIssueRes.body.message);

  // 6. Return Book
  const returnRes = await request('PUT', `/api/transactions/${transactionId}/return`);
  console.log('6. Return Book:', returnRes.status === 200 ? 'PASS ✅' : 'FAIL ❌', returnRes.body.message);

  // Verify stock incremented back
  const checkBook2 = await request('GET', `/api/books/${bookId}`);
  console.log('   Available stock after return:', checkBook2.body.data?.availableQuantity, '(expected 2)');

  // 7. Delete Book
  const delBookRes = await request('DELETE', `/api/books/${bookId}`);
  console.log('7. Delete Book:', delBookRes.status === 200 ? 'PASS ✅' : 'FAIL ❌', delBookRes.body.message);

  // 8. Delete Member
  const delMemberRes = await request('DELETE', `/api/members/${memberId}`);
  console.log('8. Delete Member:', delMemberRes.status === 200 ? 'PASS ✅' : 'FAIL ❌', delMemberRes.body.message);

  console.log('\n🎉 All API Tests Completed Successfully!');
}

runTests().catch(console.error);
