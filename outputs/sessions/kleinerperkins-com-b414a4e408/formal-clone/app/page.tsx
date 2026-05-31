import target from "../data/target-summary.json";

export default function Home() {
  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">Planarian formal clone scaffold</p>
        <h1>{target.title}</h1>
        <p className="summary">
          This is the first runnable scaffold for rebuilding the visible public UI of {target.url}.
        </p>
      </section>

      <section className="panel" aria-labelledby="source-materials">
        <h2 id="source-materials">Source materials</h2>
        <ul>
          <li>Review <code>../target-research/desktop.png</code> for visual matching.</li>
          <li>Review <code>../target-research/raw-html.html</code> for content structure.</li>
          <li>Use mock data for private or dynamic behavior.</li>
        </ul>
      </section>
    </main>
  );
}
