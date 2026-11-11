import { useEffect, useRef, useState } from "react";
import { groupColours } from "../lib/colour";
import type { Group, Sort } from "../lib/types";
import { MoreIcon } from "./icons";

const SORT_LABELS: Record<Sort, string> = {
  manual: "Manual",
  newest: "Newest first",
  oldest: "Oldest first",
  az: "A–Z",
};

export function Menu(props: {
  sort: Sort;
  onSort: (s: Sort) => void;
  groupMode: boolean;
  onGroupMode: (on: boolean) => void;
  selectedGroup?: Group;
  onCycleHue: () => void;
  doneCount: number;
  onClearCompleted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const act = (f: () => void) => () => { f(); setOpen(false); };

  return (
    <div className="menu-wrap" ref={ref}>
      <button type="button" className="icon-btn" aria-label="Options" aria-expanded={open}
        onClick={() => setOpen((o) => !o)}>
        <MoreIcon />
      </button>
      {open && (
        <div className="menu" role="menu">
          <div className="menu-label">Sort</div>
          {(Object.keys(SORT_LABELS) as Sort[]).map((s) => (
            <button key={s} type="button" role="menuitemradio" aria-checked={props.sort === s}
              className="menu-item" onClick={act(() => props.onSort(s))}>
              {SORT_LABELS[s]}
            </button>
          ))}
          <div className="menu-sep" />
          <button type="button" role="menuitemcheckbox" aria-checked={props.groupMode}
            className="menu-item" onClick={act(() => props.onGroupMode(!props.groupMode))}>
            Group mode
          </button>
          {props.groupMode && props.selectedGroup && (
            <button type="button" className="menu-item" onClick={props.onCycleHue}>
              <span className="hue-pill" style={{ background: groupColours(props.selectedGroup.hue).chip }} />
              {props.selectedGroup.name} colour
            </button>
          )}
          <div className="menu-sep" />
          <button type="button" className="menu-item danger" disabled={props.doneCount === 0}
            onClick={act(props.onClearCompleted)}>
            Clear completed ({props.doneCount})
          </button>
        </div>
      )}
    </div>
  );
}
