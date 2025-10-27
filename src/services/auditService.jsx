// src/services/auditService.js
import {
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { firestore } from "./firebase";

const auditCollection = collection(firestore, "auditLogs");

export const auditService = {
  async createLog({
    action,
    transactionId,
    userId,
    userName,
    materialId,
    materialTitle,
    comment,
    librarianName,
    librarianId,
  }) {
    try {
      const auditData = {
        action,
        transactionId,
        userId,
        userName: userName || "Unknown User",
        materialId: materialId || "",
        materialTitle: materialTitle || "Untitled Material",
        comment: comment || "",
        librarianName: librarianName || "Unknown Librarian",
        librarianId: librarianId || "",
        timestamp: serverTimestamp(),
      };

      await addDoc(auditCollection, auditData);
    } catch (err) {
      console.error("❌ Failed to create audit log:", err);
    }
  },

  async getAllLogs() {
    try {
      const q = query(auditCollection, orderBy("timestamp", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.error("❌ Failed to fetch audit logs:", err);
      return [];
    }
  },
};
