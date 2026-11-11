import { useState, type FormEvent } from "react";
import { PlusIcon } from "./icons";

export function InputBar(props: { placeholder: string; onSubmit: (text: string) => void }) {
  const [text, setText] = useState("");
  function submit(e: FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    props.onSubmit(t);
    setText("");
  }
  return (
    <form className="input-bar" onSubmit={submit}>
      <input className="input" value={text} onChange={(e) => setText(e.target.value)}
        placeholder={props.placeholder} aria-label={props.placeholder} enterKeyHint="done"
        autoComplete="off" />
      <button type="submit" className="add-btn" aria-label="Add" disabled={!text.trim()}>
        <PlusIcon />
      </button>
    </form>
  );
}
