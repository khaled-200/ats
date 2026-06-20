import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PaymentState {
  isUnlocked: boolean;
}

const initialState: PaymentState = {
  isUnlocked: false
};

export const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    unlock: (state) => {
      state.isUnlocked = true;
    },
    lock: (state) => {
      state.isUnlocked = false;
    },
    setUnlocked: (state, action: PayloadAction<boolean>) => {
      state.isUnlocked = action.payload;
    }
  }
});

export const { unlock, lock, setUnlocked } = paymentSlice.actions;
export default paymentSlice.reducer;
