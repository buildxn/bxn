<div align="center">

# ⚡ wapix

**A zero-config, file-system-driven HTTP framework for Node.js — type-safe, fast, and minimal.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10.18.3-orange.svg)](https://pnpm.io/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

*Build type-safe REST APIs with zero configuration and convention over configuration*

[Features](#features) • [Quick Start](#quick-start) • [Documentation](#documentation) • [Examples](#examples) • [Contributing](#contributing)

</div>

---

## ✨ Features

- **🗂️ File-System Based Routing** - Your directory structure *is* your API structure
- **🔒 Type-Safe** - End-to-end TypeScript support with full type inference
- **⚡ Zero Config** - Drop your route files and go - no setup required
- **🎯 Simple API** - Intuitive request/response helpers (`json()`, `ok()`, `notFound()`, etc.)
- **🔄 Hot Reload** - Automatic route reloading in development mode
- **📦 Lightweight** - Minimal dependencies, built on Node.js HTTP
- **🛣️ Dynamic Routes** - Support for path parameters (`:id`, `:slug`, etc.)
- **📤 Streaming** - First-class support for streaming responses
- **🔌 Middleware-Free** - Simple, predictable request handlers

## 🚀 Quick Start

### Installation

```bash
npm install wapix
# or
pnpm add wapix
# or
yarn add wapix
```

### Create Your First API

1. **Create a route file** - `src/routes/get.ts`:

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

2. **Run the development server**:

```bash
npx wapix dev
```

3. **That's it!** Your API is running at `http://localhost:3000`

## 📖 Documentation

### File-System Routing

Routes are automatically mapped based on your file structure:

```
src/routes/
├── get.ts                    → GET /
├── authors/
│   ├── get.ts                → GET /authors
│   ├── post.ts               → POST /authors
│   └── $authorId/
│       ├── get.ts            → GET /authors/:authorId
│       └── delete.ts         → DELETE /authors/:authorId
└── posts/
    ├── get.ts                → GET /posts
    └── $postId/
        └── get.ts            → GET /posts/:postId
```

**Convention**:
- Directories = path segments
- `$` prefix = dynamic parameter (e.g., `$authorId` → `:authorId`)
- Filename = HTTP method (`get.ts`, `post.ts`, `put.ts`, `delete.ts`, etc.)

### Request Handlers

All route files export a default handler function:

```typescript
import type { RequestHandler } from 'wapix';

// Basic handler
const handler: RequestHandler = (req) => {
  return json({ message: 'Success' });
};

export default handler;
```

### Type-Safe Parameters & Responses

Get full type safety for path params, query strings, request bodies, **and responses**:

```typescript
import { json, notFound, type RequestHandler, type Ok, type NotFound } from 'wapix';

type Params = { authorId: string };
type Query = { include?: string };

interface Author {
  id: string;
  name: string;
  email: string;
}

// Define all possible response types
type Response = Ok<Author> | NotFound<{ error: string }>;

const handler: RequestHandler<Params, Response> = (req): Response => {
  const { authorId } = req.params;  // ✅ Type-safe!
  const { include } = req.query;     // ✅ Type-safe!

  const author = db.authors.get(authorId);

  if (!author) {
    return notFound({ error: 'Author not found' });  // ✅ Type-safe!
  }

  return json(author);  // ✅ Type-safe!
};

export default handler;
```

**Benefits of Type-Safe Responses:**
- Catch response type errors at compile time
- Auto-completion for response data structures
- Document all possible response types in the handler signature
- Ensure consistent API contracts

### Response Helpers

Built-in helpers for common HTTP responses with full type safety:

```typescript
import {
  json,        // JSON response with 200
  ok,          // 200 OK (alias for json with 200)
  created,     // 201 Created
  noContent,   // 204 No Content
  badRequest,  // 400 Bad Request
  notFound,    // 404 Not Found
  status,      // Custom status code
  stream,      // Streaming response
  // Type imports for response types
  type Ok,
  type Created,
  type NotFound,
  type BadRequest,
  type NoContent
} from 'wapix';

// JSON response with inferred type
return json({ users: [...] });  // HttpResult<{ users: User[] }>

// Created with location header
return created({ id: '123' }, { Location: '/users/123' });

// Not found with typed error
return notFound({ error: 'User not found' });  // NotFound<{ error: string }>

// Bad request with validation errors
return badRequest({ errors: ['Invalid email'] });  // BadRequest<{ errors: string[] }>

// No content
return noContent();  // NoContent

// Custom status
return status(418);  // HttpResult<void>
```

### Request Body Parsing

Request bodies are automatically parsed based on `Content-Type`:

```typescript
type RequestBody = { name: string; email: string };
type Response = Created<{ id: string }>;

const handler: RequestHandler<{}, Response, RequestBody> = async (req) => {
  const { name, email } = req.body;  // ✅ Parsed and type-safe

  // Validate and process...
  return created({ id: '123' });
};
```

### CLI Commands

```bash
# Development mode with hot reload
wapix dev

# Production mode
wapix start

# Options:
#   --port, -p <port>    Port to listen on (default: 3000)
#   --routes <path>      Routes directory (default: ./src/routes for dev, ./lib/routes for start)
#   --include, -i        Include patterns (can be specified multiple times, used with picomatch)
#   --exclude, -e        Exclude patterns (can be specified multiple times, used with picomatch)
```

#### Development Mode Watch Patterns

The `dev` command uses **picomatch** for flexible file watching with smart defaults:

**Default ignored patterns:**
- `**/.*` - Hidden files and directories
- `**/.*/**` - Contents of hidden directories
- `**/{node_modules,bower_components,vendor}/**` - Dependencies
- `**/dist/**` - Build output
- `**/build/**` - Build output
- `**/lib/**` - Compiled output

**Custom patterns:**

```bash
# Exclude additional patterns
wapix dev --exclude "**/*.test.ts" --exclude "**/temp/**"

# Include specific patterns (negates default ignores)
wapix dev --include "**/.config/**"

# Combine both
wapix dev --exclude "**/*.log" --include "**/src/**"
```

Picomatch supports powerful glob patterns:
- `**/*.ts` - All TypeScript files recursively
- `src/**/*.{ts,js}` - Multiple extensions in src
- `!**/test/**` - Negate patterns
- `{foo,bar}/**` - Match multiple directories

## 🎯 Examples

### Complete REST API Example

```typescript
// src/routes/posts/get.ts
import { json, type RequestHandler } from 'wapix';

const handler: RequestHandler = () => {
  const posts = db.posts.getAll();
  return json(posts);
};

export default handler;
```

```typescript
// src/routes/posts/post.ts
import { created, badRequest, type RequestHandler, type Created, type BadRequest } from 'wapix';

type Body = { title: string; content: string };

interface Post {
  id: string;
  title: string;
  content: string;
}

type Response = Created<Post> | BadRequest<{ error: string }>;

const handler: RequestHandler<{}, Response, Body> = (req) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return badRequest({ error: 'Missing required fields' });
  }

  const post = db.posts.create({ title, content });
  return created(post, `/posts/${post.id}`);
};

export default handler;
```

```typescript
// src/routes/posts/$postId/get.ts
import { json, notFound, type RequestHandler } from 'wapix';

type Params = { postId: string };

const handler: RequestHandler<Params> = (req) => {
  const post = db.posts.get(req.params.postId);

  if (!post) {
    return notFound({ error: 'Post not found' });
  }

  return json(post);
};

export default handler;
```

### Streaming Example

```typescript
// src/routes/stream/get.ts
import { stream, type RequestHandler } from 'wapix';
import { Readable } from 'node:stream';

const handler: RequestHandler = () => {
  const readable = new Readable({
    read() {
      this.push(`data: ${Date.now()}\n\n`);
    }
  });

  return stream(readable, 'text/event-stream');
};

export default handler;
```
## 🔧 Configuration

The framework is designed to be zero-config with sensible defaults, but offers flexibility when needed:

### CLI Options

Both `wapix dev` and `wapix start` support these options:

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--port` | `-p` | Port to listen on | `3000` (or `PORT` env var) |
| `--routes` | - | Routes directory | `./src/routes` (dev)<br/>`./lib/routes` (start) |

### Development Mode Options

The `wapix dev` command has additional options for controlling file watching:

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--include` | `-i` | Include patterns (picomatch) | `[]` |
| `--exclude` | `-e` | Exclude patterns (picomatch) | `[]` |

These options can be specified multiple times for multiple patterns.

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Setup

```bash
# Clone the repo
git clone https://github.com/yourusername/http.git
cd http

# Install dependencies
pnpm install

# Build the framework
cd packages/http
pnpm build

# Run the example
cd ../example
pnpm dev
```

## 📝 License

MIT © [BuildXN]

---

<div align="center">

**Built with ❤️ using TypeScript and Node.js**

[Report Bug](https://github.com/buildxn/http/issues) • [Request Feature](https://github.com/buildxn/http/issues)

</div>