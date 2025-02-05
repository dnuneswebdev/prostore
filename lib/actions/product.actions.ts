"use server";

import {prisma} from "@/db/prisma";
import {convertToRegularJsObject} from "../utils";
import {LATEST_PRODUCTS_LIMIT} from "../constants";

//get all products limited
export async function getLatestProducts() {
  const data = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: {
      createdAt: "desc",
    },
  });

  return convertToRegularJsObject(data);
}

//get single product by slug
export async function getProductBySlug(slug: string) {
  const data = await prisma.product.findFirst({
    //retornando slug que pode ser a mesma coisa que retornar o id, só mudar se quiser
    where: {
      slug,
    },
  });

  return data;
}
