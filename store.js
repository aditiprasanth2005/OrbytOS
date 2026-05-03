

import { create } from 'zustand';
import { db } from './firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export const useExpenses = create((set) => ({
  expenses: [],

  addExpense: (expense) =>
    set((state) => ({
      expenses: [expense, ...state.expenses]
    })),

  // ✅ REALTIME LISTENER
  startListening: () => {
    const unsubscribe = onSnapshot(
      collection(db, "expenses"),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        set({ expenses: data });
      }
    );

    return unsubscribe;
  }
}));