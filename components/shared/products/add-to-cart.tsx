"use client";

import {Cart, CartItem} from "@/@types/types";
import {Button} from "@/components/ui/button";
import {ToastAction} from "@/components/ui/toast";
import {useToast} from "@/hooks/use-toast";
import {addItemToCart, removeItemFromCart} from "@/lib/actions/cart.actions";
import {Plus, Minus, LoaderCircle} from "lucide-react";
import {useRouter} from "next/navigation";
import {useTransition} from "react";

type AddToCartProps = {
  item: CartItem;
  cart?: Cart;
};

const AddToCart = ({item, cart}: AddToCartProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {toast} = useToast();

  const handleAddToCart = async () => {
    startTransition(async () => {
      const response = await addItemToCart(item);

      if (!response.success) {
        toast({description: response.message, variant: "destructive"});
        return;
      }

      toast({
        description: response.message,
        action: (
          <ToastAction
            className="bg-primary text-white hover:bg-gray-800"
            altText="Go To Cart"
            onClick={() => router.push("/cart")}
          >
            Go To Cart
          </ToastAction>
        ),
      });
    });
  };

  const handleRemoveFromCart = async () => {
    startTransition(async () => {
      const response = await removeItemFromCart(item.productId);

      toast({
        description: response.message,
        variant: response.success ? "default" : "destructive",
      });

      return;
    });
  };

  //check if item is already in the cart
  const existingItem =
    cart &&
    cart?.items.find((cartItem: Cart) => cartItem.productId === item.productId);

  return existingItem ? (
    <div>
      <Button
        variant="outline"
        type="button"
        onClick={handleRemoveFromCart}
        size="sm"
      >
        {isPending ? (
          <LoaderCircle className="w-4 h-4 animate-spin" />
        ) : (
          <Minus className="w-1 h-1" />
        )}
      </Button>
      <span className="px-2">{existingItem.qty}</span>
      <Button
        variant="outline"
        type="button"
        onClick={handleAddToCart}
        size="sm"
      >
        {isPending ? (
          <LoaderCircle className="w-4 h-4 animate-spin" />
        ) : (
          <Plus className="w-1 h-1" />
        )}
      </Button>
    </div>
  ) : (
    <Button
      variant="default"
      className="w-full"
      type="button"
      onClick={handleAddToCart}
    >
      {isPending ? (
        <LoaderCircle className="w-4 h-4 animate-spin" />
      ) : (
        <Plus className="w-4 h-4" />
      )}
      Add to Cart
    </Button>
  );
};

export default AddToCart;
