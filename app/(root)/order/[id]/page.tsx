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

  const session = await auth();
  const isAdmin = session?.user?.role === "admin" || false;

  return (
    <>
      <OrderDetailsTable
        order={order}
        isAdmin={isAdmin}
        paypalClientId={process.env.PAYPAL_CLIENT_ID || "sb"}
      />
    </>
  );
};

export default OrderDetailsPage;
