"use client";

import {useRouter} from "next/navigation";
import {Check, LoaderCircle} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useFormStatus} from "react-dom";
import {createOrder} from "@/lib/actions/order.actions";

const PlaceOrderForm = () => {
  const router = useRouter();

  const handlePlaceOrder = async (event: React.FormEvent) => {
    event.preventDefault();

    const response = await createOrder();

    if (response.redirectTo) router.push(response.redirectTo);
  };

  const PlaceOrderButton = () => {
    const {pending} = useFormStatus();

    return (
      <Button disabled={pending} className="w-full">
        {pending ? (
          <LoaderCircle className="w-4 h-4 animate-spin" />
        ) : (
          <Check className="w-4 h-4" />
        )}{" "}
        Place Order
      </Button>
    );
  };

  return (
    <form onSubmit={handlePlaceOrder} className="w-full">
      <PlaceOrderButton />
    </form>
  );
};

export default PlaceOrderForm;
