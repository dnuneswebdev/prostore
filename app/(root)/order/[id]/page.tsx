import {Metadata} from "next";
import {getOrderById} from "@/lib/actions/order.actions";
import {notFound} from "next/navigation";
import {ShippingAddress} from "@/@types/types";
import {auth} from "@/auth";
import OrderDetailsTable from "./order-details-table";

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

  return (
    <>
      <OrderDetailsTable
        order={order}
        isAdmin={false}
        paypalClientId={process.env.PAYPAL_CLIENT_ID || "sb"}
      />
    </>
  );
};

export default OrderDetailsPage;
