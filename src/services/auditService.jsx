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
    admissionNumber,
    materialId,
    materialTitle,
    comment,
    librarianName,
    librarianId,
    department,
  }) {
    try {
      const auditData = {
        action: action || "",
        transactionId: transactionId || "",
        userId: userId || "",
        userName: userName || "Unknown User",
        admissionNumber: admissionNumber || "",
        materialId: materialId || "",
        materialTitle: materialTitle || "Untitled Material",
        comment: comment || "",
        librarianName: librarianName || "Unknown Librarian",
        librarianId: librarianId || "",
        department: department || "—",
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
