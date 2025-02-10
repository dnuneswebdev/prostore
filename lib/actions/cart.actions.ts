"use server";

import {CartItem} from "@/@types/types";
import {convertToRegularJsObject, formatError, roundNumber} from "../utils";
import {cookies} from "next/headers";
import {auth} from "@/auth";
import {prisma} from "@/db/prisma";
import {cartItemSchema, insertCartSchema} from "../validators";
import {revalidatePath} from "next/cache";

export async function addItemToCart(data: CartItem) {
  try {
    //check cart cookie
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;

    if (!sessionCartId) throw new Error("Cart session not found");

    //get session and userID
    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined; //usa o cart como guest

    //get cart
    const cart = await getCartItems();

    //parse and validate item
    const item = cartItemSchema.parse(data);

    //find product in database
    const product = await prisma.product.findFirst({
      where: {
        id: item.productId,
      },
    });

    if (!product) throw new Error("Product not found");

    if (!cart) {
      //create new cart
      const newCart = insertCartSchema.parse({
        userId,
        sessionCartId,
        items: [item],
        ...calculateCartPrices([item]),
      });

      //add to database
      await prisma.cart.create({
        data: newCart,
      });

      //revalidate the product page
      revalidatePath(`/product/${product.slug}`);

      return {
        success: true,
        message: `${product.name} added to cart`,
      };
    } else {
      //check if item is already in the cart
      const existingItem = cart.items.find(
        (i) => i.productId === item.productId
      );

      if (existingItem) {
        //check stock first
        if (product.stock < existingItem.qty + 1) {
          throw new Error("Not enough stock");
        }

        //update existing item qty
        cart.items.find((i) => i.productId === item.productId).qty =
          existingItem.qty + 1;
      } else {
        //if item doesnt exist in cart
        //check stock first
        if (product.stock < 1) throw new Error("Not enough stock");

        cart.items.push(item);
      }

      //save to database
      await prisma.cart.update({
        where: {
          id: cart.id,
        },
        data: {
          items: cart.items,
          ...calculateCartPrices(cart.items),
        },
      });

      //revalidate the product page
      revalidatePath(`/product/${product.slug}`);

      return {
        success: true,
        message: `${product.name} ${
          existingItem ? "quantity updated in" : "added to"
        }  cart`,
      };
    }
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function getCartItems() {
  //check cart cookie
  const sessionCartId = (await cookies()).get("sessionCartId")?.value;

  if (!sessionCartId) throw new Error("Cart session not found");

  //get session and userID
  const session = await auth();
  const userId = session?.user?.id ? (session.user.id as string) : undefined;

  //get user cart from the database
  const cart = await prisma.cart.findFirst({
    where: userId
      ? {
          userId: userId,
        }
      : {sessionCartId: sessionCartId},
  });

  if (!cart) return undefined;

  //convert decimals and return
  return convertToRegularJsObject({
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
  });
}

//remove item from cart
export async function removeItemFromCart(productId: string) {
  try {
    // Check for cart cookie
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("Cart session not found");

    // Get Product
    const product = await prisma.product.findFirst({
      where: {id: productId},
    });
    if (!product) throw new Error("Product not found");

    // Get user cart
    const cart = await getCartItems();
    if (!cart) throw new Error("Cart not found");

    // Check for item
    const exist = cart.items.find((i) => i.productId === productId);
    if (!exist) throw new Error("Item not found");

    // Check if only one in qty
    if (exist.qty === 1) {
      // Remove from cart
      cart.items = cart.items.filter((i) => i.productId !== exist.productId);
    } else {
      // Decrease qty
      cart.items.find((i) => i.productId === productId).qty = exist.qty - 1;
    }

    // Update cart in database
    await prisma.cart.update({
      where: {id: cart.id},
      data: {
        items: cart.items,
        ...calculateCartPrices(cart.items),
      },
    });

    revalidatePath(`/product/${product.slug}`);

    return {
      success: true,
      message: `${product.name} was removed from cart`,
    };
  } catch (error) {
    return {success: false, message: formatError(error)};
  }
}

//calculate cart prices
const calculateCartPrices = (items: CartItem[]) => {
  const itemsPrice = roundNumber(
      items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0)
    ),
    shippingPrice = roundNumber(itemsPrice > 100 ? 0 : 10),
    taxPrice = roundNumber(itemsPrice * 0.15),
    totalPrice = roundNumber(itemsPrice + shippingPrice + taxPrice);

  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
};
