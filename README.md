# AI Chatbot SaaS — Frontend

React 19 + TypeScript + Vite dashboard for the AI Chatbot platform.

## Setup

```bash
npm install
cp .env.sample .env      # point VITE_API_BASE_URL at your backend
npm run dev              # http://localhost:5173
npm run build            # type-check + production build
npm run lint
npm run test             # vitest
```

`VITE_API_BASE_URL` must use `https://` whenever the app itself is served over
https, otherwise the browser blocks the API calls as mixed content.

## Layout

```
src/
  App.tsx                 session state + routes (react-router)
  components/AppLayout    sidebar shell for signed-in pages
  lib/request.ts          axios wrapper — auth header, toasts, 401 handling
  lib/errors.ts           error narrowing helpers
  app/landing             public marketing page
  app/auth                login / register / forgot-password / reset-password
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
  test/                   vitest suites
```

## Routes

`/` landing · `/login` · `/register` · `/forgot-password` · `/reset-password`
· `/dashboard` · `/agents/:id` · `/settings` · `/admin[/users|/agents|/logs|/integrations]`

`vercel.json` rewrites every path to `index.html` so deep links work in production.

## Notes

- A 401 from any request clears the token and returns the user to the login screen;
  the session is refreshed every 30 minutes while the app is open.
- Admin, agent and settings screens are lazy-loaded, and Recharts is split into its
  own chunk so client sessions never download it.
