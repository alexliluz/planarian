import content from "../data/static-content.json";

export default function Home() {
  return (
    <main className="page-shell">
      <section className="example-panel" aria-labelledby="page-title">
        <h1 id="page-title">{content.title}</h1>
        {content.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        {content.links.length > 0 ? (
          <p>
            {content.links.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </p>
        ) : null}
      </section>
    </main>
  );
}
