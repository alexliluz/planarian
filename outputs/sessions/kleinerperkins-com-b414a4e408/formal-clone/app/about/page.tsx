const route = {
  "title": "Our History",
  "url": "https://www.kleinerperkins.com/about",
  "routePath": "/about",
  "sourceDir": "target-research/pages/about",
  "sections": [
    "Our Mission",
    "Our Ethos",
    "Our Values"
  ],
  "paragraphs": [],
  "links": [
    {
      "label": "Kleiner Perkins Fellows",
      "href": "https://www.kleinerperkins.com/fellows/"
    },
    {
      "label": "Brand Assets",
      "href": "https://www.kleinerperkins.com/brand-assets/"
    },
    {
      "label": "Terms of Use",
      "href": "https://www.kleinerperkins.com/terms-conditions/"
    },
    {
      "label": "Disclosures",
      "href": "https://www.kleinerperkins.com/disclosures/"
    },
    {
      "label": "LinkedIn",
      "href": "https://www.linkedin.com/company/kleinerperkins/?lipi=urn%3Ali%3Apage%3Ad_flagship3_search_srp_all%3Br0DzsRvPQJu3RMJD%2BD6cqg%3D%3D"
    },
    {
      "label": "X",
      "href": "https://x.com/kleinerperkins"
    },
    {
      "label": "YouTube",
      "href": "https://www.youtube.com/@KleinerPerkinsVideos"
    },
    {
      "label": "LP Login",
      "href": "https://portal.kleinerperkins.com/"
    }
  ]
};

export default function CapturedRoutePage() {
  return (
    <main className="route-shell">
      <section className="route-hero">
        <p className="route-kicker">{route.routePath}</p>
        <h1>{route.title}</h1>
      </section>

      {route.paragraphs.length > 0 ? (
        <section className="route-intro" aria-label="Page introduction">
          {route.paragraphs.slice(0, 3).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
      ) : null}

      {route.sections.length > 0 ? (
        <section className="route-grid" aria-label="Captured sections">
          {route.sections.map((section) => (
            <article className="route-card" key={section}>
              <h2>{section}</h2>
            </article>
          ))}
        </section>
      ) : null}

      {route.paragraphs.length > 3 ? (
        <section className="route-copy" aria-label="Additional captured text">
          {route.paragraphs.slice(3).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
      ) : null}

      {route.links.length > 0 ? (
        <section className="route-links" aria-label="Captured public links">
          {route.links.map((link) => (
            <a key={`${link.href}-${link.label}`} href={link.href}>
              {link.label}
            </a>
          ))}
        </section>
      ) : null}
    </main>
  );
}
