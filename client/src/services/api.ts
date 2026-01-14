import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/api/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/api/auth/login', data),

  logout: () =>
    api.post('/api/auth/logout'),

  getCurrentUser: () =>
    api.get('/api/auth/me'),
};

// Gigs API
export const gigsAPI = {
  getGigs: (search?: string) =>
    api.get('/api/gigs', { params: { search } }),

  createGig: (data: { title: string; description: string; budget: number }) =>
    api.post('/api/gigs', data),

  getGigById: (id: string) =>
    api.get(`/api/gigs/${id}`),
};

// Bids API
export const bidsAPI = {
  createBid: (data: { gigId: string; message: string; price: number }) =>
    api.post('/api/bids', data),

  getBidsByGig: (gigId: string) =>
    api.get(`/api/bids/${gigId}`),

  hireBid: (bidId: string) =>
    api.patch(`/api/bids/${bidId}/hire`),

  getMyBids: () =>
    api.get('/api/bids/my-bids'),
};

export default api;
