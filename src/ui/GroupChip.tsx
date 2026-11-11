import { groupColours } from "../lib/colour";
import type { Group } from "../lib/types";

export function GroupChip(props: { group: Group; selected?: boolean; onClick?: () => void }) {
  const c = groupColours(props.group.hue);
  const style = { background: c.chip, color: c.onChip };
  if (!props.onClick) return <span className="chip" style={style}>{props.group.name}</span>;
  return (
    <button type="button" className="chip chip-btn" style={style} aria-pressed={props.selected}
      onClick={props.onClick}>
      {props.group.name}
    </button>
  );
}
