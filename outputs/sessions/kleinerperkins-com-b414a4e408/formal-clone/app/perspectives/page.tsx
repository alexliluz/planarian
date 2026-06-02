const route = {
  "title": "Our Thoughts",
  "url": "https://www.kleinerperkins.com/perspectives",
  "routePath": "/perspectives",
  "sourceDir": "target-research/pages/perspectives",
  "sections": [
    "Applied Compute: Closing the Gap Between Frontier AI and Real-World Impact",
    "Mind Robotics: Building the AI-Native Robotics Platform for Manufacturing",
    "Roadrunner: The new revenue infrastructure",
    "Rogo: The AI Platform for Global Finance",
    "Avoca: Bringing AI to the backbone of the real economy",
    "Saronic: Redefining Maritime Superiority"
  ],
  "paragraphs": [],
  "links": [
    {
      "label": "Case Studies",
      "href": "/perspectives/category/case-study"
    },
    {
      "label": "Media",
      "href": "/perspectives/category/media"
    },
    {
      "label": "Announcements",
      "href": "/perspectives/category/announcements"
    },
    {
      "label": "Grid view",
      "href": "?layout=grid"
    },
    {
      "label": "List view",
      "href": "?layout=list"
    },
    {
      "label": "Applied Compute: Closing the Gap Between Frontier AI and Real-World Impact",
      "href": "https://www.kleinerperkins.com/perspectives/applied-compute-closing-the-gap-between-frontier-ai-and-real-world-impact/"
    },
    {
      "label": "Mind Robotics: Building the AI-Native Robotics Platform for Manufacturing",
      "href": "https://www.kleinerperkins.com/perspectives/mind-robotics-building-the-ai-native-robotics-platform-for-manufacturing/"
    },
    {
      "label": "Roadrunner: The new revenue infrastructure",
      "href": "https://www.kleinerperkins.com/perspectives/roadrunner-the-new-revenue-infrastructure/"
    },
    {
      "label": "Rogo: The AI Platform for Global Finance",
      "href": "https://www.kleinerperkins.com/perspectives/rogo-the-ai-platform-for-global-finance/"
    },
    {
      "label": "Avoca: Bringing AI to the backbone of the real economy",
      "href": "https://www.kleinerperkins.com/perspectives/avoca-bringing-ai-to-the-backbone-of-the-real-economy/"
    },
    {
      "label": "Saronic: Redefining Maritime Superiority",
      "href": "https://www.kleinerperkins.com/perspectives/saronic-redefining-maritime-superiority/"
    },
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
