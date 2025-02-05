import {cn} from "@/lib/utils";

type ProductPriceProps = {
  price: number;
  className?: string;
};

const ProductPrice = ({price, className}: ProductPriceProps) => {
  const stringValue = price.toFixed(2); // Convert the value to a string with 2 decimal places
  const [intValue, floatValue] = stringValue.split("."); // Split the string into an integer and a float

  return (
    <p className={cn("text-2xl", className)}>
      <span className="text-xs align-super">$</span>
      {intValue}
      <span className="text-xs align-super">.{floatValue}</span>
    </p>
  );
};

export default ProductPrice;
