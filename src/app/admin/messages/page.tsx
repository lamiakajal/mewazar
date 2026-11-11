import React from "react";
import { requirePage } from "@/lib/admin-page";
import { connectToDatabase } from "@/lib/mongodb";
import ContactMessageModel from "@/models/ContactMessage";
import MessagesManager, { AdminMessage } from "@/components/admin/MessagesManager";

export default async function AdminMessagesPage() {
  await requirePage("messages");
  await connectToDatabase();
  const docs = await ContactMessageModel.find().sort({ read: 1, createdAt: -1 }).limit(200).lean();
  const messages = JSON.parse(JSON.stringify(docs)) as AdminMessage[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-heading">Messages</h1>
        <p className="mt-1 text-stone-600">Messages sent through the Contact page. New ones are also emailed to you.</p>
      </div>
      <MessagesManager messages={messages} />
    </div>
  );
}
