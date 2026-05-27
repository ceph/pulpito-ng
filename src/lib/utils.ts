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

export function getFilterChangeHandler(paramName: string) {
  return (value: string | null) => {
    const url = new URL(window.location.href)
    if ( value ) {
      url.searchParams.set(paramName, value.toString());
    } else {
      url.searchParams.delete(paramName);
    }
    if ( url.toString() != window.location.href) {
      navigate(url.toString().replace(url.origin, ''));
    }
  }
}

export function formatDate(orig: string | number | Date) {
  if (!orig) return "";
  return format(new Date(orig), "yyyy-MM-dd HH:mm:ss");
}

export function formatDay(orig: string | number | Date) {
  if (!orig) return "";
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
