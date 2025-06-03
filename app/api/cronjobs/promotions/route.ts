import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  documentId,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    // Step 1: Find all promoted events
    const eventQuery = query(
      collection(db, "events"),
      where("isPromoted", "==", true)
    );
    const eventSnapshot = await getDocs(eventQuery);
    const events = eventSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (events.length === 0) {
      return NextResponse.json({
        status: 200,
        message: "No promoted events found",
      });
    }

    console.log(`Found ${events.length} promoted events`);

    // Step 2: Collect promotion IDs
    const promotionIds = events
      .map((event) => event.promotionId)
      .filter((id): id is string => typeof id === "string");

    if (promotionIds.length === 0) {
      return NextResponse.json({
        status: 200,
        message: "No promotion IDs found",
      });
    }

    console.log(`Looking up ${promotionIds.length} promotion packages`);

    // Step 3: Batch Firestore queries (limit: 10 IDs per batch)
    const promotionIdCopy = [...promotionIds];
    const batches = [];

    while (promotionIdCopy.length) {
      const batch = promotionIdCopy.splice(0, 10);
      const q = query(
        collection(db, "promotions"),
        where(documentId(), "in", batch)
      );
      batches.push(getDocs(q));
    }

    const snapshots = await Promise.all(batches);
    const promotions = snapshots.flatMap((snapshot) =>
      snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    );

    if (promotions.length === 0) {
      return NextResponse.json({
        status: 200,
        message: "No promotions found for the promoted events",
      });
    }

    console.log(`Loaded ${promotions.length} promotions`);

    // Step 4: Determine expired promotions
    const currentDate = new Date();
    const updatePromises: Promise<void>[] = [];

    for (const event of events) {
      const promotion = promotions.find(
        (promo) => promo.id === event.promotionId
      );
      const startDate = event.promotionStartDate?.toDate?.();
      console.log("promotion start date", startDate);

      if (promotion && promotion.duration && startDate) {
        console.log("I have all the data");
        const endDate = new Date(
          startDate.getTime() + promotion.duration * 86400000
        );

        console.log("this is the end date", endDate);
        if (endDate < currentDate) {
          console.log(
            `Expiring promotion ${promotion.id} for event ${event.id}`
          );
          updatePromises.push(
            updateDoc(doc(db, "events", event.id), {
              isPromoted: false,
              promotionId: null,
              promotionStartDate: null,
            })
          );
        }
      }
    }

    await Promise.all(updatePromises);

    console.log("Promotion cron job completed successfully");

    return NextResponse.json({
      status: 200,
      message: "Job has run successfully",
    });
  } catch (error) {
    console.error("Error running promotion cron job:", error);
    return NextResponse.json(
      { status: 500, message: "Internal server error", error: String(error) },
      { status: 500 }
    );
  }
}
