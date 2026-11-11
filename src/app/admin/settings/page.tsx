import React from "react";
import { getSettings } from "@/lib/settings";
import SettingsEditor from "@/components/admin/SettingsEditor";
import { listConfiguredGateways } from "@/lib/payments/registry";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-heading">Store settings</h1>
        <p className="mt-1 text-stone-600">
          Contact details, delivery charges, payment accounts, coupons, couriers and offers. Changes go live within a minute.
        </p>
      </div>
      <SettingsEditor initial={settings} gateways={listConfiguredGateways()} />
    </div>
  );
}
