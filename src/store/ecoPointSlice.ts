import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { API_URL } from '../../config';

export interface UserPoints {
  totalPoints: number;
  level: string;
  nextLevelPoints: number;
  nextLevelName: string;
  co2Saved: number;
  itemsRecycled: number;
}

export interface Reward {
  id: number;
  name: string;
  description: string;
  points: number;
  icon: string;
  available: boolean;
}

interface EcoPointState {
  userPoints: UserPoints;
  rewards: Reward[];
  redeemingId: number | null;
  loading: boolean;
  error: string | null;
}

interface EcoPointResponse {
  success: boolean;
  userPoints: UserPoints;
  rewards: Reward[];
}

const initialState: EcoPointState = {
  userPoints: {
    totalPoints: 78,
    level: 'Bronze',
    nextLevelPoints: 100,
    nextLevelName: 'Silver',
    co2Saved: 4.8,
    itemsRecycled: 7,
  },
  rewards: [
    {
      id: 1,
      name: 'Voucher Belanja',
      description: 'Voucher Rp10.000',
      points: 50,
      icon: 'cart-outline',
      available: true,
    },
    {
      id: 2,
      name: 'Pulsa Listrik',
      description: 'Pulsa Rp20.000',
      points: 100,
      icon: 'flash-outline',
      available: true,
    },
    {
      id: 3,
      name: 'Bibit Tanaman',
      description: 'Paket 3 bibit pohon',
      points: 150,
      icon: 'leaf-outline',
      available: true,
    },
    {
      id: 4,
      name: 'E-Tumbler',
      description: 'Tumbler stainless steel',
      points: 300,
      icon: 'cup-outline',
      available: false,
    },
    {
      id: 5,
      name: 'Voucher Makanan',
      description: 'Voucher Rp50.000',
      points: 500,
      icon: 'restaurant-outline',
      available: false,
    },
  ],
  redeemingId: null,
  loading: false,
  error: null,
};

export const fetchEcoPointData = createAsyncThunk<EcoPointResponse>(
  'ecoPoint/fetchEcoPointData',
  async (_, thunkAPI) => {
    try {
      const response = await fetch(`${API_URL}/eco-points`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        return thunkAPI.rejectWithValue(data.error || 'Gagal memuat data Eco Poin');
      }

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue('Gagal terhubung ke server Eco Poin');
    }
  }
);

const ecoPointSlice = createSlice({
  name: 'ecoPoint',
  initialState,
  reducers: {
    startRedeem: (state, action: PayloadAction<number>) => {
      state.redeemingId = action.payload;
    },
    finishRedeem: (state, action: PayloadAction<number>) => {
      state.userPoints.totalPoints -= action.payload;
      state.redeemingId = null;
    },
    cancelRedeem: (state) => {
      state.redeemingId = null;
    },
    addPoints: (state, action: PayloadAction<number>) => {
      state.userPoints.totalPoints += action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEcoPointData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEcoPointData.fulfilled, (state, action) => {
        state.loading = false;
        state.userPoints = action.payload.userPoints;
        state.rewards = action.payload.rewards;
      })
      .addCase(fetchEcoPointData.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : action.error.message || 'Gagal memuat data Eco Poin';
      });
  },
});

export const { startRedeem, finishRedeem, cancelRedeem, addPoints } = ecoPointSlice.actions;
export default ecoPointSlice.reducer;
