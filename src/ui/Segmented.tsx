interface Option<T extends string> { value: T; label: string; count?: number }

export function Segmented<T extends string>(props: {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="seg" role="radiogroup" aria-label={props.label}>
      {props.options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={o.value === props.value}
          className="seg-btn" onClick={() => props.onChange(o.value)}>
          {o.label}
          {o.count !== undefined && <span className="seg-count tabular">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}
