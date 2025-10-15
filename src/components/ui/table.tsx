"use client";

import React, { useState, ReactNode } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

// TypeScript interfaces
interface TableColumn<T> {
  header: string;
  accessor: keyof T | string;
  sortable?: boolean;
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
  className?: string;
  width?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  onSort?: (accessor: string, direction: 'asc' | 'desc') => void;
  responsive?: boolean;
  className?: string;
  bordered?: boolean;
}

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

// We're using Record<string, unknown> directly, so we don't need the TableRecord interface

const Table = <T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  onSort,
  responsive = true,
  className = "",
  bordered = false,
}: TableProps<T>) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const handleSort = (accessor: string) => {
    if (!onSort) return;

    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig?.key === accessor && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key: accessor, direction });
    onSort(accessor, direction);
  };

  const getSortIcon = (accessor: string) => {
    if (sortConfig?.key !== accessor) {
      return <ChevronUp className="w-4 h-4 opacity-30" />;
    }
    return sortConfig.direction === 'asc'
      ? <ChevronUp className="w-4 h-4" />
      : <ChevronDown className="w-4 h-4" />;
  };

  const renderCell = (column: TableColumn<T>, row: T, index: number): ReactNode => {
    if (column.render) {
      return column.render(row[column.accessor as keyof T], row, index);
    }

    const value = row[column.accessor as keyof T];

    // Convert value to safe ReactNode
    if (value === null || value === undefined) {
      return '';
    }

    // Handle primitive types that can be converted to string safely
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      return String(value);
    }

    // For other types, try to convert to string or return a placeholder
    try {
      return JSON.stringify(value);
    } catch {
      // Ignore the error and return a placeholder
      return '[Complex Value]';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-12 bg-gray-200 rounded mb-4"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded mb-2"></div>
        ))}
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Desktop Table */}
      <div className={`${responsive ? 'hidden lg:block' : ''} overflow-x-auto`}>
        <table
          className={`w-full border-collapse bg-white dark:bg-gray-900 rounded-lg shadow-sm 
            ${bordered ? 'border border-gray-200 dark:border-gray-700' : ''}`}
        >

          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              {columns.map((column) => (
                <th
                  key={String(column.accessor)}
                  className={`
                    text-left px-6 py-4 font-medium text-gray-900 dark:text-gray-100
                    ${column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
                    ${column.className || ''}
                  `}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(String(column.accessor))}
                  role={column.sortable ? "button" : undefined}
                  tabIndex={column.sortable ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (column.sortable && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      handleSort(String(column.accessor));
                    }
                  }}
                  aria-sort={
                    sortConfig?.key === String(column.accessor)
                      ? sortConfig.direction === 'asc' ? 'ascending' : 'descending'
                      : undefined
                  }
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && getSortIcon(String(column.accessor))}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, index) => (
                <tr
                  key={String(row.id ?? index)}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.accessor)}
                      className={`px-6 py-4 text-gray-900 dark:text-gray-100 ${column.className || ''}`}
                    >
                      {renderCell(column, row, index)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-12 text-gray-500 dark:text-gray-400"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      {responsive && (
        <div className="lg:hidden space-y-4">
          {data.length > 0 ? (
            data.map((row, index) => (
              <div
                key={String(row.id ?? index)}
                className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
              >
                {columns.map((column) => {
                  if (column.accessor === 'actions') {
                    return (
                      <div key={String(column.accessor)} className="flex justify-end mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        {renderCell(column, row, index)}
                      </div>
                    );
                  }

                  return (
                    <div key={String(column.accessor)} className="flex justify-between items-start py-2 first:pt-0 last:pb-0">
                      <span className="font-medium text-gray-500 dark:text-gray-400 text-sm">
                        {column.header}:
                      </span>
                      <span className="text-gray-900 dark:text-gray-100 text-right ml-4">
                        {renderCell(column, row, index)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No data available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Table;
export type { TableColumn };