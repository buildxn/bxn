---
title: CLI Commands
description: Complete reference for wapix CLI commands
---

wapix provides a simple command-line interface for running your API in development and production modes.

## Commands

### dev

Start the development server with hot reload.

```bash
wapix dev [options]
```

**Features:**
- Automatic route reloading when files change
- Fast refresh without restarting the server
- Smart file watching with configurable patterns

**Options:**

| Option | Alias | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--port` | `-p` | number | `3000` | Port to listen on |
| `--routes` | - | string | `./src/routes` | Routes directory path |
| `--key` | - | string | - | Path to SSL private key file (for HTTPS) |
| `--cert` | - | string | - | Path to SSL certificate file (for HTTPS) |
| `--include` | `-i` | string[] | `[]` | Include patterns (picomatch) |
| `--exclude` | `-e` | string[] | `[]` | Exclude patterns (picomatch) |

**Examples:**

```bash
# Basic usage
wapix dev

# Custom port
wapix dev --port 8080
wapix dev -p 8080

# Custom routes directory
wapix dev --routes ./api/routes

# Exclude test files
wapix dev --exclude "**/*.test.ts" --exclude "**/*.spec.ts"

# Include specific patterns
wapix dev --include "**/.config/**"

# Multiple options
wapix dev -p 8080 --routes ./api --exclude "**/*.test.ts"

# HTTPS in development
wapix dev --key ./ssl/key.pem --cert ./ssl/cert.pem

# HTTPS with custom port
wapix dev --port 3443 --key ./ssl/key.pem --cert ./ssl/cert.pem
```

### start

Start the production server.

```bash
wapix start [options]
```

**Features:**
- Optimized for production
- Runs compiled JavaScript from build output
- No file watching overhead

**Options:**

| Option | Alias | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--port` | `-p` | number | `3000` | Port to listen on |
| `--routes` | - | string | `./lib/routes` | Routes directory path |
| `--key` | - | string | - | Path to SSL private key file (for HTTPS) |
| `--cert` | - | string | - | Path to SSL certificate file (for HTTPS) |

**Examples:**

```bash
# Basic usage (after building)
wapix start

# Custom port
wapix start --port 8080
wapix start -p 8080

# Custom routes directory
wapix start --routes ./dist/routes

# HTTPS in production
wapix start --port 443 --key ./ssl/key.pem --cert ./ssl/cert.pem

# HTTPS with custom routes
wapix start --port 443 --routes ./dist/routes --key ./ssl/key.pem --cert ./ssl/cert.pem
```

## HTTPS Support

Both `wapix dev` and `wapix start` support HTTPS by providing SSL certificate files.

### Requirements

To enable HTTPS, you must provide both:
- `--key` - Path to your SSL private key file (PEM format)
- `--cert` - Path to your SSL certificate file (PEM format)

Both options must be provided together. If only one is provided, the server will start in HTTP mode.

### Development Setup

For local development, you can generate a self-signed certificate:

```bash
# Generate self-signed certificate (valid for 365 days)
openssl req -x509 -newkey rsa:4096 \
  -keyout key.pem -out cert.pem \
  -days 365 -nodes \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

# Start dev server with HTTPS
wapix dev --key ./key.pem --cert ./cert.pem
```

Your server will be available at `https://localhost:3000`

**Note:** Browsers will show a security warning for self-signed certificates. This is expected for development.

### Production Setup

For production, use certificates from a trusted Certificate Authority (CA):

```bash
# Using Let's Encrypt certificates (example paths)
wapix start \
  --port 443 \
  --key /etc/letsencrypt/live/yourdomain.com/privkey.pem \
  --cert /etc/letsencrypt/live/yourdomain.com/fullchain.pem
```

### Examples

```bash
# Development with HTTPS
wapix dev --key ./ssl/key.pem --cert ./ssl/cert.pem

# Development with HTTPS on custom port
wapix dev --port 3443 --key ./ssl/key.pem --cert ./ssl/cert.pem

# Production with HTTPS
wapix start --port 443 --key ./ssl/key.pem --cert ./ssl/cert.pem

# Production with HTTPS and custom routes
wapix start \
  --port 443 \
  --routes ./dist/routes \
  --key ./ssl/key.pem \
  --cert ./ssl/cert.pem
```

### Path Resolution

Certificate file paths are resolved relative to the current working directory:

```bash
# Relative paths
wapix start --key ./ssl/key.pem --cert ./ssl/cert.pem

# Absolute paths
wapix start --key /etc/ssl/key.pem --cert /etc/ssl/cert.pem
```

### Programmatic HTTPS

You can also configure HTTPS programmatically using the `createServer` API:

```typescript
import { createServer } from 'wapix';
import { readFileSync } from 'fs';

const server = createServer(
  routes,
  {
    https: {
      key: readFileSync('./ssl/key.pem'),
      cert: readFileSync('./ssl/cert.pem')
    }
  }
);

server.listen(443);
```

## Environment Variables

### PORT

Set the default port via environment variable:

```bash
PORT=8080 wapix dev
PORT=8080 wapix start
```

**Note:** The `--port` flag takes precedence over the `PORT` environment variable.

## File Watching (dev mode)

The `wapix dev` command uses **picomatch** for flexible file watching patterns.

### Default Ignored Patterns

The following patterns are ignored by default:

- `**/.*` - Hidden files and directories
- `**/.*/**` - Contents of hidden directories
- `**/{node_modules,bower_components,vendor}/**` - Dependencies
- `**/dist/**` - Build output
- `**/build/**` - Build output
- `**/lib/**` - Compiled output

### Custom Watch Patterns

Use `--include` and `--exclude` for custom patterns:

```bash
# Exclude additional patterns
wapix dev --exclude "**/*.test.ts" --exclude "**/temp/**"

# Include specific patterns (negates default ignores)
wapix dev --include "**/.config/**"

# Combine both
wapix dev --exclude "**/*.log" --include "**/src/**"
```

### Picomatch Patterns

Picomatch supports powerful glob patterns:

```bash
# All TypeScript files recursively
--exclude "**/*.ts"

# Multiple extensions in src
--include "src/**/*.{ts,js}"

# Negate patterns
--exclude "!**/test/**"

# Match multiple directories
--include "{foo,bar}/**"
```

## Common Workflows

### Development

```bash
# Start development server
pnpm dev
# or
npx wapix dev
```

### Production

```bash
# 1. Build your TypeScript code
pnpm build
# or
tsc

# 2. Start production server
pnpm start
# or
npx wapix start
```

### Custom Setup

```bash
# Development with custom configuration
wapix dev \
  --port 8080 \
  --routes ./src/api/routes \
  --exclude "**/*.test.ts" \
  --exclude "**/__tests__/**"

# Production with custom configuration
wapix start \
  --port 8080 \
  --routes ./dist/api/routes
```

## Configuration via package.json

Add scripts to your `package.json` for convenience:

```json
{
  "scripts": {
    "dev": "wapix dev",
    "start": "wapix start",
    "dev:custom": "wapix dev --port 8080 --exclude '**/*.test.ts'",
    "build": "tsc",
    "prod": "npm run build && wapix start"
  }
}
```

Then run:

```bash
npm run dev
npm run start
npm run dev:custom
npm run prod
```

## Examples

### Development with Custom Port

```bash
wapix dev --port 8080
```

Your API will be available at `http://localhost:8080`

### Exclude Test Files

```bash
wapix dev \
  --exclude "**/*.test.ts" \
  --exclude "**/*.spec.ts" \
  --exclude "**/__tests__/**"
```

### Watch Only Specific Directory

```bash
wapix dev \
  --include "src/routes/**" \
  --exclude "**/node_modules/**"
```

### Production with Custom Routes

```bash
# After building
tsc

# Run with custom routes directory
wapix start --routes ./dist/api/routes
```

## Troubleshooting

### Port Already in Use

If you get a port conflict error:

```bash
# Use a different port
wapix dev --port 3001
```

Or set the PORT environment variable:

```bash
PORT=3001 wapix dev
```

### Routes Not Loading

Verify your routes directory:

```bash
# Check the default location
ls -la ./src/routes

# Or specify custom location
wapix dev --routes ./your/routes/path
```

### Hot Reload Not Working

Check if files are being watched:

```bash
# Include your routes directory explicitly
wapix dev --include "src/routes/**"
```

## Next Steps

- Read about [File-System Routing](/core/file-system-routing/) to understand route structure
- See [Quick Start](/getting-started/quick-start/) for a complete setup guide
