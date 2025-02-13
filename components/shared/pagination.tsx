"use client";

import {useRouter, useSearchParams} from "next/navigation";
import {Button} from "../ui/button";
import {formUrlQuery} from "@/lib/utils";

type PaginationProps = {
  page: number | string;
  totalPages: number;
  urlParamName?: string;
};

const Pagination = ({page, totalPages, urlParamName}: PaginationProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePaginationChange = (buttonType: string) => {
    const pageValue =
      buttonType === "next" ? Number(page) + 1 : Number(page) - 1;

    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: urlParamName || "page",
      value: pageValue.toString(),
    });

    router.push(newUrl);
  };

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={Number(page) <= 1}
        onClick={() => handlePaginationChange("prev")}
      >
        Prev
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={Number(page) >= totalPages}
        onClick={() => handlePaginationChange("next")}
      >
        Next
      </Button>
    </div>
  );
};

export default Pagination;
