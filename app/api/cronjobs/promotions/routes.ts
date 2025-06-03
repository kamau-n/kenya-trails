import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { NextResponse } from "next/server";

type PromotionCron = {};

export async function GET(req: Request) {
  // search for all promoted events

  const eventQuery = query(
    collection(db, "events"),
    where("isPromoted", "==", true)
  );

  const eventSnapshot = await getDocs(eventQuery);

  // extract the data
  const events = eventSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  // If there are no promoted events, return early
  if (events.length === 0) {
    return new NextResponse(
      JSON.stringify({
        status: 200,
        message: "No promoted events found",
      }),
      { status: 200 }
    );
  }
  // Log the events found
  console.log("Found promoted events:", events);

  // now let  us get the promotions packages for these events (promotionId)

  const promotionIds = events.map((event) => event.promotionId).filter(Boolean);
  if (promotionIds.length === 0) {
    return new NextResponse(
      JSON.stringify({
        status: 200,
        message: "No promotion packages found for the promoted events",
      }),
      { status: 200 }
    );
  }
  const promotionQuery = query(
    collection(db, "promotions"),
    where("id", "in", promotionIds)
  );
  const promotionSnapshot = await getDocs(promotionQuery);
  // extract the data
  const promotions = promotionSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  // Log the promotions found
  console.log("Found promotions:", promotions);
  // If there are no promotions, return early
  if (promotions.length === 0) {
    return new NextResponse(
      JSON.stringify({
        status: 200,
        message: "No promotions found for the promoted events",
      }),
      { status: 200 }
    );
  }

  // loop throught the events and promotions to check if the promotion has expired , if yes, set isPromoted to false and remove the promotionId from the event
  const currentDate = new Date();
  for (const event of events) {
    const promotion = promotions.find(
      (promo) => promo.id === event.promotionId
    );

    // promotion has no end date, it just has number of days
    if (promotion && promotion.numberOfDays) {
      const promotionEndDate = new Date(
        event.promotionStartDate.toDate().getTime() +
          promotion.numberOfDays * 24 * 60 * 60 * 1000
      );
      if (promotionEndDate < currentDate) {
        console.log(
          `Promotion ${promotion.id} for event ${event.id} has expired`
        );
        // Update the event to remove the promotion

        await updateDoc(doc(db, "events", event.id), {
          isPromoted: false,
          promotionId: null,
          promotionStartDate: null,
        });
      }
    }
  }
  // Log the completion of the cron job
  console.log("Promotion cron job completed successfully");
  // Return a success response

  return new NextResponse(
    JSON.stringify({
      status: 200,
      message: "Job has run successfully",
    })
  );
}
