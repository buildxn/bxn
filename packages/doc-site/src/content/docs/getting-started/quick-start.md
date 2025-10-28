---
title: Quick Start
description: Get started with wapix in minutes
---

Get up and running with wapix in just a few minutes.

## Installation

Install wapix using your preferred package manager:

```bash
npm install wapix
```

```bash
pnpm add wapix
```

```bash
yarn add wapix
```

## Create Your First Route

Create a simple route file at `src/routes/get.ts`:

```typescript
import { json, type RequestHandler } from 'wapix';

const handler: RequestHandler = () => {
  return json({
    message: 'Hello, World!',
    timestamp: new Date().toISOString()
  });
};

export default handler;
```

## Run the Development Server

Start the development server with watch mode for auto-reload:

```bash
npx wapix start --watch
```

Your API is now running at `http://localhost:3000`!

## Test Your API

Open your browser or use curl to test the endpoint:

```bash
curl http://localhost:3000
```

You should see:

```json
{
  "message": "Hello, World!",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Next Steps

- Learn about [File-System Routing](/core/file-system-routing/) to understand how routes are mapped
- Explore [Request Handlers](/core/request-handlers/) to build more complex APIs
- Check out the [Response Helpers](/reference/response-helpers/) reference for all available response types
