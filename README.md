# URL Shortener Service

This is a basic Express.js style application that exposes a REST API to shorten URLs. Because the environment used to generate this example cannot download packages, a very small Express-like library is included in `express.js`. When running in a real environment you may replace it with the real Express package. The service uses PostgreSQL with Sequelize as the ORM.

## Endpoints

- `POST /shorten` – Accepts JSON with `url` property and returns a random alias.
- `GET /:alias` – Redirects to the original URL for the provided alias.

## Setup

1. Install dependencies (requires internet access):
   ```bash
   npm install
   ```
2. Set the `DATABASE_URL` environment variable to your PostgreSQL connection string.
3. Start the server:
   ```bash
   npm start
   ```

The server listens on port 3000 by default.
