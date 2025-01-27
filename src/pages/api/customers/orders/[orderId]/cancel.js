import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]";
import { OrderStatus } from "@/lib/order_status";

export default async function handler(req, res) {
  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  const currentUser = session?.user;
  if (!currentUser) {
    return res.status(401).json({ error: "Login is required" });
  }
  if (req.method === "POST") {
    const orderId = req.query.orderId;
    const docRef = doc(db, "orders", orderId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return res.status(404).json({ error: "Order not found" });
    }
    if (docSnap.data().userId !== currentUser.id) {
      return res.status(403).json({ error: "Order not found" });
    }

    await updateDoc(docRef, {
      status: OrderStatus.CANCELLED,
    });

    return res.status(200).json({ success: true });
  }
}
