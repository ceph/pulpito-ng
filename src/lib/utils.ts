import {
  type MRT_PaginationState,
  type MRT_ColumnFiltersState,
} from 'material-react-table';
import { format, type Duration } from "date-fns";

function getUrl(path: string, filters: MRT_ColumnFiltersState, pagination: MRT_PaginationState) {
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
  newUrl.searchParams.set("pageSize", String(pagination.pageSize));
  return newUrl;
}

function formatDate(orig: string | number | Date) {
  if (!orig) return "";
  return format(new Date(orig), "yyyy-MM-dd HH:mm:ss");
}

function formatDay(orig: string | number | Date) {
  if (!orig) return "";
  return format(new Date(orig), "yyyy-MM-dd");
}

function pad(num: number) {
  return `${num}`.padStart(2, "0");
}

function getDuration(seconds: number) {
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

function formatDuration(seconds: number) {
  let result = seconds;
  const hours = Math.floor(result / 3600);
  result %= 3600;
  const minutes = Math.floor(result / 60);
  result %= 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(result)}`;
}

function dirName(path: string) {
  const array = path.split("/");
  array.splice(-1, 1, "");
  return array.join("/");
}

export { formatDate, formatDay, getDuration, formatDuration, dirName, getUrl };
