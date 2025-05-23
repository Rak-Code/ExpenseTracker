import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// Add Expense
export const addExpense = async (userId, expense) => {
  try {
    const docRef = await addDoc(collection(db, "expenses"), {
      ...expense,
      userId,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Add Expense Error:", error);
    throw error;
  }
};

// Get Expenses by User and Time Range
export const getExpensesByRange = async (userId, startDate, endDate) => {
  const expensesRef = collection(db, "expenses");
  const q = query(
    expensesRef,
    where("userId", "==", userId),
    where("createdAt", ">=", Timestamp.fromDate(startDate)),
    where("createdAt", "<=", Timestamp.fromDate(endDate))
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Update Expense
export const updateExpense = async (id, updatedData) => {
  try {
    const expenseRef = doc(db, "expenses", id);
    await updateDoc(expenseRef, updatedData);
  } catch (error) {
    console.error("Update Error:", error);
    throw error;
  }
};

// Delete Expense
export const deleteExpense = async (id) => {
  try {
    const expenseRef = doc(db, "expenses", id);
    await deleteDoc(expenseRef);
  } catch (error) {
    console.error("Delete Error:", error);
    throw error;
  }
};
