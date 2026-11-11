# Shop owner guide (no coding needed)

Open **yourwebsite.com/admin** and sign in with the Google account that is listed as admin.

## Every day

### Handle new orders: Orders
1. Open **Orders**. New orders are in the **placed** tab.
2. For bank or wallet payments, compare the payment reference with your account, then set **Payment** to *verified*.
3. Set the order to **processing** while you pack it.
4. When you hand it to the courier, choose the **courier**, type the **tracking ID**, set the status to **dispatched** and press **Save**. The customer gets an email (with a Track parcel button if the courier's tracking link is set up).
5. When it arrives, set **delivered**. Reward coins are added to the customer automatically.
6. **Invoice / packing slip** prints a slip. **Send status update on WhatsApp** opens a ready message.

To cancel an order choose **cancelled**. Stock and coins go back automatically.

### Answer people
- **Messages:** messages from the Contact page, with reply buttons.
- **Reviews:** press **Approve and publish** to show a review in the store.

## Products
**Products > Add product.** Fill in the name, category, description, pack sizes (for example 250g, 500g, 1kg) with prices and stock. Press **Upload from device** for photos (or paste an image link). The first photo is the main one.

- **Run a sale:** type the old, higher price in **Old price**. Customers see it crossed out with a % badge. Clear it to end the sale.
- **Hide a product** with *Visible in store* off. **Best seller** shows it on the home page.
- Stock reaching 0 shows *Out of stock* automatically.

## Categories
**Categories** lets you add sections (for example Pickles), rename them, change colours and picture style, and reorder them. The first category is shown large on the home page. A category with products cannot be removed.

## Settings
**Settings** controls:
- Contact details, social links, delivery charge, free-delivery limit, delivery time, return days
- **Pause orders** during holidays, and a minimum order amount
- Announcement bar and home offer banner
- **Payment methods:** your real JazzCash, EasyPaisa, SadaPay and bank account numbers
- **Coupons:** code, percent or flat amount, minimum order and last valid day
- **Reward coins:** how many coins customers earn and how much of an order they can pay with coins
- **Couriers and tracking links** (see below)

### Set up a courier's Track parcel button
1. Settings > *Couriers and parcel tracking* > press **Set up the tracking link the easy way** under the courier.
2. Open the courier's website and track any parcel. Copy the address of the result page and paste it.
3. Type the tracking number you used and press **Create the link**. Press the *open the tracking page* link to test it, then **Save all settings**.

## Content
**Content** lets you change the shop name, logo, home page headline and scrolling words, the FAQ, and the text of the About page and policies. Use `## Heading`, `- bullet` and `**bold**`. Values like `{{freeThreshold}}` fill in automatically from Settings.

## Customers
**Customers** shows registered customers and their reward coins. You can add or remove coins with a note (for example a gift).

## Staff (moderators)
**Staff** is for the owner only. You can let helpers manage the shop without giving them everything.
1. Press **Add a moderator**, type their **Google or GitHub email** and tick what they may do (orders, products and stock, reviews, messages, customers and coins, categories, content).
2. Tell them to open `yourwebsite.com/admin` and sign in with **Google or GitHub using that same email** (a password login does not work for staff).
3. Change their access or remove them at any time. Removing keeps their account as a normal customer.

Moderators can never open **Settings** (payment accounts, coupons, delivery), **Staff** or **Activity**, and they do not see revenue on the dashboard.

**Activity** lists the last 200 changes (who changed an order, product, review, coins, settings...). Use it to see what your helpers did.

## Tips
- Changes appear on the store within about a minute.
- Never share your admin Google account.
- If something looks wrong, tell your developer what you clicked and what you saw.
