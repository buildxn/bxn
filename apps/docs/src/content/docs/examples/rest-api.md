---
title: REST API Example
description: Complete example of building a REST API with bxn http
---

This example demonstrates building a complete CRUD REST API for managing blog posts with bxn http.

## Project Structure

```
src/routes/
├── posts/
│   ├── get.ts              # GET /posts - List all posts
│   ├── post.ts             # POST /posts - Create a post
│   └── $postId/
│       ├── get.ts          # GET /posts/:postId - Get single post
│       ├── put.ts          # PUT /posts/:postId - Update post
│       └── delete.ts       # DELETE /posts/:postId - Delete post
```

## Data Model

First, define the data types:

```typescript
// types.ts
export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostBody {
  title: string;
  content: string;
  author: string;
}

export interface UpdatePostBody {
  title?: string;
  content?: string;
}
```

## List All Posts

**Route:** `GET /posts`

```typescript
// src/routes/posts/get.ts
import { json, type RequestHandler, type Ok } from '@buildxn/http';
import type { Post } from '../../types';
import { db } from '../../db';

type Query = {
  page?: string;
  limit?: string;
  author?: string;
};

type Response = Ok<{ posts: Post[]; total: number }>;

const handler: RequestHandler<{}, Response, any, Query> = (req): Response => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);
  const author = req.query.author;

  let posts = db.posts.getAll();

  // Filter by author if specified
  if (author) {
    posts = posts.filter(post => post.author === author);
  }

  // Pagination
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedPosts = posts.slice(start, end);

  return json({
    posts: paginatedPosts,
    total: posts.length
  });
};

export default handler;
```

## Create Post

**Route:** `POST /posts`

```typescript
// src/routes/posts/post.ts
import {
  created,
  badRequest,
  type RequestHandler,
  type Created,
  type BadRequest
} from '@buildxn/http';
import type { Post, CreatePostBody } from '../../types';
import { db } from '../../db';

type Response = Created<Post> | BadRequest<{ errors: string[] }>;

const handler: RequestHandler<{}, Response, CreatePostBody> = (req): Response => {
  const { title, content, author } = req.body;
  const errors: string[] = [];

  // Validation
  if (!title || title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (!content || content.trim().length === 0) {
    errors.push('Content is required');
  }

  if (!author || author.trim().length === 0) {
    errors.push('Author is required');
  }

  if (title && title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  if (errors.length > 0) {
    return badRequest({ errors });
  }

  // Create post
  const post: Post = {
    id: crypto.randomUUID(),
    title: title.trim(),
    content: content.trim(),
    author: author.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.posts.create(post);

  return created(post, `/posts/${post.id}`);
};

export default handler;
```

## Get Single Post

**Route:** `GET /posts/:postId`

```typescript
// src/routes/posts/$postId/get.ts
import {
  json,
  notFound,
  type RequestHandler,
  type Ok,
  type NotFound
} from '@buildxn/http';
import type { Post } from '../../../types';
import { db } from '../../../db';

type Params = { postId: string };

type Response = Ok<Post> | NotFound<{ error: string }>;

const handler: RequestHandler<Params, Response> = (req): Response => {
  const { postId } = req.params;

  const post = db.posts.get(postId);

  if (!post) {
    return notFound({ error: 'Post not found' });
  }

  return json(post);
};

export default handler;
```

## Update Post

**Route:** `PUT /posts/:postId`

```typescript
// src/routes/posts/$postId/put.ts
import {
  json,
  notFound,
  badRequest,
  type RequestHandler,
  type Ok,
  type NotFound,
  type BadRequest
} from '@buildxn/http';
import type { Post, UpdatePostBody } from '../../../types';
import { db } from '../../../db';

type Params = { postId: string };

type Response =
  | Ok<Post>
  | NotFound<{ error: string }>
  | BadRequest<{ errors: string[] }>;

const handler: RequestHandler<Params, Response, UpdatePostBody> = (req): Response => {
  const { postId } = req.params;
  const { title, content } = req.body;

  const post = db.posts.get(postId);

  if (!post) {
    return notFound({ error: 'Post not found' });
  }

  const errors: string[] = [];

  // Validation
  if (title !== undefined && title.trim().length === 0) {
    errors.push('Title cannot be empty');
  }

  if (title && title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  if (content !== undefined && content.trim().length === 0) {
    errors.push('Content cannot be empty');
  }

  if (errors.length > 0) {
    return badRequest({ errors });
  }

  // Update post
  const updatedPost: Post = {
    ...post,
    title: title ? title.trim() : post.title,
    content: content ? content.trim() : post.content,
    updatedAt: new Date().toISOString()
  };

  db.posts.update(postId, updatedPost);

  return json(updatedPost);
};

export default handler;
```

## Delete Post

**Route:** `DELETE /posts/:postId`

```typescript
// src/routes/posts/$postId/delete.ts
import {
  noContent,
  notFound,
  type RequestHandler,
  type NoContent,
  type NotFound
} from '@buildxn/http';
import { db } from '../../../db';

type Params = { postId: string };

type Response = NoContent | NotFound<{ error: string }>;

const handler: RequestHandler<Params, Response> = (req): Response => {
  const { postId } = req.params;

  const deleted = db.posts.delete(postId);

  if (!deleted) {
    return notFound({ error: 'Post not found' });
  }

  return noContent();
};

export default handler;
```

## Database Layer

Simple in-memory database for the example:

```typescript
// db.ts
import type { Post } from './types';

class PostsDB {
  private posts: Map<string, Post> = new Map();

  getAll(): Post[] {
    return Array.from(this.posts.values());
  }

  get(id: string): Post | undefined {
    return this.posts.get(id);
  }

  create(post: Post): Post {
    this.posts.set(post.id, post);
    return post;
  }

  update(id: string, post: Post): Post | undefined {
    if (!this.posts.has(id)) {
      return undefined;
    }
    this.posts.set(id, post);
    return post;
  }

  delete(id: string): boolean {
    return this.posts.delete(id);
  }
}

export const db = {
  posts: new PostsDB()
};
```

## Testing the API

### Create a Post

```bash
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Post",
    "content": "This is the content of my first post.",
    "author": "John Doe"
  }'
```

**Response:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "My First Post",
  "content": "This is the content of my first post.",
  "author": "John Doe",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### List All Posts

```bash
curl http://localhost:3000/posts
```

### Get Single Post

```bash
curl http://localhost:3000/posts/123e4567-e89b-12d3-a456-426614174000
```

### Update Post

```bash
curl -X PUT http://localhost:3000/posts/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title"
  }'
```

### Delete Post

```bash
curl -X DELETE http://localhost:3000/posts/123e4567-e89b-12d3-a456-426614174000
```

## Key Features Demonstrated

- **File-System Routing**: Routes automatically mapped from directory structure
- **Type Safety**: Full TypeScript types for params, bodies, and responses
- **Response Helpers**: Using `json()`, `created()`, `notFound()`, `badRequest()`, `noContent()`
- **Validation**: Input validation with detailed error messages
- **CRUD Operations**: Complete Create, Read, Update, Delete functionality
- **Query Parameters**: Filtering and pagination support
- **Error Handling**: Proper HTTP status codes for all scenarios

## Next Steps

- Add [Streaming](../../examples/streaming/) for real-time updates
- Implement authentication and authorization
- Add database integration (PostgreSQL, MongoDB, etc.)
- Add request validation library (Zod, Joi, etc.)
- Implement rate limiting
- Add logging and monitoring
