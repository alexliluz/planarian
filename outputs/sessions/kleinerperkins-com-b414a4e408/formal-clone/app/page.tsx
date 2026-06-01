const navItems = ["Partnerships", "People", "Perspectives", "About"];

const storyCards = [
  {
    title: "Roadrunner: The new revenue infrastructure",
    image:
      "https://www.kleinerperkins.com/wp-content/uploads/2026/03/Google_16_9-compressed.webp?resize=1536,960"
  },
  {
    title: "Rogo: The AI Platform for Global Finance",
    image:
      "https://www.kleinerperkins.com/wp-content/uploads/2026/03/Figma_16_9-compressed.webp?resize=1536,960"
  },
  {
    title: "Saronic: Redefining Maritime Superiority",
    image:
      "https://www.kleinerperkins.com/wp-content/uploads/2026/03/Waymo-compressed.webp?resize=1536,864"
  }
];

export default function Home() {
  return (
    <main className="site-shell">
      <header className="site-header" aria-label="Primary">
        <a className="brand" href="#" aria-label="Kleiner Perkins home">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-wordmark">Kleiner Perkins</span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <a href="#" key={item}>
              {item}
            </a>
          ))}
        </nav>
        <button className="search-button" aria-label="Search">
          <span />
        </button>
      </header>

      <section className="hero" aria-label="Featured story">
        <div className="hero-media" />
        <div className="hero-content">
          <p className="hero-logo">alkira <span>x</span> LUMEN</p>
          <h1>Congratulations on the acquisition!</h1>
          <a className="pill-link" href="#">
            Read More
          </a>
        </div>
        <div className="slider-dots" aria-hidden="true">
          <span className="is-active" />
          <span />
          <span />
          <span />
        </div>
      </section>

      <section className="history-section" aria-labelledby="history-title">
        <div className="section-heading">
          <h2 id="history-title">History in the Making ...</h2>
          <a href="#">View All</a>
        </div>
        <div className="story-grid">
          {storyCards.map((card) => (
            <article className="story-card" key={card.title}>
              <div className="story-image" style={{ backgroundImage: `url(${card.image})` }} />
              <h3>{card.title}</h3>
            </article>
          ))}
        </div>
      </section>

      <aside className="privacy-card" aria-label="Cookie preference mock">
        <h2>We value your privacy</h2>
        <p>
          We use cookies to enhance your browsing experience and analyse our traffic. By clicking "Accept All", you
          consent to our use of cookies.
        </p>
        <div className="privacy-actions">
          <button>Customize</button>
          <button>Reject All</button>
          <button className="primary">Accept All</button>
        </div>
      </aside>

      <footer className="site-footer">
        <div>
          <h2>About</h2>
          <a href="#">Kleiner Perkins Fellows</a>
        </div>
        <div>
          <h2>Company</h2>
          <a href="#">Brand Assets</a>
          <a href="#">Terms of Use</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Disclosures</a>
        </div>
        <div>
          <h2>Connect</h2>
          <a href="#">LinkedIn</a>
          <a href="#">X</a>
          <a href="#">YouTube</a>
        </div>
        <div>
          <h2>Login</h2>
          <a href="#">LP Login</a>
        </div>
        <p className="copyright">&copy; 2026 Kleiner Perkins</p>
      </footer>
    </main>
  );
}
