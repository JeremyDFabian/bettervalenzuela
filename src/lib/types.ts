export interface Crumb {
  label: string;
  href?: string | undefined;
}

export interface Source {
  title: string;
  url: string;
  accessed: Date;
}
