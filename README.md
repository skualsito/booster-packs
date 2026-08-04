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
`ADMIN_PASSWORD`. The frontend uses `NEXT_PUBLIC_LOCAL_API_URL` to reach the
local API, defaulting to `http://localhost:4000`. When you choose the public
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
npm test
```
