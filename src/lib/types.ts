export type Kind = "todo" | "buy";
export type Filter = "all" | "open" | "done";
export type Sort = "manual" | "newest" | "oldest" | "az";

export interface Item {
  id: string;
  text: string;
  done: boolean;
  kind: Kind;
  createdAt: number; // epoch ms
  groupId?: string;
}

export interface Group {
  id: string;
  name: string;
  kind: Kind;
  hue: number;
  createdAt: number;
}

export interface State {
  version: 1;
  /** Array order is the manual order. */
  items: Item[];
  groups: Group[];
  sort: Sort;
}

export const SORTS: readonly Sort[] = ["manual", "newest", "oldest", "az"];
