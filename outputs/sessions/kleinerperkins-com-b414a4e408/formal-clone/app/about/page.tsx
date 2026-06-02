const route = {
  "title": "Our History",
  "url": "https://www.kleinerperkins.com/about",
  "routePath": "/about",
  "sourceDir": "target-research/pages/about",
  "target": "https://www.kleinerperkins.com/"
};

export default function CapturedRoutePage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">Captured route scaffold</p>
        <h1>{route.title}</h1>
        <p className="summary">
          Rebuild this public route from the captured source materials for {route.routePath}.
        </p>
      </section>

      <section className="panel" aria-labelledby="route-materials">
        <h2 id="route-materials">Route source materials</h2>
        <ul>
          <li>Original URL: <a href={route.url}>{route.url}</a></li>
          <li>Captured HTML: <code>{route.sourceDir}/raw-html.html</code></li>
          <li>Captured screenshot: <code>{route.sourceDir}/desktop.png</code></li>
        </ul>
      </section>
    </main>
  );
}
