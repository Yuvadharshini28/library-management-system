import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Books API
export const getBooks = (params) => API.get('/books', { params });
export const getBookById = (id) => API.get(`/books/${id}`);
export const createBook = (bookData) => API.post('/books', bookData);
export const updateBook = (id, bookData) => API.put(`/books/${id}`, bookData);
export const deleteBook = (id) => API.delete(`/books/${id}`);

// Members API
export const getMembers = (params) => API.get('/members', { params });
export const getMemberById = (id) => API.get(`/members/${id}`);
export const createMember = (memberData) => API.post('/members', memberData);
export const updateMember = (id, memberData) => API.put(`/members/${id}`, memberData);
export const deleteMember = (id) => API.delete(`/members/${id}`);

// Transactions API
export const getTransactions = (params) => API.get('/transactions', { params });
export const issueBook = (data) => API.post('/transactions/issue', data);
export const returnBook = (id) => API.put(`/transactions/${id}/return`);

// Dashboard API
export const getDashboardStats = () => API.get('/dashboard');

export default API;
