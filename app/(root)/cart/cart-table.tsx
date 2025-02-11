"use client";

import {useRouter} from "next/navigation";
import {useToast} from "@/hooks/use-toast";
import {useTransition} from "react";
import {addItemToCart, removeItemFromCart} from "@/lib/actions/cart.actions";
import {ArrowRight, LoaderCircle, Minus, Plus} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Cart, CartItem} from "@/@types/types";
import {formatCurrency} from "@/lib/utils";

type CartTableProps = {
  cart: Cart;
};

export const CartTable = ({cart}: CartTableProps) => {
  const router = useRouter();
  const {toast} = useToast();
  const [isPending, startTransition] = useTransition();

  const handleAddOrRemoveItem = (item: CartItem, type: string) => {
    startTransition(async () => {
      if (type === "add") {
        const response = await addItemToCart(item);

        if (!response.success) handleResponseError(response);
      } else if (type === "remove") {
        const response = await removeItemFromCart(item.productId);

        if (!response.success) handleResponseError(response);
      }
    });
  };

  const handleResponseError = (response: any) => {
    return toast({
      variant: "destructive",
      description: response.message,
    });
  };

  return (
    <>
      <h1 className="py-4 h2-bold mb-4">Shopping Cart</h1>
      {!cart || cart.items.length === 0 ? (
        <div>
          Cart is empty. <Link href="/">Go Shopping</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-4 md:gap-5">
          <div className="overflow-x-auto md:col-span-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.items.map((item: CartItem) => (
                  <TableRow key={item.slug}>
                    <TableCell>
                      <Link
                        href={`/product/${item.slug}`}
                        className="flex items-center"
                      >
                        <Image
                          src={item.image}
                          alt={`${item.name} image`}
                          width={50}
                          height={50}
                        />
                        <span className="px-2">{item.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell className="flex-center gap-2">
                      <Button
                        disabled={isPending}
                        variant="outline"
                        type="button"
                        onClick={() => handleAddOrRemoveItem(item, "remove")}
                      >
                        {isPending ? (
                          <LoaderCircle className="w-4 h-4 animate-spin" />
                        ) : (
                          <Minus className="w-4 h-4" />
                        )}
                      </Button>
                      <span>{item.qty}</span>
                      <Button
                        disabled={isPending}
                        variant="outline"
                        type="button"
                        onClick={() => handleAddOrRemoveItem(item, "add")}
                      >
                        {isPending ? (
                          <LoaderCircle className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">{item.price}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Card>
            <CardContent className="p-4 gap-4 flex flex-col items-center justify-center h-full">
              <div className="pb-3 text-xl">
                Subtotal (
                {cart.items.reduce(
                  (acc: any, item: CartItem) => acc + item.qty,
                  0
                )}
                ):
                <span className="font-bold ml-2">
                  {formatCurrency(cart.itemsPrice)}
                </span>
              </div>
              <Button
                className="w-full"
                disabled={isPending}
                onClick={() =>
                  startTransition(() => router.push("/shipping-address"))
                }
              >
                {isPending ? (
                  <LoaderCircle className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}{" "}
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};
