"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import type { StoreSettings } from "@/lib/settings-types";
import type { Voucher } from "@/data/storeConfig";
import { buildTrackingUrl, templateFromSampleLink } from "@/lib/tracking";

const inputClass =
  "w-full rounded-xl border border-stone-300 bg-stone-50 px-3.5 py-2.5 text-sm text-stone-800 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/40";

function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border border-stone-200 bg-surface p-5 shadow-soft">
      <div>
        <h2 className="font-display text-lg font-bold text-stone-900">{title}</h2>
        {hint && <p className="mt-0.5 text-xs text-stone-500">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-stone-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-stone-500">{hint}</span>}
    </label>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-stone-700">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-primary" />
      {label}
    </label>
  );
}

/** One courier: name plus an easy way to create its tracking link. */
function CourierRow({
  courier,
  onChange,
  onRemove,
}: {
  courier: StoreSettings["couriers"][number];
  onChange: (p: Partial<StoreSettings["couriers"][number]>) => void;
  onRemove: () => void;
}) {
  const [helperOpen, setHelperOpen] = useState(false);
  const [sampleLink, setSampleLink] = useState("");
  const [sampleId, setSampleId] = useState("");
  const [helperError, setHelperError] = useState("");

  const preview = buildTrackingUrl(courier.trackingUrl, "123456789");

  const createFromSample = () => {
    const template = templateFromSampleLink(sampleLink, sampleId);
    if (!template) {
      setHelperError("The link must start with https:// and contain the tracking number you typed.");
      return;
    }
    setHelperError("");
    onChange({ trackingUrl: template });
    setHelperOpen(false);
  };

  return (
    <div className="space-y-3 rounded-xl border border-stone-200 p-4">
      <div className="grid grid-cols-[1fr_auto] items-end gap-3 sm:grid-cols-[1fr_2fr_auto]">
        <Field label="Courier name">
          <input value={courier.name} onChange={(e) => onChange({ name: e.target.value })} className={inputClass} />
        </Field>
        <div className="col-span-2 sm:col-span-1">
          <Field label="Tracking link (made for you below)">
            <input value={courier.trackingUrl} onChange={(e) => onChange({ trackingUrl: e.target.value })} className={`${inputClass} font-mono text-xs`} placeholder="Not set up yet" />
          </Field>
        </div>
        <button type="button" onClick={onRemove} aria-label="Remove courier" className="mb-1 rounded-lg p-2.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {preview ? (
        <p className="text-xs text-stone-600">
          Customers will get a <strong>Track parcel</strong> button. Test it with a sample number:{" "}
          <a href={preview} target="_blank" rel="noopener noreferrer" className="font-bold text-heading underline">
            open the tracking page
          </a>
        </p>
      ) : (
        <p className="text-xs text-stone-500">Without a tracking link, customers only see the courier name and tracking number.</p>
      )}

      <button type="button" onClick={() => setHelperOpen((v) => !v)} className="text-xs font-bold text-heading underline cursor-pointer">
        {helperOpen ? "Close" : "Set up the tracking link the easy way"}
      </button>

      {helperOpen && (
        <div className="space-y-3 rounded-xl bg-gold-50 p-4 text-xs text-gold-900">
          <ol className="list-decimal space-y-1 pl-4">
            <li>Open the courier&apos;s website and track any parcel (yours or a friend&apos;s).</li>
            <li>Copy the address of the result page from your browser and paste it below.</li>
            <li>Type the tracking number you used, then press Create.</li>
          </ol>
          <input value={sampleLink} onChange={(e) => setSampleLink(e.target.value)} className={inputClass} placeholder="https://courier.com/track/result?cn=123456789" />
          <input value={sampleId} onChange={(e) => setSampleId(e.target.value)} className={inputClass} placeholder="The tracking number, e.g. 123456789" />
          {helperError && <p role="alert" className="font-semibold text-rose-700">{helperError}</p>}
          <button type="button" onClick={createFromSample} className="rounded-full bg-primary px-5 py-2 text-xs font-bold text-white hover:bg-primary-hover cursor-pointer">
            Create the link
          </button>
        </div>
      )}
    </div>
  );
}

export default function SettingsEditor({
  initial,
  gateways = [],
}: {
  initial: StoreSettings;
  /** Online payment providers installed on the server (empty until one is added). */
  gateways?: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [s, setS] = useState<StoreSettings>(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const patch = <K extends keyof StoreSettings>(key: K, value: Partial<StoreSettings[K]>) =>
    setS((prev) => ({ ...prev, [key]: { ...(prev[key] as object), ...(value as object) } as StoreSettings[K] }));

  const setPayment = (i: number, p: Partial<StoreSettings["payments"][number]>) =>
    setS((prev) => ({ ...prev, payments: prev.payments.map((m, j) => (j === i ? { ...m, ...p } : m)) }));
  const setPaymentAccount = (i: number, a: Partial<StoreSettings["payments"][number]["accountDetails"]>) =>
    setS((prev) => ({
      ...prev,
      payments: prev.payments.map((m, j) => (j === i ? { ...m, accountDetails: { ...m.accountDetails, ...a } } : m)),
    }));
  const setVoucher = (i: number, v: Partial<Voucher>) =>
    setS((prev) => ({ ...prev, vouchers: prev.vouchers.map((x, j) => (j === i ? { ...x, ...v } : x)) }));

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not save the settings");
      setMessage({ text: "Saved. Changes are live.", ok: true });
      router.refresh();
    } catch (e) {
      setMessage({ text: e instanceof Error ? e.message : "Could not save the settings", ok: false });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card title="Contact details" hint="Shown in the header, footer, Contact page and WhatsApp buttons.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="WhatsApp number" hint="Digits with country code, e.g. 923001234567">
            <input value={s.contact.whatsapp} onChange={(e) => patch("contact", { whatsapp: e.target.value })} className={inputClass} inputMode="numeric" />
          </Field>
          <Field label="Phone / helpline (as shown to customers)">
            <input value={s.contact.phone} onChange={(e) => patch("contact", { phone: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Support email">
            <input type="email" value={s.contact.supportEmail} onChange={(e) => patch("contact", { supportEmail: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Sales email">
            <input type="email" value={s.contact.salesEmail} onChange={(e) => patch("contact", { salesEmail: e.target.value })} className={inputClass} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Address (optional)">
              <input value={s.contact.address} onChange={(e) => patch("contact", { address: e.target.value })} className={inputClass} />
            </Field>
          </div>
        </div>
      </Card>

      <Card title="Store switches and stock" hint="Useful during holidays or when you are very busy.">
        <Toggle checked={s.orders.acceptingOrders} onChange={(v) => patch("orders", { acceptingOrders: v })} label="Accept new orders (switch off to pause ordering)" />
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <Field label="Message shown while orders are paused">
              <input value={s.orders.closedMessage} onChange={(e) => patch("orders", { closedMessage: e.target.value })} className={inputClass} maxLength={200} />
            </Field>
          </div>
          <Field label="Minimum order amount (Rs.)" hint="0 = no minimum">
            <input type="number" min={0} value={s.orders.minOrderAmount} onChange={(e) => patch("orders", { minOrderAmount: Number(e.target.value) })} className={inputClass} />
          </Field>
          <Field label="Low stock warning at (units)" hint="Shown on products and the dashboard">
            <input type="number" min={0} value={s.inventory.lowStockThreshold} onChange={(e) => patch("inventory", { lowStockThreshold: Number(e.target.value) })} className={inputClass} />
          </Field>
        </div>
      </Card>

      <Card title="Reward coins" hint="Customers earn coins on delivered orders and spend them at checkout.">
        <Toggle checked={s.rewards.enabled} onChange={(v) => patch("rewards", { enabled: v })} label="Reward coins are on" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Coins earned (% of order value)" hint="2 means a Rs. 1,000 order gives 20 coins">
            <input type="number" min={0} max={50} value={s.rewards.earnPercent} onChange={(e) => patch("rewards", { earnPercent: Number(e.target.value) })} className={inputClass} />
          </Field>
          <Field label="Value of 1 coin (Rs.)">
            <input type="number" min={1} value={s.rewards.coinValue} onChange={(e) => patch("rewards", { coinValue: Number(e.target.value) })} className={inputClass} />
          </Field>
          <Field label="Coins can pay up to (% of order)">
            <input type="number" min={0} max={100} value={s.rewards.maxRedeemPercent} onChange={(e) => patch("rewards", { maxRedeemPercent: Number(e.target.value) })} className={inputClass} />
          </Field>
        </div>
      </Card>

      <Card title="Social media links" hint="Shown in the footer. Leave empty to hide. Links must start with https://">
        <div className="grid gap-4 sm:grid-cols-2">
          {(["facebook", "instagram", "tiktok", "youtube"] as const).map((key) => (
            <Field key={key} label={key.charAt(0).toUpperCase() + key.slice(1)}>
              <input value={s.social[key]} onChange={(e) => patch("social", { [key]: e.target.value })} className={inputClass} placeholder={`https://${key}.com/yourshop`} />
            </Field>
          ))}
        </div>
      </Card>

      <Card title="Delivery and returns">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Delivery charge (Rs.)">
            <input type="number" min={0} value={s.shipping.fee} onChange={(e) => patch("shipping", { fee: Number(e.target.value) })} className={inputClass} />
          </Field>
          <Field label="Free delivery above (Rs.)" hint="0 = always free">
            <input type="number" min={0} value={s.shipping.freeThreshold} onChange={(e) => patch("shipping", { freeThreshold: Number(e.target.value) })} className={inputClass} />
          </Field>
          <Field label="Delivery time">
            <input value={s.shipping.deliveryDays} onChange={(e) => patch("shipping", { deliveryDays: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Return window (days)">
            <input type="number" min={0} value={s.shipping.returnDays} onChange={(e) => patch("shipping", { returnDays: Number(e.target.value) })} className={inputClass} />
          </Field>
        </div>
      </Card>

      <Card title="Sale offers" hint="Product discounts are set per product (Old price field). Here you control the banners.">
        <Toggle checked={s.announcement.enabled} onChange={(v) => patch("announcement", { enabled: v })} label="Show an announcement in the top bar (replaces the free-delivery message)" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Announcement text">
            <input value={s.announcement.text} onChange={(e) => patch("announcement", { text: e.target.value })} className={inputClass} placeholder="Eid sale: up to 20% off dry fruits" maxLength={140} />
          </Field>
          <Field label="Link (optional)" hint="e.g. /shop?cat=sale">
            <input value={s.announcement.link} onChange={(e) => patch("announcement", { link: e.target.value })} className={inputClass} />
          </Field>
        </div>
        <Toggle checked={s.sale.enabled} onChange={(v) => patch("sale", { enabled: v })} label="Show the offer banner on the home page" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Banner headline">
            <input value={s.sale.headline} onChange={(e) => patch("sale", { headline: e.target.value })} className={inputClass} maxLength={100} />
          </Field>
          <Field label="Banner text">
            <input value={s.sale.subtext} onChange={(e) => patch("sale", { subtext: e.target.value })} className={inputClass} maxLength={240} />
          </Field>
        </div>
      </Card>

      <Card title="Payment methods" hint="Customers see these at checkout. Put your real account numbers here.">
        <div className="space-y-4">
          {s.payments.map((m, i) => (
            <div key={m.id} className="rounded-xl border border-stone-200 p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <p className="font-bold text-stone-800">{m.name}</p>
                <Toggle checked={m.isActive} onChange={(v) => setPayment(i, { isActive: v })} label="Available to customers" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Name shown at checkout">
                  <input value={m.name} onChange={(e) => setPayment(i, { name: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Instant discount (%)">
                  <input type="number" min={0} max={50} value={m.discountPercent} onChange={(e) => setPayment(i, { discountPercent: Number(e.target.value) })} className={inputClass} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Short description">
                    <input value={m.subtitle} onChange={(e) => setPayment(i, { subtitle: e.target.value })} className={inputClass} />
                  </Field>
                </div>
                {m.id !== "cod" && gateways.length > 0 && (
                  <div className="sm:col-span-2">
                    <Field label="Online payment provider" hint="Choose one to send customers to a secure payment page. Leave on 'Manual' to keep sending money to your account number.">
                      <select value={m.gateway ?? ""} onChange={(e) => setPayment(i, { gateway: e.target.value || undefined })} className={inputClass}>
                        <option value="">Manual (customer sends money, enters transaction ID)</option>
                        {gateways.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                )}
                {m.id !== "cod" && (
                  <>
                    <Field label="Account title">
                      <input value={m.accountDetails.title} onChange={(e) => setPaymentAccount(i, { title: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Account / wallet number">
                      <input value={m.accountDetails.accountNumber} onChange={(e) => setPaymentAccount(i, { accountNumber: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="IBAN (optional)">
                      <input value={m.accountDetails.iban ?? ""} onChange={(e) => setPaymentAccount(i, { iban: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Raast ID (optional)">
                      <input value={m.accountDetails.raastId ?? ""} onChange={(e) => setPaymentAccount(i, { raastId: e.target.value })} className={inputClass} />
                    </Field>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Discount coupons" hint="Customers type the code at checkout. Percent coupons take a % off, flat coupons take an amount off.">
        <div className="space-y-3">
          {s.vouchers.map((v, i) => (
            <div key={i} className="grid grid-cols-2 items-end gap-3 rounded-xl border border-stone-200 p-3 sm:grid-cols-[1.2fr_1fr_1fr_1fr_1.2fr_auto]">
              <Field label="Code">
                <input value={v.code} onChange={(e) => setVoucher(i, { code: e.target.value.toUpperCase() })} className={`${inputClass} font-mono`} />
              </Field>
              <Field label="Type">
                <select value={v.type} onChange={(e) => setVoucher(i, { type: e.target.value as Voucher["type"] })} className={inputClass}>
                  <option value="percent">Percent %</option>
                  <option value="flat">Flat Rs.</option>
                </select>
              </Field>
              <Field label={v.type === "percent" ? "Discount %" : "Discount Rs."}>
                <input type="number" min={1} value={v.discount} onChange={(e) => setVoucher(i, { discount: Number(e.target.value) })} className={inputClass} />
              </Field>
              <Field label="Min. order Rs.">
                <input type="number" min={0} value={v.minSpend} onChange={(e) => setVoucher(i, { minSpend: Number(e.target.value) })} className={inputClass} />
              </Field>
              <Field label="Last valid day">
                <input type="date" value={v.expiresAt ?? ""} onChange={(e) => setVoucher(i, { expiresAt: e.target.value })} className={inputClass} />
              </Field>
              <button type="button" onClick={() => setS((p) => ({ ...p, vouchers: p.vouchers.filter((_, j) => j !== i) }))} aria-label="Remove coupon" className="mb-1 rounded-lg p-2.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer">
                <Trash2 className="h-4 w-4" />
              </button>
              <div className="col-span-2 flex flex-wrap gap-5 sm:col-span-6">
                <Toggle checked={v.isActive} onChange={(x) => setVoucher(i, { isActive: x })} label="Active" />
                <Toggle checked={!!v.showOnHome} onChange={(x) => setVoucher(i, { showOnHome: x })} label="Show on the home page banner" />
              </div>
            </div>
          ))}
          <button type="button" onClick={() => setS((p) => ({ ...p, vouchers: [...p.vouchers, { code: "", type: "percent", discount: 10, minSpend: 0, isActive: true }] }))} className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 px-4 py-2 text-xs font-bold text-stone-700 hover:border-gold-500 cursor-pointer">
            <Plus className="h-3.5 w-3.5" /> Add coupon
          </button>
        </div>
      </Card>

      <Card
        title="Couriers and parcel tracking"
        hint="Add the couriers you use. To get a Track parcel button for customers, set up the courier's tracking link below (it takes one minute)."
      >
        <div className="space-y-4">
          {s.couriers.map((c, i) => (
            <CourierRow
              key={i}
              courier={c}
              onChange={(p) => setS((prev) => ({ ...prev, couriers: prev.couriers.map((x, j) => (j === i ? { ...x, ...p } : x)) }))}
              onRemove={() => setS((prev) => ({ ...prev, couriers: prev.couriers.filter((_, j) => j !== i) }))}
            />
          ))}
          <button type="button" onClick={() => setS((p) => ({ ...p, couriers: [...p.couriers, { name: "", trackingUrl: "" }] }))} className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 px-4 py-2 text-xs font-bold text-stone-700 hover:border-gold-500 cursor-pointer">
            <Plus className="h-3.5 w-3.5" /> Add courier
          </button>
        </div>
      </Card>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-stone-200 bg-surface/95 p-4 shadow-lift backdrop-blur">
        <button type="button" onClick={save} disabled={saving} className="rounded-full bg-primary px-8 py-3 text-sm font-bold text-white transition hover:bg-primary-hover disabled:opacity-60 cursor-pointer">
          {saving ? "Saving..." : "Save all settings"}
        </button>
        {message && (
          <p role="status" className={`text-sm font-semibold ${message.ok ? "text-leaf-700" : "text-rose-600"}`}>
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}
