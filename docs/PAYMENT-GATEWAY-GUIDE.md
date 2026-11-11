# Adding an online payment provider

The store already contains everything around a payment provider. You only write one small adapter file.

## What already works
- Checkout creates the order, then sends the customer to the provider's payment page (`paymentUrl`).
- `/api/payments/callback/<provider>`: the customer's browser returns here after paying.
- `/api/payments/webhook/<provider>`: the provider notifies the server directly (works even if the customer closes the browser).
- Orders are updated safely: duplicate notifications are ignored, and a "paid" message whose amount does not match the order total is not trusted (the admin gets a note instead).
- `/order-confirmed` shows the customer the result.
- Admin > Settings > Payment methods gets an "Online payment provider" selector as soon as a provider is installed.

## What you need from the provider first
1. A **merchant account** (Safepay, PayFast, JazzCash, Easypaisa or similar) and its **sandbox** credentials.
2. The provider's API documentation: how to create a payment, how the redirect works, and **how they sign** callbacks.
3. The URLs to give them:
   - Return URL: `https://YOUR-DOMAIN/api/payments/callback/<provider>`
   - Webhook URL: `https://YOUR-DOMAIN/api/payments/webhook/<provider>`

## Steps
1. Add the credentials to `.env.local` and Vercel (for example `SAFEPAY_API_KEY`, `SAFEPAY_SECRET`).
2. Create `src/lib/payments/<provider>.ts` exporting an object that implements `PaymentGateway` (see `types.ts`):
   - `isConfigured()`: true when all credentials exist.
   - `createPayment(order)`: call the provider's API and return `{ redirectUrl, providerRef }`.
   - `parseCallback(req)`: read the request, **verify the signature**, and return `{ orderNumber, status, amount, providerRef }`. Throw if anything is invalid.
3. Register it in `src/lib/payments/registry.ts`.
4. In Admin > Settings, choose the provider for the payment methods that should use it, and save.
5. Test in the provider's sandbox with a small order before going live.

## Rules to keep
- Never skip signature verification.
- Never mark an order paid from the browser return alone if the provider also offers a webhook; the webhook is the reliable source.
- Keep secrets in environment variables only.
