import { useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { groupColours } from "../lib/colour";
import { formatTimestamp } from "../lib/format";
import type { Group, Item } from "../lib/types";
import { CheckIcon, GripIcon } from "./icons";

const SLOP = 8;

interface Gesture { id: number; x: number; y: number; mode: "pending" | "swipe" | "scroll" }

export function ItemRow(props: {
  item: Item;
  group?: Group;
  now: number;
  draggable: boolean;
  dragging: boolean;
  selectable: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onTap: () => void;
  onGripDown: (e: RPointerEvent<HTMLButtonElement>) => void;
}) {
  const { item, group } = props;
  const g = useRef<Gesture | null>(null);
  const [dx, setDx] = useState(0);
  const [settling, setSettling] = useState(false);
  const [removing, setRemoving] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);

  function down(e: RPointerEvent<HTMLDivElement>) {
    if (removing || e.button !== 0) return;
    g.current = { id: e.pointerId, x: e.clientX, y: e.clientY, mode: "pending" };
    setSettling(false);
  }
  function move(e: RPointerEvent<HTMLDivElement>) {
    const s = g.current;
    if (!s || s.id !== e.pointerId) return;
    const mx = e.clientX - s.x;
    const my = e.clientY - s.y;
    if (s.mode === "pending") {
      if (Math.abs(mx) > SLOP && Math.abs(mx) > Math.abs(my)) {
        s.mode = "swipe";
        e.currentTarget.setPointerCapture(e.pointerId);
      } else if (Math.abs(my) > SLOP) {
        s.mode = "scroll";
      }
    }
    if (s.mode === "swipe") setDx(Math.min(0, mx));
  }
  function up(e: RPointerEvent<HTMLDivElement>) {
    const s = g.current;
    g.current = null;
    if (!s || s.id !== e.pointerId) return;
    if (s.mode === "pending") {
      props.onTap();
      return;
    }
    if (s.mode !== "swipe") return;
    const width = rowRef.current?.offsetWidth ?? 1;
    setSettling(true);
    if (-dx > width / 3) {
      setRemoving(true);
      setDx(-width);
      window.setTimeout(props.onDelete, 160);
    } else {
      setDx(0);
    }
  }
  function cancel() {
    g.current = null;
    setSettling(true);
    setDx(0);
  }

  const c = group ? groupColours(group.hue) : undefined;
  const cls = ["row", item.done && "done", props.dragging && "dragging", props.selectable && "selectable"]
    .filter(Boolean).join(" ");

  return (
    <div className="row-wrap" ref={rowRef}>
      <div className="row-delete" aria-hidden={dx === 0} style={{ opacity: dx < 0 ? 1 : 0 }}>Delete</div>
      <div className={cls}
        style={{
          transform: dx ? `translateX(${dx}px)` : undefined,
          transition: settling ? "transform 160ms ease-out" : undefined,
          background: c?.tint,
          color: c?.text,
        }}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={cancel}>
        {props.draggable && (
          <button type="button" className="grip" aria-label={`Reorder “${item.text}”`}
            onPointerDown={(e) => { e.stopPropagation(); props.onGripDown(e); }}>
            <GripIcon />
          </button>
        )}
        <button type="button" className="check" role="checkbox" aria-checked={item.done}
          aria-label={item.done ? `Mark “${item.text}” not done` : `Mark “${item.text}” done`}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={props.onToggle}>
          {item.done && <CheckIcon width={16} height={16} strokeWidth={3} />}
        </button>
        <div className="row-text">
          <div className="text">{item.text}</div>
          <div className="stamp tabular">added {formatTimestamp(item.createdAt, props.now)}</div>
        </div>
        <button type="button" className="sr-only" onClick={props.onDelete}>Delete “{item.text}”</button>
      </div>
    </div>
  );
}
