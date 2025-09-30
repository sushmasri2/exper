"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

// Helper to generate page numbers with ellipsis
const getPageNumbers = (current: number, total: number): (number | "...")[] => {
  if (total <= 1) return [1];
  
  const delta = 2; // how many pages around current
  const range: (number | "...")[] = [];
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  // Always include first page
  range.push(1);

  // Add ellipsis if there's a gap after page 1
  if (left > 2) {
    range.push("...");
  }

  // Add pages around current (avoiding duplicates with first/last)
  for (let i = left; i <= right; i++) {
    if (i !== 1 && i !== total) {
      range.push(i);
    }
  }

  // Add ellipsis if there's a gap before last page
  if (right < total - 1) {
    range.push("...");
  }

  // Always include last page (if different from first)
  if (total > 1) {
    range.push(total);
  }

  return range;
};

export default function Pagination({ pagination, onPageChange }: PaginationProps) {
  if (!pagination || pagination.totalPages === 0) return null;

  const pages = getPageNumbers(pagination.page, pagination.totalPages);
  
  // Debug logging
  console.log('Pagination data:', pagination);
  console.log('Generated pages:', pages);

  return (
    <div className="flex justify-center items-center gap-2 mt-4">
      {/* Prev Button */}
      <Button
        size="icon"
        disabled={!pagination.hasPrev}
        className={
          pagination.hasPrev
            ? "bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white hover:opacity-90"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }
        onClick={() => {
          if (pagination.hasPrev) {
            const prevUrl = pagination.links.prev || pagination.links.first;
            onPageChange(prevUrl, pagination.page - 1);
          }
        }}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Page Numbers with ellipsis */}
      {pages.map((p, idx) =>
        p === "..." ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">
            ...
          </span>
        ) : (
          <Button
            key={p}
            variant="outline"
            className={
              p === pagination.page
                ? "bg-[#667eea] text-white border-0 hover:opacity-90"
                : ""
            }
            onClick={() => {
              let url: string;
              if (p === 1) {
                url = pagination.links.first;
              } else if (p === pagination.totalPages) {
                url = pagination.links.last;
              } else {
                // Construct URL based on the pattern from existing links
                const baseUrl = pagination.links.first.split('?')[0];
                url = `${baseUrl}?page=${p}&limit=${pagination.limit}`;
              }
              onPageChange(url, p as number);
            }}
          >
            {p}
          </Button>
        )
      )}

      {/* Next Button */}
      <Button
        size="icon"
        disabled={!pagination.hasNext}
        className={
          pagination.hasNext
            ? "bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white hover:opacity-90"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }
        onClick={() => {
          if (pagination.hasNext) {
            const nextUrl = pagination.links.next || pagination.links.last;
            onPageChange(nextUrl, pagination.page + 1);
          }
        }}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
