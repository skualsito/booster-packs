# Pullario TCG Boosters

Prototype marketplace for TCG booster openings inspired by case-opening flows.

The first version includes:

- Home page with registered-user login and available boosters.
- Booster detail pages with roulette opening and visible card probabilities.
- Admin page for creating MySQL-backed boosters.
- Profile page for local users/admins.
- Dedicated card search page for One Piece, Pokemon, and Magic.

## Local Development

```bash
npm run dev
```

In another terminal, run the local MySQL API:

```bash
npm run api
```

Copy `.env.example` to `.env.local` and fill `MYSQL_*`, `ADMIN_USERNAME`, and
`ADMIN_PASSWORD`. The API refuses to start without `ADMIN_PASSWORD` (warns if it is shorter
than 8 characters), and resets the admin password to that value on every start.
Sessions are stored hashed in the `user_sessions` table, so they survive API
restarts. The frontend uses `NEXT_PUBLIC_LOCAL_API_URL` to reach the
local API, defaulting to `http://localhost:3004`. When you choose the public
domain, set `NEXT_PUBLIC_SITE_URL` so SEO files such as `sitemap.xml` and
`robots.txt` use the final URL.

Local pages:

- `/` available boosters and login/register
- `/packs/[packId]` booster opening
- `/cards` card search
- `/admin` booster creator
- `/profile` user/admin profile

## Validation

```bash
npm run lint
npm test          # API helper tests + build + render test
npm run test:api  # API helper tests only
```

## Production

Production templates for PM2, environment variables, and Nginx are available in
`ecosystem.config.cjs` and `deploy/`. Set `.env.local` before running the build,
because `NEXT_PUBLIC_LOCAL_API_URL` is embedded in the frontend bundle.

Run `npm run db:migrate` after configuring MySQL and before restarting the API.
The migrations are idempotent and preserve existing data.
