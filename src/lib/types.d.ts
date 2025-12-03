
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
}

export type FilterMenuOptions = readonly (string | FilterMenuOption)[];

export type FilterMenuOption = {
  label: string;
  value?: string;
}
