import { useRegisterSW } from "virtual:pwa-register/react";

const HOUR = 60 * 60 * 1000;

/** Registers the service worker and asks before applying an update. */
export function UpdateDialog() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, reg) {
      if (!reg) return;
      // Check for a new version on launch-from-background and hourly.
      const check = () => { if (navigator.onLine) reg.update().catch(() => {}); };
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") check();
      });
      setInterval(check, HOUR);
    },
  });

  if (!needRefresh) return null;
  return (
    <div className="dialog-backdrop">
      <div className="dialog" role="alertdialog" aria-labelledby="upd-title" aria-describedby="upd-body">
        <h2 id="upd-title" className="dialog-title">Update available</h2>
        <p id="upd-body" className="dialog-body">A new version of Offlister is ready. Your lists are kept.</p>
        <div className="dialog-actions">
          <button type="button" className="btn" onClick={() => setNeedRefresh(false)}>Ignore</button>
          <button type="button" className="btn btn-primary" autoFocus onClick={() => updateServiceWorker(true)}>
            Reload
          </button>
        </div>
      </div>
    </div>
  );
}
