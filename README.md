# Crypto Refund Portal

Full-stack React + Tailwind + Express + MongoDB app for verifying blockchain transactions, submitting refund requests, and reviewing them from an admin dashboard.

## Setup

```bash
npm run install:all
npm run build --prefix client
npm run start --prefix server
npm run dev
```

Set `MONGO_URI`, `JWT_SECRET`, and admin credentials in `server/.env`.

To run MongoDB with Docker:

```bash
docker compose up -d
npm run seed:admin --prefix server
npm run dev
```

Stable single-server run:

```bash
npm run build --prefix client
npm run start --prefix server
```

Then open `http://localhost:5000`.

## Features

- Transaction hash, wallet address, and network verification
- Public blockchain API integration through BlockCypher
- Transaction details and local transaction history
- Refund request form
- Admin login, refund review, approve/reject workflow
- Analytics for pending, approved, and rejected requests
- Dark/light mode and responsive UI
