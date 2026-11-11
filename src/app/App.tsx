import { useEffect, useMemo, useState } from "react";
import { hueForNewGroup, nextHue } from "../lib/colour";
import { newId } from "../lib/id";
import { moveItem } from "../lib/order";
import { countByFilter } from "../lib/sort";
import type { Filter, Kind, State } from "../lib/types";
import { visibleRows } from "../lib/visible";
import { loadState, saveState } from "../store/storage";
import { GroupChip } from "../ui/GroupChip";
import { InputBar } from "../ui/InputBar";
import { List } from "../ui/List";
import { Menu } from "../ui/Menu";
import { Segmented } from "../ui/Segmented";
import { XIcon } from "../ui/icons";
import { UpdateDialog } from "./UpdateDialog";

const KIND_KEY = "offlister.kind";

function initialKind(): Kind {
  try {
    return sessionStorage.getItem(KIND_KEY) === "buy" ? "buy" : "todo";
  } catch {
    return "todo";
  }
}

export function App() {
  const [state, setState] = useState<State>(loadState);
  const [kind, setKind] = useState<Kind>(initialKind);
  const [filter, setFilter] = useState<Filter>("all");
  const [groupMode, setGroupMode] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>();

  useEffect(() => { saveState(state); }, [state]);
  useEffect(() => {
    try { sessionStorage.setItem(KIND_KEY, kind); } catch { /* ignore */ }
  }, [kind]);

  const kindItems = useMemo(() => state.items.filter((i) => i.kind === kind), [state.items, kind]);
  const counts = countByFilter(kindItems);
  const rows = useMemo(
    () => visibleRows(state.items, state.groups, kind, filter, state.sort),
    [state.items, state.groups, kind, filter, state.sort],
  );
  const kindGroups = state.groups.filter((g) => g.kind === kind);
  const selectedGroup = kindGroups.find((g) => g.id === selectedGroupId);

  const update = (f: (s: State) => State) => setState(f);

  function switchKind(k: Kind) {
    setKind(k);
    setSelectedGroupId(undefined);
  }

  function add(text: string) {
    const now = Date.now();
    if (groupMode) {
      const id = newId();
      update((s) => ({
        ...s,
        groups: [...s.groups, { id, name: text, kind, hue: hueForNewGroup(s.groups, kind), createdAt: now }],
      }));
      setSelectedGroupId(id);
      return;
    }
    // New items go to the end of the manual order (above done items).
    update((s) => ({ ...s, items: [...s.items, { id: newId(), text, done: false, kind, createdAt: now }] }));
  }

  const toggle = (id: string) =>
    update((s) => ({ ...s, items: s.items.map((i) => (i.id === id ? { ...i, done: !i.done } : i)) }));

  const remove = (id: string) => update((s) => ({ ...s, items: s.items.filter((i) => i.id !== id) }));

  function tapItem(id: string) {
    if (!groupMode || !selectedGroup) return;
    const gid = selectedGroup.id;
    update((s) => ({
      ...s,
      items: s.items.map((i) => {
        if (i.id !== id) return i;
        if (i.groupId === gid) {
          const { groupId: _g, ...rest } = i;
          return rest;
        }
        return { ...i, groupId: gid };
      }),
    }));
  }

  const cycleHue = () => {
    if (!selectedGroup) return;
    update((s) => ({
      ...s,
      groups: s.groups.map((g) => (g.id === selectedGroup.id ? { ...g, hue: nextHue(g.hue) } : g)),
    }));
  };

  const clearCompleted = () =>
    update((s) => ({ ...s, items: s.items.filter((i) => !(i.kind === kind && i.done)) }));

  const move = (visibleIds: string[], id: string, to: number) =>
    update((s) => ({ ...s, items: moveItem(s.items, visibleIds, id, to) }));

  function setGroupModeOn(on: boolean) {
    setGroupMode(on);
    if (on && !selectedGroup && kindGroups.length) setSelectedGroupId(kindGroups[kindGroups.length - 1].id);
  }

  const emptyText =
    counts.all === 0
      ? kind === "todo" ? "Nothing to do yet." : "Nothing to buy yet."
      : filter === "done" ? "Nothing done yet." : "All done.";

  return (
    <div className="app">
      <header className="top">
        <Segmented label="List" value={kind} onChange={switchKind} variant="primary"
          options={[{ value: "todo", label: "To-do" }, { value: "buy", label: "To-buy" }]} />
        <InputBar
          placeholder={groupMode ? "New group name…" : kind === "todo" ? "Add a task…" : "Add an item…"}
          onSubmit={add} />
        {groupMode && (
          <div className="group-bar">
            <div className="group-bar-chips">
              {kindGroups.length === 0 && <span className="hint">Type a name and tap + to create a group</span>}
              {kindGroups.map((g) => (
                <GroupChip key={g.id} group={g} selected={g.id === selectedGroupId}
                  onClick={() => setSelectedGroupId(g.id)} />
              ))}
            </div>
            <button type="button" className="done-grouping" onClick={() => setGroupMode(false)}>
              <XIcon width={18} height={18} /> Done
            </button>
          </div>
        )}
        <div className="filter-row">
          <Segmented label="Filter" value={filter} onChange={setFilter}
            options={[
              { value: "all", label: "All", count: counts.all },
              { value: "open", label: "Not done", count: counts.open },
              { value: "done", label: "Done", count: counts.done },
            ]} />
          <Menu sort={state.sort} onSort={(sort) => update((s) => ({ ...s, sort }))}
            groupMode={groupMode} onGroupMode={setGroupModeOn}
            selectedGroup={selectedGroup} onCycleHue={cycleHue}
            doneCount={counts.done} onClearCompleted={clearCompleted} />
        </div>
      </header>

      <main className="scroll">
        <List rows={rows} now={Date.now()} draggable={state.sort === "manual"}
          groupMode={groupMode} selectedGroupId={selectedGroupId} emptyText={emptyText}
          onToggle={toggle} onDelete={remove} onTapItem={tapItem}
          onSelectGroup={setSelectedGroupId} onMove={move} />
      </main>

      <UpdateDialog />
    </div>
  );
}
