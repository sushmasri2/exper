"use client";

import React from "react";
import { Button } from "@/components/ui/button";

type PaginationProps = {
  pagination: {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
    links: {
      next: string | null;
      prev: string | null;
      first: string;
      last: string;
    };
  };
  onPageChange: (url: string, page: number) => void;
};

export default function Pagination({ pagination, onPageChange }: PaginationProps) {
  if (pagination.totalPages === 0) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-4">
      {/* First Page */}
      <Button
        variant="outline"
        disabled={!pagination.hasPrev}
        onClick={() => onPageChange(pagination.links.first, 1)}
      >
        First
      </Button>

      {/* Prev */}
      <Button
        variant="outline"
        disabled={!pagination.hasPrev}
        onClick={() => pagination.links.prev && onPageChange(pagination.links.prev, pagination.page - 1)}
      >
        Prev
      </Button>

      {/* Current Page Info */}
      <span className="px-3">
        Page <strong>{pagination.page}</strong> of {pagination.totalPages}
      </span>

      {/* Next */}
      <Button
        variant="outline"
        disabled={!pagination.hasNext}
        onClick={() => pagination.links.next && onPageChange(pagination.links.next, pagination.page + 1)}
      >
        Next
      </Button>

      {/* Last Page */}
      <Button
        variant="outline"
        disabled={!pagination.hasNext}
        onClick={() => onPageChange(pagination.links.last, pagination.totalPages)}
      >
        Last
      </Button>
    </div>
  );
}
