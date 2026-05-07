import { NodeJobStats as PaddlesNodeJobStats } from './paddles.d';

export interface NodeJobStats extends PaddlesNodeJobStats {
  name: string;
  total: number;
}

export interface NodeLockStats {
  name: string;
  owner: string;
  machine_type: string;
  count: number;
}

export type FilterMenuSections = {
  [key: string]: FilterMenuSection;
};

export type FilterMenuSection = {
  label?: string;
  filters: FilterMenuFilters;
}

export type FilterMenuFilters = {
  [key: string]: FilterMenuFilter;
}

export type FilterMenuFilter = {
  component?: string;
  type?: string;
  label?: string;
  options?: FilterMenuOptions;
  default?: string;
  size?: string;
}

export type FilterMenuOptions = readonly (string | FilterMenuOption)[];

export type FilterMenuOption = {
  label: string;
  value?: string;
}

export type FilterProps = {
  options?: (string | FilterMenuOption)[];
  value: string;
  placeholder?: string;
  id: string;
  label?: string;
  type?: string;
  size?: string;
  component?: string;
  onChange?: (value: string | null) => void;
}

export interface FilterComponentProps extends FilterProps {
  onChange: (value: string | null) => void;
}

export type RowDetail<TData> = {
  key: string;
  display?: boolean;
}
