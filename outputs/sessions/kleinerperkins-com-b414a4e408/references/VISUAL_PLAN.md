# Visual Plan

Session: kleinerperkins-com-b414a4e408
Target: https://www.kleinerperkins.com/

## Page Identity

- Title: Home | Kleiner Perkins
- Description: Kleiner Perkins is an American venture capital firm headquartered on Sand Hill Road in Menlo Park in Silicon Valley.
- Classification: unknown
- Detected frameworks: react-root

## Visual Signals

- HTML classes: dark, bg-white, text-black, dark:bg-black, dark:text-white
- Body classes: home, wp-singular, page-template-default, page, page-id-45, wp-theme-kp-handstand-theme, page-home
- Image count: 65
- Font count: 1
- Stylesheet count: 1

## Navigation Labels

- Privacy Policy
- Google Privacy Policy
- Partnerships
- People
- Perspectives
- About
- Read More
- Website
- John Doerr
- Thomas Kurian - Google Cloud - Competitor-Aware and Customer-Obsessed
- Google: Organizing the world's information and making it searchable
- Bing Gordon
- Amazon: Reimagining commerce
- Spotify: Reimagining entertainment one song at a time through streaming music
- DoorDash: delivering the future of local
- Josh Coyne
- Mamoon Hamid
- Figma made design collaborative. Today, it makes history.
- Figma: Unleashing creativity through collaborative design
- Figma: Crazy Ramping Series C
- Ilya Fushman
- EP 1 | The Finance Leader's Playbook
- Parker Conrad - Rippling - Compounding
- Rippling: Unifying employee data and workplace systems
- Rippling: The system of record for employee data
- Welcome Rippling
- Duolingo: The world's best way to learn a language
- Lucas Oliveira
- LinkedIn
- Nadia Cochinwala
- Waymo: The Infrastructure of Autonomy
- The Expert Network Behind Handshake AI's Model Training w/ Garrett Lord & Mamoon Hamid
- Handshake: Moving the needle on inequality
- Slack: Building the workplace collaboration hub
- Slack: it's where work happens
- Motive: The AI Engine Powering the Physical Economy
- Motive: The AI engine powering the physical economy
- Shoaib Makani - Motive - Powering the Physical Economy
- Automating the physical economy
- EP 2 | What Product Leaders Must Rethink in the AI Era

## Headings

- Google
- Amazon
- Spotify
- DoorDash
- Figma
- Rippling
- Duolingo
- Robinhood
- Anthropic
- Waymo
- Twitter
- Compaq Computer Corporation
- Handshake
- Slack
- Motive
- Harvey
- Genentech
- Electronic Arts
- Netscape
- Xilinx
- Glean
- Sun Microsystems
- Intuit
- Stripe
- Instacart
- Nest
- Applied Intuition
- Square
- Related
- History in the Making …
- About
- Company
- Connect
- Login
- Partnered Since
- Stage
- Founders
- Partners
- Thomas Kurian - Google Cloud - Competitor-Aware and Customer-Obsessed
- Google: Organizing the world's information and making it searchable

## Text Excerpt

```text
Home | Kleiner Perkins We value your privacy We use cookies to enhance your browsing experience and analyse our traffic. By clicking "Accept All", you consent to our use of cookies. Privacy Policy Customize Reject All Accept All Customise Consent Preferences For more information on how Google's third-party cookies operate and handle your data, see: Google Privacy Policy Necessary Always Active Necessary cookies are required to enable the basic features of this site, such as providing secure log-in or adjusting your consent preferences. These cookies do not store any personally identifiable data. Functional Functional cookies help perform certain functionalities like sharing the content of the website on social media platforms, collecting feedback, and other third-party features. Analytics Analytical cookies are used to understand how visitors interact with the website. These cookies help provide information on metrics such as the number of visitors, bounce rate, traffic source, etc. Performance Performance cookies are used to understand and analyse the key performance indexes of the website which helps in delivering a better user experience for the visitors. Advertisement Advertisement cookies are used to provide visitors with customised advertisements based on the pages you visited previously and to analyse the effectiveness of the ad campaigns. Uncategorised Other uncategorised cookies are those that are being analysed and have not been classified into a category as yet. Reject All Save My Preferences Accept All Partnerships People Perspectives About Partnerships People Perspectives About Search Twitter Slack DoorDash Stripe Google Amazon Glean Compaq Harvey Nest Spotify Electronic Arts M a k e H i s t o r y Square OpenEvidence Anthropic Figma Robinhood Instacart Waym
```

## Implementation Guidance

- Use `../target-research/desktop.png` as the first visual baseline.
- Treat `ASSET_INVENTORY.md` as the source for public visual asset references.
- Recreate the first viewport before deeper page sections.
- Prefer local mock data for dynamic sections.
- Do not implement real analytics, consent logging, personalization, tracking, private API, account, payment, or backend calls.
- For this type of media-heavy marketing site, do not rely on `formal-static-pass` as the final clone. Use research, assets, and visual comparison instead.

## Suggested First Clone Pass

1. Build the global shell: theme, background, header/nav, and typography.
2. Recreate the first hero section using public image references or local placeholders.
3. Add portfolio/story tiles from visible page text and captured asset URLs.
4. Run `corepack pnpm cli formal-validate kleinerperkins-com-b414a4e408`.
5. Run `corepack pnpm cli formal-compare kleinerperkins-com-b414a4e408`.
6. Use React Grab repair tasks for component-level visual mismatches.
