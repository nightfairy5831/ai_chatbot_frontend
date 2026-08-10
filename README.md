# AI Chatbot SaaS — Frontend

React 19 + TypeScript + Vite dashboard for the AI Chatbot platform.

## Setup

```bash
npm install
cp .env.sample .env      # point VITE_API_BASE_URL at your backend
npm run dev              # http://localhost:5173
npm run build            # type-check + production build
npm run lint
```

`VITE_API_BASE_URL` must use `https://` whenever the app itself is served over
https, otherwise the browser blocks the API calls as mixed content.

## Layout

```
src/
  App.tsx                 shell: auth state, sidebar, page switching
  lib/request.ts          axios wrapper — auth header, toasts, 401 handling
  lib/errors.ts           error narrowing helpers
  app/landing             public marketing page
  app/auth                login / register
  app/dashboard           client dashboard: stats, agents, recent activity
  app/agent-detail        agent page — one component per tab
    tabs/ConfigTab        business details, tone, PDF, booking window
    tabs/ProductsTab      product & service catalogue
    tabs/PromptTab        prompt preview + test chat
    tabs/CalendarTab      Google Calendar, availability, bookings
    tabs/WhatsappTab      number connection (buy / platform / own Twilio)
    tabs/WebsiteTab       website chat toggle + embed snippet
  app/settings            profile, password, subscription
  app/admin               admin panel: dashboard, users, agents, logs, integrations
  components/ui           shadcn-style primitives
```

## Notes

- Navigation is component state in `App.tsx`, not a router — there are no deep links yet.
- A 401 from any request clears the token and returns the user to the login screen.
