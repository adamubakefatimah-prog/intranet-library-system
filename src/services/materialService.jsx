import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAt,
  endAt,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { firestore } from "./firebase";

const materialsCol = collection(firestore, "materials");

// create material
export async function createMaterial(data) {
  const now = serverTimestamp();
  const newDocRef = doc(materialsCol);
  const materialId = newDocRef.id;

  const payload = {
    materialId,
    ...data,
    title: data.title || "",
    author: data.author || "",
    title_lower: (data.title || "").toLowerCase(),
    author_lower: (data.author || "").toLowerCase(),
    fileUrl: data.fileUrl || "",  
    viewCount: Number(data.viewCount || 0),
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(newDocRef, payload);
  return { id: materialId, success: true };
}

// update material
export async function updateMaterial(id, data) {
  const d = doc(firestore, "materials", id);
  await updateDoc(d, {
    ...data,
    title_lower: data.title ? data.title.toLowerCase() : undefined,
    author_lower: data.author ? data.author.toLowerCase() : undefined,
    updatedAt: serverTimestamp(),
  });
}

// delete
export async function deleteMaterial(id) {
  await deleteDoc(doc(firestore, "materials", id));
}

// get single
export async function getMaterial(id) {
  const d = doc(firestore, "materials", id);
  const snap = await getDoc(d);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// increment view count
export async function incrementViewCount(id) {
  try {
    const d = doc(firestore, "materials", id);
    await updateDoc(d, {
      viewCount: increment(1),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("Failed to increment view count:", err);
  }
}

/*
  Prefix search -- efficient:
  - orderBy('title_lower') + startAt(prefix) + endAt(prefix + '\uf8ff')
  - returns items limited to limitNum
*/
export async function searchTitlesPrefix(prefix, limitNum = 8) {
  if (!prefix || prefix.length < 1) return [];
  const p = prefix.toLowerCase();

  // Query by title_lower
  const qTitle = query(
    materialsCol,
    orderBy("title_lower"),
    startAt(p),
    endAt(p + "\uf8ff"),
    limit(limitNum)
  );

  // Query by author_lower
  const qAuthor = query(
    materialsCol,
    orderBy("author_lower"),
    startAt(p),
    endAt(p + "\uf8ff"),
    limit(limitNum)
  );

  // Run both in parallel
  const [snapTitle, snapAuthor] = await Promise.all([
    getDocs(qTitle),
    getDocs(qAuthor),
  ]);

  // Combine & remove duplicates
  const allDocs = [
    ...snapTitle.docs.map((d) => ({ id: d.id, ...d.data() })),
    ...snapAuthor.docs.map((d) => ({ id: d.id, ...d.data() })),
  ];

  const unique = [];
  const seen = new Set();

  for (const doc of allDocs) {
    if (!seen.has(doc.id)) {
      unique.push(doc);
      seen.add(doc.id);
    }
  }

  return unique.slice(0, limitNum);
}


/*
  Smart search:
  - server-side filters for type/year
  - order by selected field
  - client side text match in lowercase for q
*/
// export async function searchMaterialsSmart({
//   q = "",
//   type = "",
//   year = null,
//   sort = "popular",
//   limitNum = 20,
// }) {
//   const qLower = (q || "").toLowerCase().trim();
//   const filters = [];

//   if (type) filters.push(where("type", "==", type));
//   if (year) filters.push(where("publicationYear", "==", Number(year)));

//   let orderField = "createdAt";
//   let orderDir = "desc";
//   if (sort === "popular") orderField = "viewCount";
//   else if (sort === "title") {
//     orderField = "title_lower";
//     orderDir = "asc";
//   }

//   const firestoreQuery = filters.length
//     ? query(materialsCol, ...filters, orderBy(orderField, orderDir), limit(limitNum))
//     : query(materialsCol, orderBy(orderField, orderDir), limit(limitNum));

//   const snap = await getDocs(firestoreQuery);
//   const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

//   const q2 = query(materialsCol, orderBy("createdAt", "desc"), limit(10));
// const snap2 = await getDocs(q2);
//   console.log("Docs found:", snap2.size);


//   if (!qLower) return items;

//   return items.filter((it) => {
//     const hay = `${it.title || ""} ${it.author || ""}`.toLowerCase();
//     return hay.includes(qLower);
//   });
// }

export async function searchMaterialsSmart({
  q = "",
  type = "",
  year = null,
  sort = "popular",
  limitNum = 20,
}) {
  const qLower = q.toLowerCase().trim();
  const filters = [];

  if (type) filters.push(where("type", "==", type));
  if (year) filters.push(where("publicationYear", "==", Number(year)));

  let orderField = "createdAt";
  let orderDir = "desc";

  if (sort === "popular") orderField = "viewCount";
  else if (sort === "title") {
    orderField = "title";
    orderDir = "asc";
  }

  try {
    const firestoreQuery = filters.length
      ? query(materialsCol, ...filters, orderBy(orderField, orderDir), limit(limitNum))
      : query(materialsCol, orderBy(orderField, orderDir), limit(limitNum));

    const snap = await getDocs(firestoreQuery);

    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    if (!qLower) return items;



    const filtered = items.filter((it) => {
      const text = [
        it.title?.toLowerCase() || "",
        it.author?.toLowerCase() || "",
        ...(it.keywords || []).map((k) => k.toLowerCase()),
      ].join(" ");
      return text.includes(qLower);
    });

    console.log("🔍 Filtered results:", filtered.length);
    return filtered;
  } catch (err) {
    console.error("❌ Search query failed:", err.message);
    return [];
  }
}


// convenience getter all materials
export async function getAllMaterials(limitNum = 100) {
  const q = query(materialsCol, orderBy("createdAt", "desc"), limit(limitNum));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
