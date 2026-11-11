import { useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import type { Row } from "../lib/visible";
import { GroupChip } from "./GroupChip";
import { ItemRow } from "./ItemRow";

const FLIP_MS = 170;

export function List(props: {
  rows: Row[];
  now: number;
  draggable: boolean;
  groupMode: boolean;
  selectedGroupId?: string;
  emptyText: string;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onTapItem: (id: string) => void;
  onSelectGroup: (id: string) => void;
  onMove: (visibleIds: string[], id: string, toIndex: number) => void;
}) {
  const els = useRef(new Map<string, HTMLElement>());
  const tops = useRef(new Map<string, number>());
  const listRef = useRef<HTMLUListElement>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const keyOf = (r: Row) => (r.type === "header" ? `h:${r.group.id}` : `i:${r.item.id}`);
  const itemIds = props.rows.flatMap((r) => (r.type === "item" ? [r.item.id] : []));

  // FLIP: animate rows from their previous position to the new one.
  useLayoutEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const next = new Map<string, number>();
    els.current.forEach((el, key) => {
      const top = el.offsetTop;
      next.set(key, top);
      const prev = tops.current.get(key);
      if (!reduce && prev !== undefined && prev !== top && el.animate) {
        el.animate([{ transform: `translateY(${prev - top}px)` }, { transform: "none" }],
          { duration: FLIP_MS, easing: "ease-out" });
      }
    });
    tops.current = next;
  });

  // Latest values for the window-level drag listeners.
  const live = useRef({ itemIds, onMove: props.onMove });
  live.current = { itemIds, onMove: props.onMove };

  // Drag is tracked on window: reordering moves the row's DOM node, which
  // would drop pointer capture on the grip.
  function gripDown(id: string, e: RPointerEvent<HTMLButtonElement>) {
    e.preventDefault();
    const pointerId = e.pointerId;
    setDragId(id);
    const onMove = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      ev.preventDefault();
      const { itemIds: ids, onMove: move } = live.current;
      // Layout positions (offsetTop), not getBoundingClientRect: rows may be mid-FLIP.
      const y = ev.clientY - (listRef.current?.getBoundingClientRect().top ?? 0);
      let target = 0;
      for (const other of ids) {
        if (other === id) continue;
        const el = els.current.get(`i:${other}`);
        if (el && y > el.offsetTop + el.offsetHeight / 2) target++;
      }
      if (target !== ids.indexOf(id)) move(ids, id, target);
    };
    const onEnd = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      setDragId(null);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);
    };
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onEnd);
  }

  if (props.rows.length === 0) return <p className="empty">{props.emptyText}</p>;

  return (
    <ul className="list" ref={listRef}>
      {props.rows.map((r) => {
        const key = keyOf(r);
        const ref = (el: HTMLLIElement | null) => {
          if (el) els.current.set(key, el);
          else els.current.delete(key);
        };
        if (r.type === "header") {
          return (
            <li key={key} ref={ref} className="group-header">
              <GroupChip group={r.group} selected={props.selectedGroupId === r.group.id}
                onClick={props.groupMode ? () => props.onSelectGroup(r.group.id) : undefined} />
            </li>
          );
        }
        const id = r.item.id;
        return (
          <li key={key} ref={ref} className={r.group ? "member" : undefined}>
            <ItemRow item={r.item} group={r.group} now={props.now}
              draggable={props.draggable} dragging={dragId === id} selectable={props.groupMode}
              onToggle={() => props.onToggle(id)} onDelete={() => props.onDelete(id)}
              onTap={() => props.onTapItem(id)}
              onGripDown={(e) => gripDown(id, e)} />
          </li>
        );
      })}
    </ul>
  );
}
