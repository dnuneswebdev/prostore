import {z} from "zod";
import {productSchema} from "@/lib/validators";

type Product = z.infer<typeof productSchema> & {
  id: string;
  rating: string;
  createdAt: Date;
};

export type Cart = z.infer<typeof insertCartSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
