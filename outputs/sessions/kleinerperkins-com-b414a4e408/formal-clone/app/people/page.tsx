const route = {
  "title": "Our Team",
  "url": "https://www.kleinerperkins.com/people",
  "routePath": "/people",
  "sourceDir": "target-research/pages/people",
  "sections": [
    "Leigh Marie Braswell",
    "Josh Coyne",
    "Ilya Fushman",
    "Mamoon Hamid",
    "Aditya Naganath",
    "Aatish Nayak",
    "Nadia Cochinwala",
    "Lucas Oliveira",
    "Leo Shao",
    "Tomas Barreto",
    "Susan Biglieri",
    "Moustafa ElBialy",
    "Suzanne Holloway",
    "Jesse King",
    "Joubin Mirzadegan",
    "Lauren Schultz",
    "Candy Cheng",
    "Lindsey Keller",
    "Camille Manso",
    "Athena Ruland",
    "Dana Schafer-Smith",
    "Brook Byers",
    "John Doerr",
    "Annie Case"
  ],
  "paragraphs": [
    "Operating Partner, Engineering",
    "Chief Financial Officer & Chief Operating Officer",
    "Chief Information Officer",
    "Operating Partner, Marketing",
    "Partner, General Counsel",
    "Operating Partner, Business Development",
    "Head of Content Identity",
    "Business Development",
    "Experience Marketing",
    "Advisor to the Chairman"
  ],
  "links": [
    {
      "label": "Leigh Marie Braswell",
      "href": "https://www.kleinerperkins.com/people/leigh-marie-braswell/"
    },
    {
      "label": "Josh Coyne",
      "href": "https://www.kleinerperkins.com/people/josh-coyne/"
    },
    {
      "label": "Ilya Fushman",
      "href": "https://www.kleinerperkins.com/people/ilya-fushman/"
    },
    {
      "label": "Mamoon Hamid",
      "href": "https://www.kleinerperkins.com/people/mamoon-hamid/"
    },
    {
      "label": "Aditya Naganath",
      "href": "https://www.kleinerperkins.com/people/aditya-naganath/"
    },
    {
      "label": "Aatish Nayak",
      "href": "https://www.kleinerperkins.com/people/aatish-nayak/"
    },
    {
      "label": "Nadia Cochinwala",
      "href": "https://www.kleinerperkins.com/people/nadia-cochinwala/"
    },
    {
      "label": "Lucas Oliveira",
      "href": "https://www.kleinerperkins.com/people/lucas-oliveira/"
    },
    {
      "label": "Leo Shao",
      "href": "https://www.kleinerperkins.com/people/leo-shao/"
    },
    {
      "label": "Tomas Barreto",
      "href": "https://www.kleinerperkins.com/people/tomas-barreto/"
    },
    {
      "label": "Susan Biglieri",
      "href": "https://www.kleinerperkins.com/people/susan-biglieri/"
    },
    {
      "label": "Moustafa ElBialy",
      "href": "https://www.kleinerperkins.com/people/moustafa-elbialy/"
    },
    {
      "label": "Suzanne Holloway",
      "href": "https://www.kleinerperkins.com/people/suzanne-holloway/"
    },
    {
      "label": "Jesse King",
      "href": "https://www.kleinerperkins.com/people/jesse-king/"
    },
    {
      "label": "Joubin Mirzadegan",
      "href": "https://www.kleinerperkins.com/people/joubin-mirzadegan/"
    },
    {
      "label": "Lauren Schultz",
      "href": "https://www.kleinerperkins.com/people/lauren-schultz/"
    },
    {
      "label": "Candy Cheng",
      "href": "https://www.kleinerperkins.com/people/candy-cheng/"
    },
    {
      "label": "Lindsey Keller",
      "href": "https://www.kleinerperkins.com/people/lindsey-keller/"
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
