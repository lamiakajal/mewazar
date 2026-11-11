import React from "react";
import { requirePage } from "@/lib/admin-page";
import { connectToDatabase } from "@/lib/mongodb";
import ReviewModel from "@/models/Review";
import ReviewsManager, { AdminReview } from "@/components/admin/ReviewsManager";

export default async function AdminReviewsPage() {
  await requirePage("reviews");
  await connectToDatabase();
  // Waiting reviews first, then the newest published ones
  const docs = await ReviewModel.find().sort({ status: -1, createdAt: -1 }).limit(200).lean();
  const reviews = JSON.parse(JSON.stringify(docs)) as AdminReview[];
  const pending = reviews.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-heading">Reviews</h1>
        <p className="mt-1 text-stone-600">
          {pending} waiting for approval. Customers&apos; reviews only appear in the store after you approve them.
        </p>
      </div>
      <ReviewsManager reviews={reviews} />
    </div>
  );
}
