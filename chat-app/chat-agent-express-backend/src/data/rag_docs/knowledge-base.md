# Company Knowledge Base

This document is the single source of truth for store policies and customer support
questions. It is chunked and embedded by the RAG pipeline, so each section should stay
self-contained and answer one topic.

All prices, refunds and shipping fees are in US dollars (USD) unless stated otherwise.

## Order Status

Every order moves through one of these statuses. The status shown in the account's
**Orders** section is the current one.

| Status       | Meaning                                            | Can the customer still cancel? |
| ------------ | -------------------------------------------------- | ------------------------------ |
| `pending`    | Order received, payment authorised, not yet picked | Yes                            |
| `processing` | Being picked and packed in the warehouse           | Yes, if it has not been packed |
| `shipped`    | Handed to the carrier, tracking is available       | No, use the returns process    |
| `delivered`  | Carrier confirmed delivery                         | No, use the returns process    |
| `cancelled`  | Order was cancelled and will not ship              | Not applicable                 |

## Refund Policy

Customers may request a refund within **30 days of delivery**. To be eligible:

- The item must be in its original condition, unused, with all tags and accessories.
- The original packaging and proof of purchase (order ID) are required.
- Items damaged on arrival must be reported within **48 hours** with photos.

Refunds are issued to the original payment method once the returned item passes
inspection. Inspection takes up to 3 business days after the parcel arrives, and the
refund itself is visible within 5–7 business days depending on the bank.

Non-refundable: gift cards, digital downloads, and items marked final sale. Shipping
fees are refunded only when the return is caused by a wrong, damaged or faulty item.

## Order Cancellation

- Orders in `pending` or `processing` can be cancelled from the account's **Orders**
  page, or by contacting support with the order ID.
- Once an order is `shipped`, it cannot be cancelled. The customer can refuse the
  delivery or return it after it arrives.
- If a cancellation succeeds, the pre-authorised amount is released within 3–5
  business days.
- Orders cancelled by the store (out of stock, failed payment verification) are
  refunded in full automatically.

## Shipping Policy

- We ship to the countries listed at checkout; availability depends on the destination.
- Standard delivery takes 3–7 business days; express takes 1–3 business days.
- Shipping fees are calculated at checkout by destination and weight. Gold-tier
  customers get free standard shipping; Silver-tier customers get free standard
  shipping on orders over $50.
- Tracking numbers are emailed when the order changes to `shipped`. Tracking can also
  be found under **Orders** in the account.
- We do not ship to PO boxes for orders containing monitors or other large items.
- Customs duties and import taxes are the customer's responsibility.

## Customer Support

- Email: support@example.com
- Live chat: Monday–Friday, 09:00–18:00 (UTC+6:30). Outside those hours, leave a
  message and we reply the next business day.
- Always include the order ID and the email used at checkout so we can find the order
  quickly.
- Response time target: 1 business day for email, under 10 minutes for live chat during
  business hours.
- Escalations and complaints are reviewed by a supervisor within 2 business days.

## Product Warranty

- Electronics (monitors, keyboards, headphones, webcams, hubs) carry a **12-month**
  limited warranty from the delivery date.
- Accessories and desk items (mice, cables, stands, lamps, phone cases) carry a
  **6-month** limited warranty.
- The warranty covers manufacturing defects and hardware failures under normal use.
- The warranty does **not** cover accidental damage, liquid damage, normal wear,
  unauthorised repairs, or damage from improper power supplies.
- Claims require the order ID and a description (photos or a short video help). Approved
  claims are repaired, replaced, or refunded at our discretion.

## Account & Login Issues

- **Forgot password:** use _Forgot Password_ on the login page. The reset link is sent
  to the registered email and expires after 24 hours.
- **No reset email:** check spam and promotions folders, confirm the email on the
  account, then contact support.
- **Account locked:** five failed sign-in attempts lock the account for 30 minutes.
  Wait, or reset the password to unlock immediately.
- **Change email or address:** sign in, open _Account Settings_, and update the details.
  Changes to an address do not affect orders already `shipped`.
- Support will never ask for a password, full card number, or a one-time code.

## Payment Methods

- We accept Visa, Mastercard, American Express, PayPal, and bank transfer.
- Card payments are authorised when the order is placed and captured when it ships.
- Bank-transfer orders stay `pending` until the payment clears (usually 1–2 business
  days); unpaid orders are cancelled after 5 business days.
- Prices are charged in USD. Currency conversion fees, if any, are charged by the
  customer's bank.
- We do not accept cash on delivery or cryptocurrency.
- Invoices are emailed at dispatch and are also available under **Orders**.

## Offers & Discounts

- One promo code per order. Codes cannot be combined with each other.
- Promo codes apply to the item subtotal, not to shipping or taxes, and exclude gift
  cards.
- Tier benefits: Bronze 0%, Silver 5% off every order, Gold 10% off every order plus
  free standard shipping. Tier discounts apply automatically at checkout.
- Tier is based on the customer's account tier (`bronze`, `silver`, `gold`).
- Discounts cannot be applied retroactively to an order that has already shipped.
- Sale items may be excluded from further discounts; this is stated on the product page.

## FAQ

**How do I reset my password?**
Click _Forgot Password_ on the login page and follow the link sent to the registered
email address. The link expires after 24 hours.

**What is your return policy?**
We offer a 30-day return policy for items bought directly from our website. Items must
be in their original condition with all tags attached.

**Do you ship internationally?**
Yes, to select countries worldwide. Fees and delivery times vary by destination; see the
Shipping Policy above.

**Where can I track my order?**
Sign in and open the _Orders_ section. Tracking appears there and is also emailed when
the order ships.

**Can I change my order after placing it?**
Only while it is `pending` or `processing`. Contact support with the order ID; after it
ships, use the returns process instead.

**What if my item arrives damaged?**
Report it within 48 hours with photos and your order ID. We will arrange a replacement
or refund, including shipping costs.

**Do you offer price matching?**
No. Prices at the time of purchase are final, and discounts cannot be applied after an
order has shipped.
