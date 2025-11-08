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
        throw new Error(
          "You already have an active or pending request for this material."
        );
      }

      // read user profile to get fullName and admission/staff id (userId field in users doc)
      const userRef = doc(firestore, "users", user.uid);
      const userSnap = await getDoc(userRef);

      let userName = "Unknown User";
      let admissionNumber = "";
      if (userSnap.exists()) {
        const userData = userSnap.data();
        userName = userData.fullName || user.email || userName;
        // some apps store staff/admission in different field names — adjust if yours differs
        admissionNumber = userData.userId || userData.staffId || "";
      }

      await addDoc(transactionsCol, {
        userId: user.uid,
        userName,
        admissionNumber,
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

      // Normalize date fields to Date objects (Firestore client will convert Date -> Timestamp)
      if (extraData.borrowDate) {
        dataToUpdate.borrowDate = extraData.borrowDate instanceof Date
          ? extraData.borrowDate
          : new Date(extraData.borrowDate);
      }
      if (extraData.dueDate) {
        dataToUpdate.dueDate = extraData.dueDate instanceof Date
          ? extraData.dueDate
          : new Date(extraData.dueDate);
      }
      if (extraData.returnDate) {
        dataToUpdate.returnDate = extraData.returnDate instanceof Date
          ? extraData.returnDate
          : new Date(extraData.returnDate);
      }

      // Ensure we persist admissionNumber and a stable userName on the transaction
      // (in case older transactions don't have it)
      const userRef = doc(firestore, "users", existingTx.userId);
      const userSnap = await getDoc(userRef);
      let admissionNumber = existingTx.admissionNumber || "";
      let storedUserName = existingTx.userName || "";
      if (userSnap.exists()) {
        const userData = userSnap.data();
        admissionNumber = userData.userId || userData.staffId || admissionNumber;
        storedUserName = userData.fullName || storedUserName || userData.email || storedUserName;
      }

      // also ensure transaction doc gets admissionNumber and userName updated (non-destructive)
      const ensureFields = {
        admissionNumber: admissionNumber || "",
        userName: storedUserName || existingTx.userName || "",
      };

      await updateDoc(ref, {
        status,
        updatedAt: serverTimestamp(),
        ...dataToUpdate,
        ...ensureFields,
      });

      // get librarian info (fetch profile for fullName)
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
        userName: storedUserName || existingTx.userName,
        admissionNumber: admissionNumber || "",
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
