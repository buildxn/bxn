---
title: Quick Start
description: Get started with bxn http in minutes
---

Get up and running with bxn http in just a few minutes.

## Create a New Project

The fastest way to get started is using the `create-bxn` init command:

```bash
npm create bxn@latest
```

```bash
pnpm create bxn@latest
```

```bash
yarn create bxn@latest
```

This interactive CLI will:
- Prompt you for a project name
- Ask which package manager you prefer (pnpm, npm, or yarn)
- Create a new project directory with the recommended structure
- Generate a `src/routes/get.ts` file with a basic "Hello World" route handler
- Configure `package.json` with useful scripts (`dev`, `build`, `start`)
- Optionally install dependencies

Once created, navigate to your project and start the development server:

```bash
cd your-project-name
npm run dev
```

Your API will be running at `http://localhost:3000`. Visit it in your browser or use curl to test:

```bash
curl http://localhost:3000
```

You should see a JSON response from the generated route file!

## Manual Installation

If you prefer to set up manually, install both the framework and CLI:

```bash
npm install @buildxn/http
npm install -D bxn
```

```bash
pnpm add @buildxn/http
pnpm add -D bxn
```

```bash
yarn add @buildxn/http
yarn add -D bxn
```

## Create Your First Route

Create a simple route file at `src/routes/get.ts`:

```typescript
import { json, type RequestHandler } from '@buildxn/http';

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
npx bxn http start --watch
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

- Learn about [File-System Routing](../../core/file-system-routing/) to understand how routes are mapped
- Explore [Request Handlers](../../core/request-handlers/) to build more complex APIs
- Check out the [Response Helpers](../../reference/response-helpers/) reference for all available response types
