import {CartTable} from "./cart-table";
import {getCartItems} from "@/lib/actions/cart.actions";

export const metadata = {
  title: "Shopping Cart",
};

const CartPage = async () => {
  const cart = await getCartItems();

  return (
    <>
      <CartTable cart={cart} />
    </>
  );
};

export default CartPage;
