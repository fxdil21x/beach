import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import Button from './Button.jsx';

export function Pagination({ children, className = '' }) {
  return (
    <nav role="navigation" aria-label="pagination" className={`mx-auto flex w-full items-center justify-center ${className}`}>
      {children}
    </nav>
  );
}

export function PaginationContent({ children, className = '' }) {
  return (
    <ul className={`flex flex-row items-center gap-1 ${className}`}>
      {children}
    </ul>
  );
}

export function PaginationItem({ children, className = '' }) {
  return <li className={className}>{children}</li>;
}

export function PaginationLink({ children, isActive = false, disabled = false, onClick, className = '' }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-40 cursor-pointer select-none ${
        isActive
          ? 'bg-blue-600 text-white shadow-xs hover:bg-blue-700'
          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function PaginationPrevious({ onClick, disabled = false, className = '' }) {
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={disabled}
      onClick={onClick}
      className={`h-8 gap-1 px-2 text-xs font-semibold ${className}`}
    >
      <ChevronLeft className="h-3.5 w-3.5" />
      <span>Previous</span>
    </Button>
  );
}

export function PaginationNext({ onClick, disabled = false, className = '' }) {
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={disabled}
      onClick={onClick}
      className={`h-8 gap-1 px-2 text-xs font-semibold ${className}`}
    >
      <span>Next</span>
      <ChevronRight className="h-3.5 w-3.5" />
    </Button>
  );
}

export function PaginationEllipsis({ className = '' }) {
  return (
    <span aria-hidden className={`flex h-8 w-8 items-center justify-center text-slate-400 ${className}`}>
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}
