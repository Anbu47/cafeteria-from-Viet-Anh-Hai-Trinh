import { db } from "@/lib/firebase";
import { getDocs, collection, query, orderBy, limit } from "firebase/firestore";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(req, res) {
  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  const currentUser = session?.user;
  if (!currentUser) {
    return res.status(401).json({ error: "Login is required" });
  }
  if (!currentUser?.isStaff) {
    return res.status(401).json({ error: "Staff is required" });
  }
  if (req.method === "GET") {
    // Query progress and sort by timestamp
    const q = query(
      collection(db, "orders"),
      orderBy("timestamp", "desc"),
      limit(100)
    );

    // Return empty array if no order found
    if ((await getDocs(q)).empty) {
      return res.status(200).json({ success: true, data: {} });
    }

    // Return order data
    const docs = (await getDocs(q)).docs;
    const data = docs.map((doc) => {
      return { ...doc.data(), id: doc.id };
    });
    return res.status(200).json({ success: true, data: data });
  }
}
