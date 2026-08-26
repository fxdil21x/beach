import React from 'react';

/**
 * Base Skeleton component with animated shimmer background.
 */
export function Skeleton({ className = '', dark = false, circle = false, ...props }) {
  const baseBg = dark ? 'bg-zinc-800/80' : 'bg-slate-200/80';
  const shimmerClass = dark ? 'shimmer-wave-dark' : 'shimmer-wave';
  const shapeClass = circle ? 'rounded-full' : 'rounded-xl';

  return (
    <div
      className={`${baseBg} ${shimmerClass} ${shapeClass} ${className}`}
      {...props}
    />
  );
}

/**
 * Shimmer skeleton matching exact design of MyPass / ResidentQrPanel component
 */
export function MyPassSkeleton() {
  return (
    <div className="w-full rounded-2xl bg-white p-5 shadow-sm border border-slate-100/80 space-y-5 animate-in fade-in duration-200">
      {/* Show QR instruction header skeleton */}
      <Skeleton className="h-4 w-48 mx-auto" />

      {/* Large QR Code placeholder skeleton */}
      <div className="relative mx-auto flex items-center justify-center p-4">
        <Skeleton className="h-64 w-64 rounded-2xl sm:h-72 sm:w-72" />
      </div>

      {/* Resident Name & House Details Card skeleton */}
      <div className="rounded-xl bg-slate-50 p-4 text-center space-y-2 border border-slate-100">
        <Skeleton className="h-6 w-40 mx-auto" />
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>

      {/* Photo upload picker button skeleton */}
      <div className="pt-2">
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}

/**
 * Shimmer skeleton matching exact design of ResidentSearchCard component
 */
export function ResidentCardSkeleton({ dark = false }) {
  const cardBg = dark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-slate-100/80 shadow-xs';
  return (
    <div className={`rounded-2xl border ${cardBg} p-4 sm:p-5 transition-all`}>
      <div className="flex gap-4">
        {/* Photo avatar circle skeleton */}
        <Skeleton className="h-16 w-16 shrink-0 rounded-xl sm:h-20 sm:w-20" dark={dark} />

        <div className="min-w-0 flex-1 space-y-3">
          {/* Header title & badge row skeleton */}
          <div className="flex items-start justify-between gap-2">
            <Skeleton className="h-5 w-36 sm:w-48" dark={dark} />
            <Skeleton className="h-5 w-20 rounded-full" dark={dark} />
          </div>

          {/* Details lines: House, Guardian, Phone */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-4/5" dark={dark} />
            <Skeleton className="h-4 w-3/5" dark={dark} />
            <Skeleton className="h-4 w-2/5" dark={dark} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Shimmer skeleton for Resident Search list view
 */
export function ResidentSearchSkeleton({ count = 3, dark = false }) {
  return (
    <div className="space-y-3 w-full animate-in fade-in duration-200">
      {Array.from({ length: count }).map((_, i) => (
        <ResidentCardSkeleton key={i} dark={dark} />
      ))}
    </div>
  );
}

/**
 * Shimmer skeleton matching exact design of Master Dashboard metrics & cards
 */
export function MasterDashboardSkeleton() {
  return (
    <div className="min-h-0 flex-1 space-y-6 overflow-y-auto w-full animate-in fade-in duration-200">
      {/* Title Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-56" dark />
        <Skeleton className="h-4 w-40" dark />
      </div>

      {/* 8 Metric stat cards grid skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-sm space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2.5 flex-1">
                <Skeleton className="h-4 w-28" dark />
                <Skeleton className="h-8 w-16" dark />
              </div>
              <Skeleton className="h-10 w-10 shrink-0 rounded-xl" dark />
            </div>
            <Skeleton className="h-3 w-24" dark />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Shimmer skeleton matching exact design of Posted Feature Announcement cards
 */
export function NotificationsSkeleton({ count = 3, dark = false }) {
  const cardBg = dark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-slate-200/80';
  return (
    <div className="space-y-3 w-full animate-in fade-in duration-200">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border ${cardBg} p-4`}
        >
          <div className="min-w-0 flex-1 space-y-3 w-full">
            {/* Header: Icon, Title, Badge */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-7 rounded-lg shrink-0" dark={dark} />
              <Skeleton className="h-5 w-44 sm:w-60" dark={dark} />
              <Skeleton className="h-4 w-20 rounded-full shrink-0" dark={dark} />
            </div>
            {/* Description box skeleton */}
            <Skeleton className="h-12 w-full rounded-xl" dark={dark} />
            {/* Metadata row */}
            <div className="flex items-center gap-3">
              <Skeleton className="h-3 w-28" dark={dark} />
              <Skeleton className="h-3 w-24" dark={dark} />
            </div>
          </div>
          {/* Action buttons skeleton */}
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <Skeleton className="h-8 w-20 rounded-lg" dark={dark} />
            <Skeleton className="h-8 w-8 rounded-lg" dark={dark} />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Shimmer skeleton matching exact design of Incident Reports (Admin / Master / User)
 */
export function ReportsSkeleton({ count = 2, dark = false }) {
  const cardBg = dark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-slate-200/80';
  const innerBg = dark ? 'bg-zinc-950/60 border-zinc-800/80' : 'bg-slate-50/70 border-slate-100';

  return (
    <div className="space-y-4 w-full animate-in fade-in duration-200">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`rounded-2xl border ${cardBg} p-4 sm:p-5 space-y-4 shadow-xs`}>
          {/* User Profile Header */}
          <div className={`flex items-center justify-between border-b ${dark ? 'border-zinc-800' : 'border-slate-100'} pb-3`}>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 shrink-0 rounded-xl" dark={dark} />
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-36" dark={dark} />
                <Skeleton className="h-3 w-24" dark={dark} />
              </div>
            </div>
            <Skeleton className="h-6 w-20 rounded-full" dark={dark} />
          </div>

          {/* Incident item skeleton */}
          <div className={`rounded-xl border ${innerBg} p-4 space-y-3`}>
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <Skeleton className="h-5 w-40" dark={dark} />
                <Skeleton className="h-3 w-28" dark={dark} />
              </div>
              <Skeleton className="h-5 w-20 rounded-full" dark={dark} />
            </div>

            <Skeleton className="h-10 w-full rounded-lg" dark={dark} />
            <Skeleton className="h-36 w-full rounded-xl" dark={dark} />

            {/* Status change action buttons skeleton */}
            <div className="pt-2 flex gap-2">
              <Skeleton className="h-8 flex-1 rounded-xl" dark={dark} />
              <Skeleton className="h-8 flex-1 rounded-xl" dark={dark} />
              <Skeleton className="h-8 flex-1 rounded-xl" dark={dark} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Shimmer skeleton matching QR Scanner screen layout
 */
export function ScannerSkeleton() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-2xl bg-gray-800/90 border border-gray-700/60 p-8 text-center space-y-4 animate-in fade-in duration-200">
      <Skeleton className="h-44 w-44 rounded-3xl" dark />
      <Skeleton className="h-6 w-48 mx-auto" dark />
      <Skeleton className="h-4 w-64 mx-auto" dark />
    </div>
  );
}

/**
 * Shimmer skeleton for Data Tables (Resident Master Records, Admin tables, etc.)
 */
export function TableSkeleton({ rows = 6, cols = 7, dark = true }) {
  const containerBg = dark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-slate-200';
  return (
    <div className={`w-full rounded-2xl border ${containerBg} overflow-hidden shadow-sm animate-in fade-in duration-200`}>
      <div className="p-4 border-b border-zinc-800 flex justify-between gap-4">
        <Skeleton className="h-10 w-full max-w-sm rounded-xl" dark={dark} />
        <Skeleton className="h-10 w-28 rounded-xl shrink-0" dark={dark} />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className={dark ? 'bg-zinc-950 border-b border-zinc-800' : 'bg-slate-100 border-b border-slate-200'}>
            <tr>
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="p-3.5">
                  <Skeleton className="h-4 w-20" dark={dark} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rIdx) => (
              <tr key={rIdx} className={dark ? 'border-b border-zinc-800/60' : 'border-b border-slate-100'}>
                {Array.from({ length: cols }).map((_, cIdx) => (
                  <td key={cIdx} className="p-3.5">
                    <Skeleton className={`h-4 ${cIdx === 0 ? 'w-28' : 'w-16'}`} dark={dark} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Full page App Shell shimmer skeleton for Protected Route loading state
 */
export function AppShellSkeleton() {
  return (
    <div className="flex h-screen w-full flex-col bg-gray-50 overflow-hidden animate-in fade-in duration-150">
      {/* Header Bar Skeleton */}
      <div className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 p-4 space-y-4 overflow-hidden">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>

      {/* Bottom Nav Skeleton */}
      <div className="flex h-16 items-center justify-around border-t border-slate-200 bg-white px-4">
        <Skeleton className="h-8 w-12 rounded-xl" />
        <Skeleton className="h-8 w-12 rounded-xl" />
        <Skeleton className="h-8 w-12 rounded-xl" />
      </div>
    </div>
  );
}

/**
 * Shimmer skeleton matching My Visits log screen layout
 */
export function VisitsSkeleton() {
  return (
    <div className="space-y-4 w-full animate-in fade-in duration-200">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm space-y-2 border border-slate-100/80">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-28" />
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm space-y-2 border border-slate-100/80">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100/80 space-y-2">
            <Skeleton className="h-4 w-44" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Shimmer skeleton matching 2-column Services grid layout
 */
export function ServicesSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 pb-6 animate-in fade-in duration-200">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-3 shadow-sm space-y-3"
        >
          <Skeleton className="aspect-video w-full rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-3/5" />
          </div>
          <Skeleton className="h-8 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

/**
 * Shimmer skeleton matching Profile page layout
 */
export function ProfileSkeleton() {
  return (
    <div className="space-y-4 w-full animate-in fade-in duration-200">
      <div className="rounded-2xl bg-white p-5 shadow-sm space-y-3 border border-slate-100/80">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="rounded-2xl bg-white p-5 shadow-sm space-y-4 border border-slate-100/80">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-8 w-32 rounded-xl" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Shimmer skeleton matching Recent Entries admin layout
 */
export function RecentEntriesSkeleton() {
  return (
    <div className="space-y-4 w-full animate-in fade-in duration-200">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm space-y-3 border border-slate-100/80">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm space-y-3 border border-slate-100/80">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
