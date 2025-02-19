"use server";

import {isRedirectError} from "next/dist/client/components/redirect-error";
import {convertToRegularJsObject, formatError} from "../utils";
import {auth} from "@/auth";
import {getCartItems} from "./cart.actions";
import {getUserById} from "./user.actions";
import {insertOrderSchema} from "../validators";
import {prisma} from "@/db/prisma";
import {CartItem, PaymentResult} from "@/@types/types";
import {paypal} from "../paypal";
import {revalidatePath} from "next/cache";
import {PAGE_SIZE} from "../constants";
import {Prisma} from "@prisma/client";

export async function createOrder() {
  try {
    const session = await auth();
    if (!session) throw new Error("User is not authenticated");

    const cart = await getCartItems();
    const userId = session?.user?.id;
    if (!userId) throw new Error("User not found");

    const user = await getUserById(userId);

    if (!cart || cart.items.length === 0) {
      return {success: false, message: "Cart is empty", redirectTo: "/cart"};
    }

    if (!user.address) {
      return {
        success: false,
        message: "No shipping address",
        redirectTo: "/shipping-address",
      };
    }

    if (!user.paymentMethod) {
      return {
        success: false,
        message: "No payment method",
        redirectTo: "/payment-method",
      };
    }

    // Create order object
    const order = insertOrderSchema.parse({
      userId: user.id,
      shippingAddress: user.address,
      paymentMethod: user.paymentMethod,
      itemsPrice: cart.itemsPrice,
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
      totalPrice: cart.totalPrice,
    });

    //create transaction and order items in db
    const insertedOrderId = await prisma.$transaction(async (tx) => {
      //create order
      const insertedOrder = await tx.order.create({data: order});

      //create order items from cartItems
      for (const item of cart.items as CartItem[]) {
        await tx.orderItem.create({
          data: {
            ...item,
            orderId: insertedOrder.id,
            price: item.price,
          },
        });
      }

      //clear cart
      await tx.cart.update({
        where: {
          id: cart.id,
        },
        data: {
          items: [],
          totalPrice: 0,
          taxPrice: 0,
          shippingPrice: 0,
          itemsPrice: 0,
        },
      });

      return insertedOrder.id;
    });

    if (!insertedOrderId) throw new Error("Error creating order");

    return {
      success: true,
      message: "Order created successfully",
      redirectTo: `/order/${insertedOrderId}`,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {success: false, message: formatError(error)};
  }
}

//get order by id
export async function getOrderById(orderId: string) {
  const data = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    include: {
      orderitems: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return convertToRegularJsObject(data);
}

// Create new paypal order
export async function createPayPalOrder(orderId: string) {
  try {
    //get order from db
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (order) {
      //create paypal order
      const paypalOrder = await paypal.createOrder(Number(order.totalPrice));

      //update order with paypal order id
      await prisma.order.update({
        where: {
          id: orderId,
        },
        data: {
          paymentResult: {
            paypalOrderId: paypalOrder.id,
            email_address: "",
            status: "",
            pricePaid: 0,
          },
        },
      });

      return {
        success: true,
        message: "Order created successfully",
        data: paypalOrder.id,
      };
    } else {
      throw new Error("Order not found");
    }
  } catch (error) {
    return {success: false, message: formatError(error)};
  }
}

// Approve paypal order and update order to paid
export async function approvePayPalOrder(
  orderId: string,
  data: {orderID: string}
) {
  try {
    // Get order from database
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
      },
    });

    if (!order) throw new Error("Order not found");

    const captureData = await paypal.capturePayment(data.orderID);

    if (
      !captureData ||
      captureData.id !==
        (order.paymentResult as PaymentResult)?.paypalOrderId ||
      captureData.status !== "COMPLETED"
    ) {
      throw new Error("Error in PayPal payment");
    }

    // Update order to paid
    await updateOrderToPaid({
      orderId,
      paymentResult: {
        id: captureData.id,
        status: captureData.status,
        email_address: captureData.payer.email_address,
        pricePaid:
          captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value,
      },
    });

    revalidatePath(`/order/${orderId}`);

    return {
      success: true,
      message: "Your order has been paid",
    };
  } catch (error) {
    return {success: false, message: formatError(error)};
  }
}

export async function updateOrderToPaid({
  orderId,
  paymentResult,
}: {
  orderId: string;
  paymentResult?: PaymentResult;
}) {
  // Get order from database
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
    },
    include: {
      orderitems: true,
    },
  });

  if (!order) throw new Error("Order not found");
  if (order.isPaid) throw new Error("Order is already paid");

  // Transaction to update order and account for product stock
  await prisma.$transaction(async (tx) => {
    // Update product stock
    for (const item of order.orderitems) {
      await tx.product.update({
        where: {
          id: item.productId,
        },
        data: {
          stock: {
            decrement: item.qty,
          },
        },
      });
    }

    // Update order to paid
    await tx.order.update({
      where: {
        id: orderId,
      },
      data: {
        isPaid: true,
        paidAt: new Date(),
        paymentResult,
      },
    });
  });

  //get updated order after transaction
  const updatedOrder = await prisma.order.findFirst({
    where: {
      id: orderId,
    },
    include: {
      orderitems: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!updatedOrder) throw new Error("Error updating order");
}

//get user orders
export async function getUserOrders({
  limit = PAGE_SIZE,
  page,
}: {
  limit?: number;
  page: number;
}) {
  const session = await auth();

  if (!session) throw new Error("User is not authenticated");

  const data = await prisma.order.findMany({
    where: {
      userId: session?.user?.id!,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    skip: (page - 1) * limit,
  });

  const dataCount = await prisma.order.count({
    where: {
      userId: session?.user?.id!,
    },
  });

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

type SalesDataType = {month: string; totalSales: number}[];

//get sales data and order summary for admin dashboard
export async function getSalesDataAndOrderSummary() {
  //get counts for each resource
  const ordersCount = await prisma.order.count();
  const productsCount = await prisma.product.count();
  const usersCount = await prisma.user.count();

  //calculate the total sales
  const totalSales = await prisma.order.aggregate({
    _sum: {
      totalPrice: true,
    },
  });

  //get monthly sales data
  const salesDataRaw = await prisma.$queryRaw<
    Array<{month: string; totalSales: Prisma.Decimal}>
  >`SELECT to_char("createdAt", 'MM-YYYY') as "month", sum("totalPrice") as "totalSales" FROM "Order" GROUP BY to_char("createdAt", 'MM-YYYY')`;

  const salesData: SalesDataType = salesDataRaw.map((item) => ({
    month: item.month,
    totalSales: Number(item.totalSales),
  }));

  //get the latest orders
  const latestOrders = await prisma.order.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
    take: 5,
  });

  return {
    ordersCount,
    productsCount,
    usersCount,
    totalSales,
    salesData,
    latestOrders,
  };
}

//get all orders
export async function getAllOrders({
  limit = PAGE_SIZE,
  page,
  query,
}: {
  limit?: number;
  page: number;
  query: string;
}) {
  const queryFilter =
    query && query !== "all"
      ? {
          user: {
            name: {
              contains: query,
              mode: "insensitive",
            } as Prisma.StringFilter,
          },
        }
      : {};

  const data = await prisma.order.findMany({
    where: {
      ...queryFilter,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    skip: (page - 1) * limit,
    include: {
      //include user info from user table
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  const dataCount = await prisma.order.count(); //get total count of orders. seria como fazer o .length

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

//delete order
export async function deleteOrder(orderId: string) {
  try {
    //delete order
    await prisma.order.delete({
      where: {
        id: orderId,
      },
    });

    revalidatePath("/admin/orders");

    return {success: true, message: "Order deleted successfully"};
  } catch (error) {
    return {success: false, message: formatError(error)};
  }
}

//update COD order to paid
export async function updateOrderToPaidCOD(orderId: string) {
  try {
    await updateOrderToPaid({orderId});

    revalidatePath(`/order/${orderId}`);

    return {success: true, message: "Order marked as paid"};
  } catch (error) {
    return {success: false, message: formatError(error)};
  }
}

//update COD order to delivered
export async function updateOrderToDelivered(orderId: string) {
  try {
    //update order to delivered
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!order) throw new Error("Order not found");

    if (!order.isPaid) throw new Error("Order is not paid");

    await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        isDelivered: true,
        deliveredAt: new Date(),
      },
    });

    revalidatePath(`/order/${orderId}`);

    return {success: true, message: "Order marked as delivered"};
  } catch (error) {
    return {success: false, message: formatError(error)};
  }
}
