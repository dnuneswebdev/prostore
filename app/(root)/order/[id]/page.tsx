import {Metadata} from "next";
import {getOrderById} from "@/lib/actions/order.actions";
import {notFound} from "next/navigation";
import {ShippingAddress} from "@/@types/types";
import {auth} from "@/auth";
import OrderDetailsTable from "./order-details-table";
import Stripe from "stripe";

export const metadata: Metadata = {
  title: "Order Details",
};

type OrderDetailsPageProps = {
  params: Promise<{id: string}>;
};

const OrderDetailsPage = async ({params}: OrderDetailsPageProps) => {
  const {id} = await params;

  const order = await getOrderById(id);

  if (!order) return notFound();

  const session = await auth();
  const isAdmin = session?.user?.role === "admin" || false;

  let client_secret = null;

  //check if not paid and using stripe
  if (order.paymentMethod === "Stripe" && !order.isPaid) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

    //create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.totalPrice) * 100),
      currency: "USD",
      payment_method_types: ["card"],
      metadata: {orderId: order.id},
    });

    client_secret = paymentIntent.client_secret;
  }

  return (
    <>
      <OrderDetailsTable
        order={order}
        isAdmin={isAdmin}
        paypalClientId={process.env.PAYPAL_CLIENT_ID || "sb"}
        stripeClientSecret={client_secret}
      />
    </>
  );
};

export default OrderDetailsPage;
