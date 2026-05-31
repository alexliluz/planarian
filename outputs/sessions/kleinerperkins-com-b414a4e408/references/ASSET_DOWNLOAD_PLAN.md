# Asset Download Plan

Session: kleinerperkins-com-b414a4e408
Target: https://www.kleinerperkins.com/

This plan decides which public visual assets are worth localizing into `formal-clone/public/`, which should remain references, and which should be ignored.

## Policy

- Localize public visual assets needed for stable first-viewport or component rendering.
- Keep large long-tail image galleries as references until a specific section needs them.
- Ignore analytics, consent, tracking, telemetry, and private/backend-like endpoints.
- Do not download or call private APIs.
- Preserve source URLs in comments or data files when localizing public assets.

## Summary

- Localize: 22
- Reference: 40
- Ignore: 18

## Localize First

- image: https://www.kleinerperkins.com/wp-content/uploads/2026/05/alkira-x-lumen-home-takeover-opt-04-1.jpg?resize=1536,864
  - Reason: Likely hero, logo, or primary visual asset for first-pass fidelity.
  - Suggested path: `public/assets/images/alkira-x-lumen-home-takeover-opt-04-1.jpg`
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/05/9-16-Portrait-1.jpg
  - Reason: Likely hero, logo, or primary visual asset for first-pass fidelity.
  - Suggested path: `public/assets/images/9-16-Portrait-1.jpg`
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/05/alkira-x-lumen-logo-desktop-1.svg
  - Reason: Likely hero, logo, or primary visual asset for first-pass fidelity.
  - Suggested path: `public/assets/images/alkira-x-lumen-logo-desktop-1.svg`
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/05/alkira-x-lumen-logo-lock-mobile.svg
  - Reason: Likely hero, logo, or primary visual asset for first-pass fidelity.
  - Suggested path: `public/assets/images/alkira-x-lumen-logo-lock-mobile.svg`
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/Amazon-desktop-compressed.webp?resize=1536,864
  - Reason: Likely hero, logo, or primary visual asset for first-pass fidelity.
  - Suggested path: `public/assets/images/Amazon-desktop-compressed.webp`
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/Amazon-mobile-compressed.webp
  - Reason: Likely hero, logo, or primary visual asset for first-pass fidelity.
  - Suggested path: `public/assets/images/Amazon-mobile-compressed.webp`
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/Figma-mobile-compressed.webp
  - Reason: Likely hero, logo, or primary visual asset for first-pass fidelity.
  - Suggested path: `public/assets/images/Figma-mobile-compressed.webp`
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/9-16-Portrait-4-compressed.webp
  - Reason: Likely hero, logo, or primary visual asset for first-pass fidelity.
  - Suggested path: `public/assets/images/9-16-Portrait-4-compressed.webp`
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/9-16-Portrait-10-compressed.webp
  - Reason: Likely hero, logo, or primary visual asset for first-pass fidelity.
  - Suggested path: `public/assets/images/9-16-Portrait-10-compressed.webp`
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/9-16-Portrait-2-compressed.webp
  - Reason: Likely hero, logo, or primary visual asset for first-pass fidelity.
  - Suggested path: `public/assets/images/9-16-Portrait-2-compressed.webp`
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/9-16-Portrait-6-compressed.webp
  - Reason: Likely hero, logo, or primary visual asset for first-pass fidelity.
  - Suggested path: `public/assets/images/9-16-Portrait-6-compressed.webp`
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/Slack_9-16-Portrait-compressed.webp
  - Reason: Likely hero, logo, or primary visual asset for first-pass fidelity.
  - Suggested path: `public/assets/images/Slack_9-16-Portrait-compressed.webp`
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/Motive_9-16-Portrait-compressed.webp
  - Reason: Likely hero, logo, or primary visual asset for first-pass fidelity.
  - Suggested path: `public/assets/images/Motive_9-16-Portrait-compressed.webp`
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/9-16-Portrait-5-compressed.webp
  - Reason: Likely hero, logo, or primary visual asset for first-pass fidelity.
  - Suggested path: `public/assets/images/9-16-Portrait-5-compressed.webp`
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/9-16-Portrait-11-compressed.webp
  - Reason: Likely hero, logo, or primary visual asset for first-pass fidelity.
  - Suggested path: `public/assets/images/9-16-Portrait-11-compressed.webp`
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/9-16-Portrait-8-compressed.webp
  - Reason: Likely hero, logo, or primary visual asset for first-pass fidelity.
  - Suggested path: `public/assets/images/9-16-Portrait-8-compressed.webp`
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/Stripe_9-16-Portrait-compressed.webp
  - Reason: Likely hero, logo, or primary visual asset for first-pass fidelity.
  - Suggested path: `public/assets/images/Stripe_9-16-Portrait-compressed.webp`
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/9-16-Portrait-compressed.webp
  - Reason: Likely hero, logo, or primary visual asset for first-pass fidelity.
  - Suggested path: `public/assets/images/9-16-Portrait-compressed.webp`
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/9-16-Portrait-7-compressed.webp
  - Reason: Likely hero, logo, or primary visual asset for first-pass fidelity.
  - Suggested path: `public/assets/images/9-16-Portrait-7-compressed.webp`
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/9-16-Portrait-1-compressed.webp
  - Reason: Likely hero, logo, or primary visual asset for first-pass fidelity.
  - Suggested path: `public/assets/images/9-16-Portrait-1-compressed.webp`
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/Square_mobile-compressed.webp
  - Reason: Likely hero, logo, or primary visual asset for first-pass fidelity.
  - Suggested path: `public/assets/images/Square_mobile-compressed.webp`
- font: https://www.kleinerperkins.com/wp-content/themes/kp-handstand-theme/fonts/sb.woff2
  - Reason: Font assets strongly affect visual fidelity and are usually small.
  - Suggested path: `public/assets/fonts/sb.woff2`

## Keep As References

- stylesheet: https://www.kleinerperkins.com/wp-content/themes/kp-handstand-theme/main.TEhr70aR.css
  - Reason: Stylesheets are useful for research, but the formal clone should implement clean local CSS rather than copying site CSS.
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/Google_16_9-compressed.webp?resize=1536,960
  - Reason: Public visual asset captured from the page; localize only when the corresponding section is implemented.
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/Google_9_16-compressed.webp
  - Reason: Public visual asset captured from the page; localize only when the corresponding section is implemented.
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/Spotify_16_9-compressed.webp?resize=1536,960
  - Reason: Public visual asset captured from the page; localize only when the corresponding section is implemented.
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/Doordash_16_9_0a5095-compressed.webp?resize=1536,960
  - Reason: Public visual asset captured from the page; localize only when the corresponding section is implemented.
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/Spotify_9_16-compressed.webp
  - Reason: Public visual asset captured from the page; localize only when the corresponding section is implemented.
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/Figma_16_9-compressed.webp?resize=1536,960
  - Reason: Public visual asset captured from the page; localize only when the corresponding section is implemented.
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/Rippling_yellow-compressed.webp?resize=1536,864
  - Reason: Public visual asset captured from the page; localize only when the corresponding section is implemented.
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/Duolingo_9_16-compressed.webp
  - Reason: Public visual asset captured from the page; localize only when the corresponding section is implemented.
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/Duolingo_16_9-compressed.webp?resize=1536,960
  - Reason: Public visual asset captured from the page; localize only when the corresponding section is implemented.
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/Robinhood-1-compressed.webp?resize=1536,864
  - Reason: Public visual asset captured from the page; localize only when the corresponding section is implemented.
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/Robinhood_image-9x16-1-compressed.webp
  - Reason: Public visual asset captured from the page; localize only when the corresponding section is implemented.
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/Waymo-compressed.webp?resize=1536,864
  - Reason: Public visual asset captured from the page; localize only when the corresponding section is implemented.
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/Anthropic_image-9x16-1-compressed.webp
  - Reason: Public visual asset captured from the page; localize only when the corresponding section is implemented.
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/Anthropic-1-compressed.webp?resize=1536,864
  - Reason: Public visual asset captured from the page; localize only when the corresponding section is implemented.
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/Twitter-1-compressed.webp?resize=1536,864
  - Reason: Public visual asset captured from the page; localize only when the corresponding section is implemented.
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/Compaq_16_9-compressed.webp?resize=1536,960
  - Reason: Public visual asset captured from the page; localize only when the corresponding section is implemented.
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/Doordash_9_16-compressed.webp
  - Reason: Public visual asset captured from the page; localize only when the corresponding section is implemented.
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/Compaq_9_16-compressed.webp
  - Reason: Public visual asset captured from the page; localize only when the corresponding section is implemented.
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/Handshake-compressed.webp?resize=1536,864
  - Reason: Public visual asset captured from the page; localize only when the corresponding section is implemented.
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/Slack-1-compressed.webp?resize=1536,864
  - Reason: Public visual asset captured from the page; localize only when the corresponding section is implemented.
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/Motive-1-compressed.webp?resize=1536,864
  - Reason: Public visual asset captured from the page; localize only when the corresponding section is implemented.
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/Genetech_new-compressed.webp?resize=1536,864
  - Reason: Public visual asset captured from the page; localize only when the corresponding section is implemented.
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/Harvey_16_9_7f2de5-compressed.webp?resize=1536,960
  - Reason: Public visual asset captured from the page; localize only when the corresponding section is implemented.
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/Harvey_9_16-compressed.webp
  - Reason: Public visual asset captured from the page; localize only when the corresponding section is implemented.
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/EA_9_16-compressed.webp
  - Reason: Public visual asset captured from the page; localize only when the corresponding section is implemented.
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/EA_16_9-compressed.webp?resize=1536,960
  - Reason: Public visual asset captured from the page; localize only when the corresponding section is implemented.
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/Xilinx_16_9_b2e3ec-compressed.webp?resize=1536,960
  - Reason: Public visual asset captured from the page; localize only when the corresponding section is implemented.
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/Netscape_9_16-compressed.webp
  - Reason: Public visual asset captured from the page; localize only when the corresponding section is implemented.
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/Xilinx_9_16-compressed.webp
  - Reason: Public visual asset captured from the page; localize only when the corresponding section is implemented.
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/Netscape_16_9_a45d28-compressed.webp?resize=1536,960
  - Reason: Public visual asset captured from the page; localize only when the corresponding section is implemented.
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/Glean_super-compressed.webp?resize=1536,862
  - Reason: Public visual asset captured from the page; localize only when the corresponding section is implemented.
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/sun_New_PC-compressed.webp?resize=1536,864
  - Reason: Public visual asset captured from the page; localize only when the corresponding section is implemented.
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/Intuit-compressed.webp
  - Reason: Public visual asset captured from the page; localize only when the corresponding section is implemented.
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/Stripe-1-compressed.webp?resize=1536,864
  - Reason: Public visual asset captured from the page; localize only when the corresponding section is implemented.
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/Intuit_9_16-compressed.webp
  - Reason: Public visual asset captured from the page; localize only when the corresponding section is implemented.
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/Instacart-1-compressed.webp?resize=1536,864
  - Reason: Public visual asset captured from the page; localize only when the corresponding section is implemented.
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/nest-compressed.webp?resize=1536,864
  - Reason: Public visual asset captured from the page; localize only when the corresponding section is implemented.
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/Applied-Intuition-1-compressed.webp?resize=1536,864
  - Reason: Public visual asset captured from the page; localize only when the corresponding section is implemented.
- image: https://www.kleinerperkins.com/wp-content/uploads/2026/03/Square-compressed.webp?resize=1536,864
  - Reason: Public visual asset captured from the page; localize only when the corresponding section is implemented.

## Ignore

- script: https://cdn-cookieyes.com/client_data/a65570d42a76013bbfecd6a1/script.js
  - Reason: Analytics, consent, telemetry, or tracking asset should not be implemented in the formal clone.
- script: https://cdn-cookieyes.com/client_data/a65570d42a76013bbfecd6a1/banner.js
  - Reason: Analytics, consent, telemetry, or tracking asset should not be implemented in the formal clone.
- script: https://www.kleinerperkins.com/wp-content/themes/kp-handstand-theme/main.D2mmH5zi.js
  - Reason: Original site scripts should not be copied; rebuild visible interactions locally.
- script: https://cdn.parsely.com/keys/kleinerperkins.com/p.js?ver=3.23.2
  - Reason: Analytics, consent, telemetry, or tracking asset should not be implemented in the formal clone.
- script: https://static.cloudflareinsights.com/beacon.min.js/v833ccba57c9e4d2798f2e76cebdd09a11778172276447
  - Reason: Analytics, consent, telemetry, or tracking asset should not be implemented in the formal clone.
- script: https://stats.wp.com/e-202622.js
  - Reason: Analytics, consent, telemetry, or tracking asset should not be implemented in the formal clone.
- script: https://www.kleinerperkins.com/wp-content/mu-plugins/wp-parsely-3.23/build/loader.js?ver=ecf94842061bea03d54b
  - Reason: Original site scripts should not be copied; rebuild visible interactions locally.
- script: https://www.kleinerperkins.com/wp-includes/js/dist/i18n.min.js?ver=781d11515ad3d91786ec
  - Reason: Original site scripts should not be copied; rebuild visible interactions locally.
- script: https://www.kleinerperkins.com/wp-includes/js/dist/hooks.min.js?m=1779300160g
  - Reason: Original site scripts should not be copied; rebuild visible interactions locally.
- script: https://www.googletagmanager.com/gtag/js?id=G-XWQN39SPQS
  - Reason: Analytics, consent, telemetry, or tracking asset should not be implemented in the formal clone.
- script: https://cdn.jsdelivr.net/npm/@mux/mux-player
  - Reason: Original site scripts should not be copied; rebuild visible interactions locally.
- image: https://cdn-cookieyes.com/assets/images/close.svg
  - Reason: Analytics, consent, telemetry, or tracking asset should not be implemented in the formal clone.
- image: https://www.googletagmanager.com/td?id=G-XWQN39SPQS&v=3&t=t&pid=534154138&gtm=45je65r2v9122482944za200zd9122482944&seq=1&exp=0~115616986~115938465~115938468~119027223~119034491&dl=www.kleinerperkins.com%2F&tdp=G-XWQN39SPQS;122482944;0;0;0&frm=0&rtg=122482944&slo=1&hlo=6&lst=3&bt=0&ct=3&z=0
  - Reason: Analytics, consent, telemetry, or tracking asset should not be implemented in the formal clone.
- script: https://www.googletagmanager.com/gtag/js?id=G-XWQN39SPQS&is_td=1&v=3&t=t&pid=534154138&gtm=45je65r2v9122482944za200zd9122482944&seq=2&exp=0~115616986~115938465~115938468~119027223~119034491&dl=www.kleinerperkins.com%2F&tdp=G-XWQN39SPQS;122482944;0;0;0&mde=G-XWQN39SPQS;16_1;61_1&mbc=1&z=0
  - Reason: Analytics, consent, telemetry, or tracking asset should not be implemented in the formal clone.
- image: https://www.googletagmanager.com/td?id=G-XWQN39SPQS&v=3&t=t&pid=534154138&gtm=45je65r2v9122482944za200zd9122482944&seq=2&exp=0~115616986~115938465~115938468~119027223~119034491&dl=www.kleinerperkins.com%2F&tdp=G-XWQN39SPQS;122482944;0;0;0&mde=G-XWQN39SPQS;16_1;61_1&mbc=1&z=0
  - Reason: Analytics, consent, telemetry, or tracking asset should not be implemented in the formal clone.
- image: https://pixel.wp.com/g.gif?v=ext&blog=248446183&post=45&tz=-7&srv=www.kleinerperkins.com&hp=vip&j=1%3A15.7&host=www.kleinerperkins.com&ref=&fcp=4116&rand=0.5850781472082254
  - Reason: Analytics, consent, telemetry, or tracking asset should not be implemented in the formal clone.
- image: https://p1.parsely.com/px/?rand=1780239951004&plid=a47b1424-1b1c-4843-b5f1-9fde1d266f0a&idsite=kleinerperkins.com&url=https%3A%2F%2Fwww.kleinerperkins.com%2F&urlref=&screen=1440x1000%7C1440x1000%7C24&data=%7B%7D&sid=1&surl=https%3A%2F%2Fwww.kleinerperkins.com%2F&sref=&sts=1780239950998&slts=0&title=Home+%7C+Kleiner+Perkins&date=Sun+May+31+2026+23%3A05%3A51+GMT%2B0800+(%E4%B8%AD%E5%9B%BD%E6%A0%87%E5%87%86%E6%97%B6%E9%97%B4)&action=pageview&pvid=01edb7a3-3435-44af-ae50-45267b42eecf&u=pid%3D72dca17d-f932-4fdd-95ef-3ea6773f68c8
  - Reason: Analytics, consent, telemetry, or tracking asset should not be implemented in the formal clone.
- script: https://www.kleinerperkins.com/wp-content/plugins/optimization-detective/detect.min.js?ver=1.0.0-beta4
  - Reason: Original site scripts should not be copied; rebuild visible interactions locally.

## Suggested Next Steps

1. Create `formal-clone/public/assets/`.
2. Localize only the assets listed in "Localize First".
3. Keep filenames stable and descriptive.
4. Update formal clone data/components to reference local assets.
5. Re-run `corepack pnpm cli formal-validate kleinerperkins-com-b414a4e408`.
6. Re-run `corepack pnpm cli formal-compare kleinerperkins-com-b414a4e408`.
