"use client";

import {cn} from "@/lib/utils";
import Image from "next/image";
import {useState} from "react";

type ProductImagesProps = {
  images: string[];
};

export default function ProductImages({images}: ProductImagesProps) {
  const [currentImage, setCurrentImage] = useState(0);

  return (
    <div className="wrapper">
      <Image
        src={images[currentImage]}
        alt="product"
        width={1000}
        height={1000}
        className="min-h-[300px] object-cover object-center"
      />
      <div className="flex mt-4 gap-2">
        {images.map((image, index) => (
          <div
            key={image}
            className={cn(
              "border hover:border-orange-600",
              currentImage === index && "border-orange-400"
            )}
          >
            <Image
              src={image}
              alt="product image"
              width={100}
              height={100}
              onClick={() => setCurrentImage(index)}
              className="cursor-pointer"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
