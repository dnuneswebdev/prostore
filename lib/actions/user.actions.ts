"use server";

import {auth, signIn, signOut} from "@/auth";
import {
  shippingAddressSchema,
  signinFormSchema,
  signUpFormSchema,
} from "../validators";
import {isRedirectError} from "next/dist/client/components/redirect-error";
import {hashSync} from "bcrypt-ts-edge";
import {prisma} from "@/db/prisma";
import {formatError} from "../utils";
import {ShippingAddress} from "@/@types/types";

//sign in the user with credentials
export async function signInWithCredentials(
  prevState: unknown,
  formData: FormData
) {
  try {
    const user = signinFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    await signIn("credentials", user);

    return {success: true, message: "Sign in successful"};
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return {success: false, message: "Invalid email or password"};
  }
}

export async function signOutUser() {
  await signOut();
}

//signup the user with credentials
export async function signUpWithUser(prevState: unknown, formData: FormData) {
  try {
    const user = signUpFormSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    const plainPassword = user.password;

    user.password = hashSync(user.password, 10);

    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });

    //sign in the user after registration
    await signIn("credentials", {
      email: user.email,
      password: plainPassword, //precisa passar a senha sem hash para fazer login
    });

    return {
      success: true,
      message: "User registered successfully",
    };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return {success: false, message: formatError(error)};
  }
}

//get user by id
export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) throw new Error("User not found");

  return user;
}

//update user address
export async function updateUserAddress(shippingAddress: ShippingAddress) {
  try {
    const session = await auth();

    if (!session) throw new Error("User not authenticated");

    const currentUser = await prisma.user.findUnique({
      where: {
        id: session?.user?.id,
      },
    });

    if (!currentUser) throw new Error("User not found");

    const address = shippingAddressSchema.parse(shippingAddress);

    await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        address,
      },
    });

    return {success: true, message: "User updated successfully"};
  } catch (error) {
    return {success: false, message: formatError(error)};
  }
}
