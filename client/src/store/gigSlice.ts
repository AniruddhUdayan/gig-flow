import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { gigsAPI } from '../services/api';
import type { Gig } from '../types';

interface GigState {
  gigs: Gig[];
  currentGig: Gig | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
}

const initialState: GigState = {
  gigs: [],
  currentGig: null,
  loading: false,
  error: null,
  searchQuery: '',
};

// Async thunks
export const fetchGigs = createAsyncThunk(
  'gigs/fetchGigs',
  async (search: string | undefined, { rejectWithValue }) => {
    try {
      const response = await gigsAPI.getGigs(search);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch gigs');
    }
  }
);

export const createGig = createAsyncThunk(
  'gigs/createGig',
  async (data: { title: string; description: string; budget: number }, { rejectWithValue }) => {
    try {
      const response = await gigsAPI.createGig(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create gig');
    }
  }
);

export const fetchGigById = createAsyncThunk(
  'gigs/fetchGigById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await gigsAPI.getGigById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch gig');
    }
  }
);

const gigSlice = createSlice({
  name: 'gigs',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentGig: (state) => {
      state.currentGig = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch gigs
    builder.addCase(fetchGigs.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchGigs.fulfilled, (state, action: PayloadAction<Gig[]>) => {
      state.loading = false;
      state.gigs = action.payload;
    });
    builder.addCase(fetchGigs.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create gig
    builder.addCase(createGig.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createGig.fulfilled, (state, action: PayloadAction<Gig>) => {
      state.loading = false;
      state.gigs.unshift(action.payload);
    });
    builder.addCase(createGig.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch gig by ID
    builder.addCase(fetchGigById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchGigById.fulfilled, (state, action: PayloadAction<Gig>) => {
      state.loading = false;
      state.currentGig = action.payload;
    });
    builder.addCase(fetchGigById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setSearchQuery, clearError, clearCurrentGig } = gigSlice.actions;
export default gigSlice.reducer;
