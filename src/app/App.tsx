import { APP_VERSION } from "./version";

/** Placeholder shell; the real screen arrives in step 3. */
export function App() {
  return (
    <main style={{ padding: "var(--gap)", color: "var(--muted)" }}>
      Offlister {APP_VERSION}
    </main>
  );
}
