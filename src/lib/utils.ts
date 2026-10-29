import { navigate } from 'vike/client/router'
import {
  type PaginationState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import { format, type Duration } from "date-fns";

import { DEFAULT_PAGE_SIZE } from './paddles';

export function isServer() {
  return ! (typeof window !== 'undefined' && window.document)
}

export function getUrl(path: string, filters: ColumnFiltersState, pagination: PaginationState) {
  const newUrl = new URL(path, window.location.origin);
  filters.forEach(item => {
    if ( ! item.id ) return;
    if ( item.value instanceof Function ) return;
    if ( item.value instanceof Date ) {
      newUrl.searchParams.set("date", formatDay(item.value));
    } else if ( item.id === "scheduled" ) {
      newUrl.searchParams.set("date", String(item.value));
    } else {
      newUrl.searchParams.set(String(item.id), String(item.value));
    }
  });
  if ( pagination.pageIndex ) newUrl.searchParams.set("page", String(pagination.pageIndex));
  if ( pagination.pageSize !== DEFAULT_PAGE_SIZE ) {
    newUrl.searchParams.set("pageSize", String(pagination.pageSize));
  }
  return newUrl;
}

// The URL we're navigating to, if a navigation is in flight. vike updates
// window.location only once the new page's data has loaded, so filter changes
// made in the meantime must build on this, or they'd drop the earlier change.
let pendingUrl: string | null = null;

export function getFilterChangeHandler(paramName: string, aliases: string[] = []) {
  return (value: string | null) => {
    const base = pendingUrl || window.location.href;
    const url = new URL(base)
    for ( const alias of aliases ) url.searchParams.delete(alias);
    if ( value ) {
      url.searchParams.set(paramName, value.toString());
    } else {
      url.searchParams.delete(paramName);
    }
    if ( url.toString() !== base ) {
      // a different filter means a different result set; start from the top
      url.searchParams.delete('page');
      const target = url.toString();
      pendingUrl = target;
      navigate(target.replace(url.origin, '')).finally(() => {
        if ( pendingUrl === target ) pendingUrl = null;
      });
    }
  }
}

// paddles timestamps are UTC but carry no timezone, e.g. "2024-01-02 03:04:05".
// Parse them as UTC so the server and browser agree.
const PADDLES_TIMESTAMP = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/;

export function parseTimestamp(orig: string): Date {
  if ( PADDLES_TIMESTAMP.test(orig) ) {
    return new Date(orig.replace(" ", "T") + "Z");
  }
  return new Date(orig);
}

// Display paddles timestamps as-is (UTC); re-parsing them would depend on the
// viewer's timezone, and Safari can't parse the space-separated form.
export function formatDate(orig: string | number | Date) {
  if (!orig) return "";
  if ( typeof orig === "string" && PADDLES_TIMESTAMP.test(orig) ) return orig.slice(0, 19).replace("T", " ");
  return format(new Date(orig), "yyyy-MM-dd HH:mm:ss");
}

export function formatDay(orig: string | number | Date) {
  if (!orig) return "";
  if ( typeof orig === "string" && PADDLES_TIMESTAMP.test(orig) ) return orig.slice(0, 10);
  return format(new Date(orig), "yyyy-MM-dd");
}

function pad(num: number) {
  return `${num}`.padStart(2, "0");
}

export function getDuration(seconds: number) {
  const result: Duration = {};
  let seconds_ = seconds;
  result.days = Math.floor(seconds_ / (60 * 60 * 24));
  seconds_ %= 60 * 60 * 24;
  result.hours = Math.floor(seconds_ / (60 * 60));
  seconds_ %= 60 * 60;
  result.minutes = Math.floor(seconds_ / 60);
  seconds_ %= 60;
  result.seconds = seconds_;
  return result;
}

export function formatDuration(seconds: number) {
  let result = seconds;
  const hours = Math.floor(result / 3600);
  result %= 3600;
  const minutes = Math.floor(result / 60);
  result %= 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(result)}`;
}

export function dirName(path: string) {
  const array = path.split("/");
  array.splice(-1, 1, "");
  return array.join("/");
}
