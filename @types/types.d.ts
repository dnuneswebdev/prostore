import {z} from "zod";
import {productSchema} from "@/lib/validators";

type Product = z.infer<typeof productSchema> & {
  id: string;
  rating: string;
  numReviews: number;
  createdAt: Date;
};

export type Cart = z.infer<typeof insertCartSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
export type Order = z.infer<typeof insertOrderSchema> & {
  id: string;
  createdAt: Date;
  isPaid: boolean;
  isDelivered: boolean;
  deliverdAt: Date;
  orderItems: OrderItem[];
  user: {
    name: string;
    email: string;
  };
};
export type OrderItem = z.infer<typeof insertOrderItemSchema>;
export type PaymentResult = z.infer<typeof paymentResultSchema>;
export type Review = z.infer<typeof insertReviewSchema> & {
  id: string;
  createdAt: Date;
  user?: {
    name: string;
  };
};
