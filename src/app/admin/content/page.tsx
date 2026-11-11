import React from "react";
import { requirePage } from "@/lib/admin-page";
import { getSettings } from "@/lib/settings";
import { PAGE_DEFAULTS } from "@/lib/page-defaults";
import ContentEditor from "@/components/admin/ContentEditor";
import type { PageKey } from "@/lib/settings-types";

export default async function AdminContentPage() {
  await requirePage("content");
  const settings = await getSettings();

  // Show the text that is live right now (the owner's text, or the built-in one)
  const pages = {} as Record<PageKey, string>;
  for (const key of Object.keys(PAGE_DEFAULTS) as PageKey[]) {
    pages[key] = settings.pages[key]?.trim() || PAGE_DEFAULTS[key].body;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-heading">Content</h1>
        <p className="mt-1 text-stone-600">
          Your shop name and logo, the home page text, FAQ, About page and policies. Changes go live within a minute.
        </p>
      </div>
      <ContentEditor initial={{ brand: settings.brand, home: settings.home, faq: settings.faq, pages }} />
    </div>
  );
}
