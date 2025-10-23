// src/services/transactionService.js
import { firestore } from "./firebase";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { auditService } from "./auditService";

const transactionsCol = collection(firestore, "transactions");

export const transactionService = {
  // 🔹 Fetch transactions for a specific user
  async getUserTransactions(uid) {
    if (!uid) return [];
    try {
      const q = query(transactionsCol, where("userId", "==", uid));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("❌ Error fetching user transactions:", error);
      return [];
    }
  },

  // 🔹 Fetch all transactions (for librarians)
  async getAllTransactions() {
    try {
      const snapshot = await getDocs(transactionsCol);
      if (snapshot.empty) return [];
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

    } catch (error) {
      console.error("❌ Error fetching all transactions:", error);
      return [];
    }
  },

  // 🔹 Create a borrow request (user requests a material)
  async requestBook(user, material) {
    if (!user || !material) throw new Error("Missing user or material details");

    try {
      // prevent duplicate requests
      const q = query(
        transactionsCol,
        where("userId", "==", user.uid),
        where("materialId", "==", material.id),
        where("status", "in", ["pending", "borrowed"])
      );
      const existing = await getDocs(q);
      if (!existing.empty) {
        throw new Error("You already have an active or pending request for this material.");
      }

      await addDoc(transactionsCol, {
        userId: user.uid,
        userName: user.fullName || user.email || "Unknown User",
        materialId: material.id,
        title: material.title || "Untitled Material",
        author: material.author || "",
        type: material.type || "",
        status: "pending",
        createdAt: serverTimestamp(),
        borrowDate: null,
        dueDate: null,
        returnDate: null,
      });

      return { success: true };
    } catch (error) {
      console.error("❌ Error creating borrow request:", error);
      throw error;
    }
  },

  // 🔹 Update transaction (approve / reject / return)
  // 🔹 Update transaction (approve / reject / return)
async updateTransactionStatus(id, status, extraData = {}) {
  if (!id || !status) throw new Error("Missing transaction ID or status");

  try {
    const ref = doc(firestore, "transactions", id);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) throw new Error("Transaction not found");

    const existingTx = snapshot.data();

    // ✅ Convert date strings to Firestore Timestamps
    const dataToUpdate = { ...extraData };

    if (extraData.borrowDate) {
      dataToUpdate.borrowDate = new Date(extraData.borrowDate);
    }

    if (extraData.dueDate) {
      dataToUpdate.dueDate = new Date(extraData.dueDate);
    }

    if (extraData.returnDate) {
      dataToUpdate.returnDate = new Date(extraData.returnDate);
    }

    await updateDoc(ref, {
      status,
      updatedAt: serverTimestamp(),
      ...dataToUpdate,
    });

    const currentUser = getAuth().currentUser;
    await auditService.createLog({
      action: status,
      transactionId: id,
      userId: existingTx.userId,
      userName: existingTx.fullName,
      materialId: existingTx.materialId,
      materialTitle: existingTx.title,
      librarianName: currentUser?.fullName || currentUser?.email || "Unknown Librarian",
      librarianId: currentUser?.uid,
      comment: extraData?.comment,
    });

    return { success: true };
  } catch (error) {
    console.error("❌ Error updating transaction:", error);
    throw error;
  }
}

};
