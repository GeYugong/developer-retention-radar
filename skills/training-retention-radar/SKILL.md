---
name: training-retention-radar
description: Deploy, seed, demo, and validate the Developer Retention Radar training-camp application. Use when operating its React/Express/PostgreSQL stack, verifying QR check-ins and funnel conversion, preparing a competition demo, or diagnosing its Docker Compose deployment.
---

# Training Retention Radar

Operate the repository as a Node.js workspace with `apps/web`, `apps/api`, PostgreSQL, and Docker Compose. Keep secrets only in `.env`; never commit or echo production credentials.

## Validate before deployment

Run the checks from the repository root:

```bash
npm ci
npm test
npm run lint
npm run build
```

Confirm that the API tests cover authentication, duplicate check-in handling, and the `100 -> 80 -> 50 -> 35` four-stage funnel calculation. Do not claim a deployment is working until `/api/health` returns `{"status":"ok"}` from the intended public URL.

## Deploy and seed a demo

1. Copy `.env.example` to `.env`; set strong database, JWT, and administrator secrets. Set `PUBLIC_URL` to the real access URL.
2. Start the stack with `docker compose up -d --build`.
3. Inspect `docker compose ps` and `docker compose logs --tail=100 api`.
4. Generate demo data only in a demonstration environment:

```bash
docker compose exec -T api node apps/api/dist/seed.js
```

The demo should show `100 -> 80 -> 50 -> 35` at the four default stages. Never run the seed or reset operation against real training-camp data without explicit approval.

## Verify the participant flow

1. Log in to `/admin` and create or select a training camp.
2. Set the campaign status to `active` before opening public check-in links.
3. Use the registration QR link once with a new student ID and phone number.
4. Submit the same registration again; the response must succeed without increasing the count.
5. Submit the next stage using the same identity; it must match the existing participant.
6. Confirm the dashboard funnel, participant trajectory, and CSV export update.
7. Set the campaign to `closed`; public check-in must return an activity-not-open error while history remains visible to administrators.

## Diagnose common deployment failures

- **Port 80 already in use:** inspect `ss -ltnp '( sport = :80 )'`; stop or reconfigure the unrelated host service before starting the web container.
- **Docker Hub cannot pull images:** configure an approved regional registry mirror or synchronize required images into the cloud provider's registry. Keep the repository Dockerfiles vendor-neutral unless the deployment environment requires an explicit override.
- **Admin seems logged in but API calls return 401 over an IP address:** for HTTP-only access, the session cookie must not use the Secure attribute. Use HTTPS before enabling secure production cookies.
- **Campaign deletion fails with foreign-key errors:** delete dependent check-ins before deleting stages and the campaign.

## Competition handoff

Provide the public GitCode repository URL, the reachable deployment URL, and screenshots of the dashboard funnel, QR entry, and cloud instance. Keep administrator credentials out of public README files and submission descriptions.
