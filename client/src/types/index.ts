export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Gig {
  _id: string;
  title: string;
  description: string;
  budget: number;
  ownerId: {
    _id: string;
    name: string;
    email: string;
  };
  status: 'open' | 'assigned';
  createdAt: string;
  updatedAt: string;
}

export interface Bid {
  _id: string;
  gigId: {
    _id: string;
    title: string;
    description?: string;
    budget?: number;
    status?: string;
  };
  freelancerId: {
    _id: string;
    name: string;
    email: string;
  };
  message: string;
  price: number;
  status: 'pending' | 'hired' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
  timestamp: number;
}
