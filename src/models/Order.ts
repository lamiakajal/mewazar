import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderItem {
  productId: string;
  name: string;
  image: string;
  weight: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  userId?: mongoose.Types.ObjectId; // Optional for guest checkout
  isGuest: boolean;
  orderNumber: string;
  items: IOrderItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    postalCode?: string;
  };
  paymentMethod: "cod" | "jazzcash" | "easypaisa" | "sadapay" | "meezan";
  paymentStatus: "pending" | "verified" | "failed" | "refunded";
  transactionId?: string;
  voucherCode?: string;
  trackingId?: string;
  courier?: string;
  adminNote?: string;
  paymentGateway?: string;
  gatewayRef?: string;
  coinsUsed?: number;
  coinDiscount?: number;
  coinsEarned?: number;
  coinsCredited?: boolean;
  coinsRefunded?: boolean;
  stockRestored?: boolean;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  totalAmount: number;
  orderStatus:
    | "placed"
    | "processing"
    | "dispatched"
    | "delivered"
    | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    weight: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const OrderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    isGuest: {
      type: Boolean,
      default: true,
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, default: "" },
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "jazzcash", "easypaisa", "sadapay", "meezan"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "verified", "failed", "refunded"],
      default: "pending",
    },
    transactionId: {
      type: String,
      default: "",
    },
    voucherCode: {
      type: String,
      default: "",
    },
    // Filled in by the admin when the parcel is handed to a courier
    trackingId: { type: String, default: "" },
    courier: { type: String, default: "" },
    // Reward coins: spent on this order, and earned when it is delivered
    coinsUsed: { type: Number, default: 0 },
    coinDiscount: { type: Number, default: 0 },
    coinsEarned: { type: Number, default: 0 },
    coinsCredited: { type: Boolean, default: false },
    coinsRefunded: { type: Boolean, default: false },
    // Set when the customer paid through an online payment provider
    paymentGateway: { type: String, default: "" },
    gatewayRef: { type: String, default: "" },
    // Private note for the shop team (never shown to the customer)
    adminNote: { type: String, default: "" },
    // Guards against restocking the same cancelled order twice
    stockRestored: { type: Boolean, default: false },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    orderStatus: {
      type: String,
      enum: ["placed", "processing", "dispatched", "delivered", "cancelled"],
      default: "placed",
    },
  },
  {
    timestamps: true,
  },
);

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
