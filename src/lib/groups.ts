import type { State } from "./types";

/** Remove a group; its items stay, just without the group. */
export function deleteGroup(state: State, groupId: string): State {
  return {
    ...state,
    groups: state.groups.filter((g) => g.id !== groupId),
    items: state.items.map((i) => {
      if (i.groupId !== groupId) return i;
      const { groupId: _g, ...rest } = i;
      return rest;
    }),
  };
}
