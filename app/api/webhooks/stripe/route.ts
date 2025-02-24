import {NextRequest, NextResponse} from "next/server";
import Stripe from "stripe";
import {updateOrderToPaid} from "@/lib/actions/order.actions";

//create webhook handler
export async function POST(req: NextRequest) {
  const event = await Stripe.webhooks.constructEvent(
    await req.text(),
    req.headers.get("stripe-signature") as string,
    process.env.STRIPE_WEBHOOK_SECRET as string
  );

  //check for successful payment
  if (event.type === "charge.succeeded") {
    const {object} = event.data;

    //update order to status
    await updateOrderToPaid({
      orderId: object.metadata.orderId,
      paymentResult: {
        id: object.id,
        status: object.status,
        email_address: object.billing_details.email!,
        pricePaid: (object.amount / 100).toFixed(2),
      },
    });

    return NextResponse.json({
      message: "updateOrderToPaid was successfull",
    });
  }

  return NextResponse.json({
    message: "event was not charge.succeeded",
  });
}
