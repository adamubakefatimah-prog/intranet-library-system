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

  async requestBook(user, record) {
    if (!user || !record) throw new Error("Missing user or material details");
  
    try {
      const q = query(
        transactionsCol,
        where("userId", "==", user.uid),
        where("recordId", "==", record.id),
        where("status", "in", ["pending", "borrowed"])
      );
  
      const existing = await getDocs(q);
      if (!existing.empty) {
        throw new Error("You already have an active or pending request for this material.");
      }
  
      const userRef = doc(firestore, "users", user.uid);
      const userSnap = await getDoc(userRef);
  
      let userName = "Unknown User";
      if (userSnap.exists()) {
        const userData = userSnap.data();
        userName = userData.fullName || user.email || userName;
      }
  
      await addDoc(transactionsCol, {
        userId: user.uid,
        userName,
        recordId: record.id,
        title: record.title || "Untitled Material",
        author: record.author || "",
        type: record.type || "",
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
  

  async updateTransactionStatus(id, status, extraData = {}) {
    if (!id || !status) throw new Error("Missing transaction ID or status");

    try {
      const ref = doc(firestore, "transactions", id);
      const snapshot = await getDoc(ref);
      if (!snapshot.exists()) throw new Error("Transaction not found");

      const existingTx = snapshot.data();

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
      let librarianName = currentUser?.email || "Unknown Librarian";
      let librarianId = currentUser?.uid;

      if (librarianId) {
        const librarianRef = doc(firestore, "users", librarianId);
        const librarianSnap = await getDoc(librarianRef);
        if (librarianSnap.exists()) {
          const librarianData = librarianSnap.data();
          librarianName = librarianData.fullName || librarianName;
        }
      }

      await auditService.createLog({
        action: status,
        transactionId: id,
        userId: existingTx.userId,
        userName: existingTx.userName,
        materialId: existingTx.recordId,
        materialTitle: existingTx.title,
        librarianName,
        librarianId,
        comment: extraData?.comment,
      });

      return { success: true };
    } catch (error) {
      console.error("❌ Error updating transaction:", error);
      throw error;
    }
  },
};
