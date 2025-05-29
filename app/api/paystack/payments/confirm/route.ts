import { VerificationResponse } from "@/app/types/types";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";

export async function GET(req: Request) {
  console.log("this is a payment verification process ", req);

  return new Response(
    JSON.stringify({
      message: "Hello,you have accessed the payment verification route",
      status: 200,
    })
  );
}
