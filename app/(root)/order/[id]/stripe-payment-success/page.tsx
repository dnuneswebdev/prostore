import {Button} from "@/components/ui/button";
import {getOrderById} from "@/lib/actions/order.actions";
import {get} from "http";
import Link from "next/link";
import {notFound, redirect} from "next/navigation";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

type StripePaymentSuccessPageProps = {
  params: Promise<{id: string}>;
  searchParams: Promise<{payment_intent: string}>;
};

const StripePaymentSuccessPage = async ({
  params,
  searchParams,
}: StripePaymentSuccessPageProps) => {
  const {id} = await params;
  const {payment_intent: paymentIntentId} = await searchParams;
  const order = getOrderById(id);

  if (!order) return notFound();

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.metadata.orderId == null) {
    return notFound();
  }

  // Check if payment is successful
  const isSuccess = paymentIntent.status === "succeeded";

  if (!isSuccess) return redirect(`/order/${id}`);

  return (
    <div className="max-w-4xl w-full mx-auto space-y-8">
      <div className="flex flex-col gap-6 items-center">
        <h1 className="h1-bold">Thanks for your purchase</h1>
        <div>We are processing your order.</div>
        <Button asChild>
          <Link href={`/order/${id}`}>View Order</Link>
        </Button>
      </div>
    </div>
  );
};

export default StripePaymentSuccessPage;
