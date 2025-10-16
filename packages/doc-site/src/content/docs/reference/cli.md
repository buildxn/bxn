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

**Examples:**

```bash
# Basic usage (after building)
wapix start

# Custom port
wapix start --port 8080
wapix start -p 8080

# Custom routes directory
wapix start --routes ./dist/routes
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
