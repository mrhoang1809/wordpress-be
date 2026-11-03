# GRAPH REPORT — viber-wordpress/be

> **Built:** 2025-07-14 | **Nodes:** 92 | **Edges:** 126 | **Communities:** 13

---

## 1. Executive Summary

This workspace is the **NestJS REST API backend** for a WordPress-like CMS serving a Vietnamese fitness brand. It is a monolith structured as feature modules, backed by PostgreSQL via Prisma ORM, and secured by JWT access tokens + HttpOnly refresh cookie token rotation.

### Tech Stack
| Concern | Choice |
|---|---|
| Framework | NestJS (Express adapter) |
| Language | TypeScript 5 |
| ORM | Prisma 6.x |
| Database | PostgreSQL |
| Auth | Passport JWT (access + refresh strategies) |
| Validation | class-validator + class-transformer |
| Rate limiting | NestJS ThrottlerModule (100 req / 60s default) |
| File upload | Multer (disk storage) |
| API docs | Swagger/OpenAPI (at `/api/docs`) |
| Token hashing | SHA-256 (crypto) |
| Password hashing | bcryptjs |

### Key Numbers
- **102 nodes** — 13 feature modules, 20 Prisma models, 12+ controllers, 1 app root
- **148 edges** (imports, calls, auth_guards)
- **14 communities** by NestJS module
- **Global prefix:** `/api/v1`
- **Public endpoints:** 10 (decorated with `@Public()`)
- **Auth-guarded endpoints:** All others via global `JwtAuthGuard` + `PermissionsGuard`
- **Swagger UI:** `http://localhost:{port}/api/docs`

---

## 2. Architecture Overview

```
Client Request → app.listen(port)
    │
    ├── CORS (origin whitelist from config)
    ├── cookie-parser (reads HttpOnly refresh cookie)
    ├── Static files: /api/v1/media/uploads → ./uploads/
    ├── ValidationPipe (global, whitelist, transform)
    ├── AllExceptionsFilter (global)
    ├── LoggingInterceptor (global)
    ├── JwtAuthGuard (global) ─ skips @Public() routes
    └── PermissionsGuard (global) ─ checks @RequirePermissions()
            │
            └─► AppModule
                    ├── ConfigModule (global, Joi validation)
                    ├── ThrottlerModule
                    ├── DatabaseModule → PrismaService → PostgreSQL
                    └── Feature Modules:
                        AuthModule, UsersModule, PagesModule, PostsModule,
                        CategoriesModule, MenusModule, MediaModule,
                        SettingsModule, MessagingModule, PromotionsModule,
                        LocationsModule, RevalidationModule
```

### Module Pattern (consistent across all features)
```
*.module.ts
  ├── imports: [DatabaseModule]  (for PrismaService)
  ├── controllers: [*Controller, Public*Controller]  (admin + public splits)
  └── providers: [*Service]

*.controller.ts
  ├── @UseGuards(JwtAuthGuard, PermissionsGuard)  (class-level)
  ├── @RequirePermissions('module:action')  (method-level)
  └── inject *Service

*.service.ts
  └── inject PrismaService → prisma.model.*(...)
```

### Auth Architecture
```
Access Token (JWT, short-lived)
    └── Stored in memory (frontend Zustand store)
    └── Sent as: Authorization: Bearer <token>
    └── Contains: { sub, email, roles[], permissions[] }

Refresh Token (JWT, 7 days)
    └── Stored as HttpOnly cookie (path: /)
    └── Hashed (SHA-256) and saved in DB → refresh_tokens table
    └── Rotation: old token revoked on use, new token issued
    └── Guards: JwtRefreshGuard (Passport jwt-refresh strategy)
```

---

## 3. Community Breakdown

### 3.1 `common` — Infrastructure (12 nodes, cohesion: 0.75)

**Purpose:** Cross-cutting concerns applied globally.

| File | Role |
|---|---|
| `src/main.ts` | Bootstrap: global prefix, CORS, pipes, guards, filters, interceptors, Swagger |
| `src/app.module.ts` | Root module importing all feature modules |
| `src/config/configuration.ts` | Env var loading + Joi validation schema |
| `src/common/filters/all-exceptions.filter.ts` | Normalizes all errors to `{ statusCode, message, details }` |
| `src/common/interceptors/logging.interceptor.ts` | Request/response logging |
| `src/common/guards/jwt-auth.guard.ts` | Global JWT guard, skips `@Public()` |
| `src/common/guards/jwt-refresh.guard.ts` | Refresh endpoint guard |
| `src/common/guards/permissions.guard.ts` | Checks `user.permissions[]` against `@RequirePermissions()` |
| `src/common/decorators/public.decorator.ts` | `@Public()` — bypasses JWT guard |
| `src/common/decorators/current-user.decorator.ts` | `@CurrentUser()` — extracts JWT payload from req |
| `src/common/decorators/require-permissions.decorator.ts` | `@RequirePermissions('x:y')` |
| `src/common/dto/pagination.dto.ts` | `PaginationQueryDto`: page, pageSize, search |
| `src/common/types/jwt-payload.type.ts` | `JwtPayload`: sub, email, roles, permissions |

**Critical:** `JwtAuthGuard` is registered globally in `main.ts` — every endpoint is protected by default. Only `@Public()` routes bypass it.

---

### 3.2 `database` — Database Layer (3 nodes, cohesion: 1.0)

**Purpose:** Prisma client as injectable NestJS service.

| File | Role |
|---|---|
| `prisma/schema.prisma` | Single source of truth for all DB models |
| `src/database/prisma.service.ts` | `PrismaClient` subclass with lifecycle hooks |
| `src/database/database.module.ts` | Global module — all other modules can inject `PrismaService` |

`PrismaService` is the most-injected class in the codebase — every service layer depends on it.

---

### 3.3 `auth-module` — Auth Module (9 nodes, cohesion: 0.92)

**Purpose:** Authentication and authorization infrastructure.

**Endpoints:**

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | `@Public()` | Email+password login, sets refresh cookie |
| POST | `/auth/refresh` | `JwtRefreshGuard` | Rotates refresh token |
| POST | `/auth/logout` | `JwtAuthGuard` | Revokes token, clears cookie |
| GET | `/auth/me` | `JwtAuthGuard` | Current user profile |

**Login flow:**
1. `prisma.user.findUnique({ email })` with full role+permission include
2. `bcrypt.compare(password, hash)`
3. Build `JwtPayload` with roles[] and flattened permissions[]
4. `jwtService.signAsync` → access token
5. Generate refresh token, hash it, store in DB, set HttpOnly cookie

**Refresh flow:**
1. `JwtRefreshGuard` extracts raw refresh token from cookie
2. Hash it, look up in DB → validate not revoked and not expired
3. Revoke old token (mark `revokedAt`)
4. Issue new access + refresh token (rotation)

**Models:** `User`, `Role`, `Permission`, `UserRole`, `RolePermission`, `RefreshToken`

---

### 3.4 `users-module` — Users Module (4 nodes, cohesion: 0.88)

**Purpose:** Admin user management.

**Endpoints (all require `users:*` permissions):**

| Method | Path | Permission |
|---|---|---|
| GET | `/users` | `users:list` |
| GET | `/users/:id` | `users:read` |
| POST | `/users` | `users:create` |
| PATCH | `/users/:id` | `users:update` |
| DELETE | `/users/:id` | `users:delete` |
| POST | `/users/:id/roles` | `users:manage-roles` |
| DELETE | `/users/:id/roles/:role` | `users:manage-roles` |

**Model:** `User` (id, email, passwordHash, firstName, lastName, status, avatar)

---

### 3.5 `pages-module` — Pages Module (6 nodes, cohesion: 0.90)

**Purpose:** CMS page management with block-based content.

**Endpoints:**

| Method | Path | Auth | Permission |
|---|---|---|---|
| GET | `/pages` | Admin | `pages:list` |
| GET | `/pages/:id` | Admin | `pages:read` |
| POST | `/pages` | Admin | `pages:create` |
| PATCH | `/pages/:id` | Admin | `pages:update` |
| DELETE | `/pages/:id` | Admin | `pages:delete` |
| POST | `/pages/:id/publish` | Admin | `pages:publish` |
| POST | `/pages/:id/unpublish` | Admin | `pages:publish` |
| POST | `/pages/:id/duplicate` | Admin | `pages:create` |
| GET | `/pages/:id/blocks` | Admin | `pages:read` |
| PUT | `/pages/:id/blocks` | Admin | `pages:update` |
| GET | `/public/pages/:slug` | `@Public()` | — |

**Block sync** (`PUT /pages/:id/blocks`) is transactional: deletes all existing blocks, recreates them in order. Uses `dto.version` for optimistic concurrency check.

**Models:** `Page`, `PageBlock`

---

### 3.6 `posts-module` — Posts Module (6 nodes, cohesion: 0.88)

**Purpose:** Blog post management with public engagement API.

**Endpoints:**

| Method | Path | Auth | Permission |
|---|---|---|---|
| GET | `/posts` | Admin | `posts:list` |
| GET | `/posts/:id` | Admin | `posts:read` |
| POST | `/posts` | Admin | `posts:create` |
| PATCH | `/posts/:id` | Admin | `posts:update` |
| DELETE | `/posts/:id` | Admin | `posts:delete` |
| POST | `/posts/:id/publish` | Admin | `posts:publish` |
| POST | `/posts/:id/unpublish` | Admin | `posts:publish` |
| GET | `/posts/:id/blocks` | Admin | `posts:read` |
| PUT | `/posts/:id/blocks` | Admin | `posts:update` |
| GET | `/public/posts` | `@Public()` | — |
| GET | `/public/posts/:slug` | `@Public()` | — |
| GET | `/public/posts/:slug/engagement` | `@Public()` | — |
| POST | `/public/posts/:slug/views` | `@Public()` | — |
| POST | `/public/posts/:slug/likes` | `@Public()` | — |
| POST | `/public/posts/:slug/comments` | `@Public()` | — |

**`listPublicPosts` filters:** page, pageSize, categorySlug (joins PostCategory → Category), search (title/excerpt LIKE)

**Models:** `Post`, `PostBlock`, `PostComment`, `PostCategory`

---

### 3.7 `categories-module` — Categories Module (4 nodes, cohesion: 0.88)

**Purpose:** Blog post categorization with tree structure.

**Endpoints:**

| Method | Path | Auth |
|---|---|---|
| GET | `/categories` | Admin |
| GET | `/categories/:id` | Admin |
| POST | `/categories` | Admin |
| PATCH | `/categories/:id` | Admin |
| DELETE | `/categories/:id` | Admin |
| GET | `/public/categories` | `@Public()` |
| GET | `/public/categories/:slug` | `@Public()` |

**Model:** `Category` (id, name, slug, parentId self-ref, imageId, order, isActive)

Tree is built via recursive Prisma include on `children`. `parentId=null` nodes are roots.

---

### 3.8 `menus-module` — Menus Module (5 nodes, cohesion: 0.88)

**Purpose:** Navigation menu builder with nested items.

**Endpoints:**

| Method | Path | Auth |
|---|---|---|
| GET | `/menus` | Admin |
| GET | `/menus/:id` | Admin |
| POST | `/menus` | Admin |
| PATCH | `/menus/:id` | Admin |
| DELETE | `/menus/:id` | Admin |
| PUT | `/menus/:id/items` | Admin |
| GET | `/public/menus/:location` | `@Public()` |

**`PUT /menus/:id/items`** — bulk sync: delete all existing items, recreate nested tree in transaction.

**Models:** `Menu` (location enum: HEADER/FOOTER/SIDEBAR/CUSTOM), `MenuItem` (type: PAGE/POST/CATEGORY/CUSTOM_URL, parentId self-ref)

---

### 3.9 `media-module` — Media Module (4 nodes, cohesion: 0.90)

**Purpose:** File upload and media library.

**Endpoints:**

| Method | Path | Auth | Permission |
|---|---|---|---|
| GET | `/media` | Admin | `media:list` |
| GET | `/media/:id` | Admin | `media:read` |
| POST | `/media` | Admin | `media:upload` |
| PATCH | `/media/:id` | Admin | `media:update` |
| DELETE | `/media/:id` | Admin | `media:delete` |

**Upload config (Multer):**
- Storage: disk (`./uploads/`)
- Filename: `uuidv4() + ext`
- Allowed types: jpeg, png, gif, webp, svg+xml
- Max size: 10 MB

Files are served statically at `/api/v1/media/uploads/{filename}` via Express static middleware (configured in `main.ts`).

**Model:** `Media` (storageKey, url, mimeType, size, width, height, altText, caption)

---

### 3.10 `settings-module` — Settings Module (4 nodes, cohesion: 0.90)

**Purpose:** Singleton site settings (siteName, logo, SEO defaults, social links).

**Endpoints:**

| Method | Path | Auth | Permission |
|---|---|---|---|
| GET | `/settings` | `@Public()` | — |
| PATCH | `/settings` | Admin | `settings:update` |

**Model:** `SiteSetting` — upsert-one pattern (only one record ever exists)

---

### 3.11 `messaging-module` — Messaging Module (11 nodes, cohesion: 0.84)

**Purpose:** Multi-platform messaging campaigns for Zalo and Facebook.

**Three sub-controllers:**
1. `CampaignsController` (`/messaging/campaigns`)
2. `SubscribersController` (`/messaging/subscribers`)
3. `TemplatesController` (`/messaging/templates`)

**Campaign Endpoints:**

| Method | Path | Permission |
|---|---|---|
| GET | `/messaging/campaigns` | `messages:list` |
| GET | `/messaging/campaigns/:id` | `messages:read` |
| GET | `/messaging/campaigns/:id/stats` | `messages:read` |
| POST | `/messaging/campaigns` | `messages:create` |
| PATCH | `/messaging/campaigns/:id` | `messages:update` |
| POST | `/messaging/campaigns/:id/send` | `messages:send` |
| POST | `/messaging/campaigns/:id/cancel` | `messages:send` |
| DELETE | `/messaging/campaigns/:id` | `messages:delete` |

**Subscriber Endpoints:**

| Method | Path | Permission |
|---|---|---|
| GET | `/messaging/subscribers` | `messages:list` |
| GET | `/messaging/subscribers/tags` | `messages:list` |
| POST | `/messaging/subscribers` | `messages:create` |
| POST | `/messaging/subscribers/import` | `messages:create` |
| PATCH | `/messaging/subscribers/:id` | `messages:update` |
| DELETE | `/messaging/subscribers/:id` | `messages:delete` |

**Campaign lifecycle:** DRAFT → QUEUED (scheduled) → SENDING → COMPLETED / FAILED / CANCELLED

**Send flow:** `CampaignsService.send()` → filters `Subscriber` by targetTags → creates `MessageRecipient` records → dispatches to `ZaloProvider` or `FacebookProvider` → updates delivery status.

**Models:** `Subscriber`, `MessageCampaign`, `MessageRecipient`, `MessageTemplate`

---

### 3.12 `promotions-module` — Promotions Module (4 nodes, cohesion: 0.90)

**Purpose:** Promotion countdown banners shown on the public website.

**Endpoints:**

| Method | Path | Auth | Permission |
|---|---|---|---|
| GET | `/promotions` | Admin | `promotions:list` |
| GET | `/promotions/:id` | Admin | `promotions:read` |
| POST | `/promotions` | Admin | `promotions:create` |
| PATCH | `/promotions/:id` | Admin | `promotions:update` |
| DELETE | `/promotions/:id` | Admin | `promotions:delete` |
| POST | `/promotions/:id/activate` | Admin | `promotions:update` |
| POST | `/promotions/:id/deactivate` | Admin | `promotions:update` |
| GET | `/public/promotions/active` | `@Public()` | — |

**`activate` logic:** wraps in transaction — deactivates all banners, then activates the target. Only one banner can be active at a time.

**Model:** `PromotionBanner` (headline, badgeText, ctaLabel, endsAt, gradient Tailwind classes, isActive, sortOrder)

---

### 3.13 `locations-module` — Locations Module (4 nodes, cohesion: 0.90)

**Purpose:** Gym branch directory.

**Endpoints:**

| Method | Path | Auth | Permission |
|---|---|---|---|
| GET | `/locations` | Admin | `locations:list` |
| GET | `/locations/:id` | Admin | `locations:read` |
| POST | `/locations` | Admin | `locations:create` |
| PATCH | `/locations/:id` | Admin | `locations:update` |
| DELETE | `/locations/:id` | Admin | `locations:delete` |
| GET | `/public/locations` | `@Public()` | — |

**`findActive()`** returns locations where `isActive=true`, ordered by `order` field.

**Model:** `Location` (name, slug, address, phone, email, lat/lng, isActive, order)

---

## 4. Critical Paths

### 4.1 Login → JWT → Protected Resource
```
POST /auth/login { email, password }
  → AuthService.login()
      → prisma.user.findUnique + include roles + permissions
      → bcrypt.compare(password, hash)
      → build JwtPayload { sub, email, roles[], permissions[] }
      → jwtService.signAsync(payload) → accessToken
      → generateRefreshToken → hash → prisma.refreshToken.create
      → res.cookie('refreshToken', rawToken, { httpOnly: true })
      → return { accessToken, user }

frontend stores accessToken in Zustand (memory)

GET /some-protected-endpoint
  Headers: Authorization: Bearer <accessToken>
  → JwtAuthGuard.canActivate()
      → JwtStrategy.validate(payload) → req.user = payload
  → PermissionsGuard.canActivate()
      → read @RequirePermissions() metadata
      → check payload.permissions.includes(required)
  → Controller method
      → @CurrentUser() user: JwtPayload
```

### 4.2 Refresh Token Rotation
```
POST /auth/refresh
  Cookie: refreshToken=<rawToken>
  → JwtRefreshGuard → JwtRefreshStrategy
      → extracts rawToken from cookie
      → jwtService.verifyAsync(rawToken, refreshSecret) → payload
      → passes payload + rawToken to controller
  → AuthService.refresh(userId, rawToken, res)
      → hashToken(rawToken) → tokenHash
      → prisma.refreshToken.findUnique({ token: tokenHash })
          → validate: not revokedAt, not expired, userId matches
      → prisma.refreshToken.update({ revokedAt: now })  [revoke old]
      → generateAccessToken(newPayload) → new accessToken
      → setRefreshTokenCookie(newPayload, res)  [new refresh token]
      → return { accessToken }
```

### 4.3 Public Blog Listing with Category Filter
```
GET /public/posts?page=1&pageSize=12&categorySlug=truyen-cam-hung
  → @Public() → JwtAuthGuard skips
  → PublicPostsController.listPublic()
  → PostsService.listPublicPosts({ page:1, pageSize:12, categorySlug })
      → prisma.post.findMany({
            where: {
              status: 'PUBLISHED',
              postCategories: { some: { category: { slug: categorySlug } } }
            },
            include: { featuredImage, author, postCategories.category },
            orderBy: { publishedAt: 'desc' },
            skip: (page-1) * pageSize,
            take: pageSize
          })
      → return { data: posts, meta: { total, page, pageSize, totalPages } }
```

### 4.4 Page Publish → ISR Revalidation
```
POST /pages/:id/publish
  → PagesController.publish()
  → PagesService.publish(id, user)
      → prisma.page.update({ status: 'PUBLISHED', publishedAt: now })
      → RevalidationService.revalidate(slug)
          → POST http://<NEXT_FRONTEND_URL>/api/revalidate
            { secret: REVALIDATION_SECRET, path: '/' + slug }
          → Next.js revalidates ISR cache for that path
      → return updated page
```

### 4.5 Campaign Send Flow
```
POST /messaging/campaigns/:id/send
  → @RequirePermissions('messages:send')
  → CampaignsController.send(id, user)
  → CampaignsService.send(id, user)
      → prisma.messageCampaign.findUnique(id)  [must be DRAFT or QUEUED]
      → prisma.subscriber.findMany({
            where: { isActive: true, tags: { hasSome: campaign.targetTags } }
          })
      → prisma.messageCampaign.update({ status: 'SENDING', startedAt: now })
      → for each subscriber:
          → prisma.messageRecipient.create({ campaignId, subscriberId })
          → provider.send(subscriber, campaign.content)  [ZaloProvider/FacebookProvider]
          → update MessageRecipient.status = SENT/FAILED
      → prisma.messageCampaign.update({ status: 'COMPLETED', completedAt, sentCount, failedCount })
```

---

## 5. God Nodes

| Node | Type | Fan-in | Why it's a hub |
|---|---|---|---|
| `PrismaService` | FILE | 13 | Every service layer injects it |
| `JwtAuthGuard` | FILE | 12+ | Imported by every controller + main.ts |
| `PermissionsGuard` | FILE | 12+ | Imported by every admin controller + main.ts |
| `RequirePermissions` | FILE | 11 | Every method in admin controllers |
| `Public` | FILE | 8 | Every public endpoint controller |
| `CurrentUser` | FILE | 8 | All controllers handling authenticated routes |
| `JwtPayload` | FILE | 10 | All services, controllers, guards |
| `PaginationQueryDto` | FILE | 9 | All list endpoints |

---

## 6. API Surface

### Public Endpoints (no auth required)
```
GET    /api/v1/public/locations
GET    /api/v1/public/pages/:slug
GET    /api/v1/public/posts
GET    /api/v1/public/posts/:slug
GET    /api/v1/public/posts/:slug/engagement
POST   /api/v1/public/posts/:slug/views
POST   /api/v1/public/posts/:slug/likes
POST   /api/v1/public/posts/:slug/comments
GET    /api/v1/public/categories
GET    /api/v1/public/categories/:slug
GET    /api/v1/public/menus/:location
GET    /api/v1/public/promotions/active
GET    /api/v1/settings
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
```

### Auth Module (`/api/v1/auth`)
```
POST   /auth/login            (public)
POST   /auth/refresh          (refresh cookie)
POST   /auth/logout           (bearer)
GET    /auth/me               (bearer)
```

### Users Module (`/api/v1/users`)
```
GET    /users                 (users:list)
GET    /users/:id             (users:read)
POST   /users                 (users:create)
PATCH  /users/:id             (users:update)
DELETE /users/:id             (users:delete)
POST   /users/:id/roles       (users:manage-roles)
DELETE /users/:id/roles/:role (users:manage-roles)
```

### Pages Module (`/api/v1/pages`)
```
GET    /pages                     (pages:list)
GET    /pages/:id                 (pages:read)
POST   /pages                     (pages:create)
PATCH  /pages/:id                 (pages:update)
DELETE /pages/:id                 (pages:delete)
POST   /pages/:id/publish         (pages:publish)
POST   /pages/:id/unpublish       (pages:publish)
POST   /pages/:id/duplicate       (pages:create)
GET    /pages/:id/blocks          (pages:read)
PUT    /pages/:id/blocks          (pages:update)
GET    /public/pages/:slug        (public)
```

### Posts Module (`/api/v1/posts`)
```
GET    /posts                           (posts:list)
GET    /posts/:id                       (posts:read)
POST   /posts                           (posts:create)
PATCH  /posts/:id                       (posts:update)
DELETE /posts/:id                       (posts:delete)
POST   /posts/:id/publish               (posts:publish)
POST   /posts/:id/unpublish             (posts:publish)
GET    /posts/:id/blocks                (posts:read)
PUT    /posts/:id/blocks                (posts:update)
GET    /public/posts                    (public)
GET    /public/posts/:slug              (public)
GET    /public/posts/:slug/engagement   (public)
POST   /public/posts/:slug/views        (public)
POST   /public/posts/:slug/likes        (public)
POST   /public/posts/:slug/comments     (public)
```

### Categories Module (`/api/v1/categories`)
```
GET    /categories          (categories:list)
GET    /categories/:id      (categories:read)
POST   /categories          (categories:create)
PATCH  /categories/:id      (categories:update)
DELETE /categories/:id      (categories:delete)
GET    /public/categories   (public)
GET    /public/categories/:slug (public)
```

### Menus Module (`/api/v1/menus`)
```
GET    /menus               (menus:list)
GET    /menus/:id           (menus:read)
POST   /menus               (menus:create)
PATCH  /menus/:id           (menus:update)
DELETE /menus/:id           (menus:delete)
PUT    /menus/:id/items     (menus:update)
GET    /public/menus/:location (public)
```

### Media Module (`/api/v1/media`)
```
GET    /media               (media:list)
GET    /media/:id           (media:read)
POST   /media               (media:upload) — multipart/form-data
PATCH  /media/:id           (media:update)
DELETE /media/:id           (media:delete)
```

### Settings Module (`/api/v1/settings`)
```
GET    /settings            (public)
PATCH  /settings            (settings:update)
```

### Messaging Module (`/api/v1/messaging`)
```
GET    /messaging/campaigns                     (messages:list)
GET    /messaging/campaigns/:id                 (messages:read)
GET    /messaging/campaigns/:id/stats           (messages:read)
POST   /messaging/campaigns                     (messages:create)
PATCH  /messaging/campaigns/:id                 (messages:update)
POST   /messaging/campaigns/:id/send            (messages:send)
POST   /messaging/campaigns/:id/cancel          (messages:send)
DELETE /messaging/campaigns/:id                 (messages:delete)
GET    /messaging/subscribers                   (messages:list)
GET    /messaging/subscribers/tags              (messages:list)
GET    /messaging/subscribers/:id               (messages:read)
POST   /messaging/subscribers                   (messages:create)
POST   /messaging/subscribers/import            (messages:create)
PATCH  /messaging/subscribers/:id               (messages:update)
DELETE /messaging/subscribers/:id               (messages:delete)
GET    /messaging/templates                     (messages:list)
GET    /messaging/templates/:id                 (messages:read)
POST   /messaging/templates                     (messages:create)
PATCH  /messaging/templates/:id                 (messages:update)
DELETE /messaging/templates/:id                 (messages:delete)
```

### Promotions Module (`/api/v1/promotions`)
```
GET    /promotions              (promotions:list)
GET    /promotions/:id          (promotions:read)
POST   /promotions              (promotions:create)
PATCH  /promotions/:id          (promotions:update)
DELETE /promotions/:id          (promotions:delete)
POST   /promotions/:id/activate   (promotions:update)
POST   /promotions/:id/deactivate (promotions:update)
GET    /public/promotions/active  (public)
```

### Locations Module (`/api/v1/locations`)
```
GET    /locations           (locations:list)
GET    /locations/:id       (locations:read)
POST   /locations           (locations:create)
PATCH  /locations/:id       (locations:update)
DELETE /locations/:id       (locations:delete)
GET    /public/locations    (public)
```

---

## 7. Database Schema Summary

### Identity & Permissions
```
User ──< UserRole >── Role ──< RolePermission >── Permission
User ──< RefreshToken
```

### Content
```
User ──< Page ──< PageBlock
User ──< Post ──< PostBlock
               └──< PostComment
               └──< PostCategory >── Category ──< Category (self, tree)
Category ──< Category (children)
```

### Media
```
User ──< Media (uploader)
Media ──── Page (featuredImage)
Media ──── Post (featuredImage)
Media ──── Category (image)
Media ──── User (avatar)
Media ──── SiteSetting (logo/favicon)
```

### Navigation
```
Menu ──< MenuItem ──< MenuItem (self, nested)
```

### Messaging
```
MessageCampaign ──< MessageRecipient >── Subscriber
MessageTemplate (standalone)
```

### Other
```
PromotionBanner (standalone, isActive flag)
SiteSetting (singleton)
Location (standalone, isActive flag)
```

---

## 8. Dependency Risks

### 8.1 PrismaService as SPOF
Every service directly injects `PrismaService`. A migration failure or DB connection issue will cascade to all modules. No repository pattern abstraction — Prisma queries are written directly in service files.

### 8.2 Global Guards Side Effects
`JwtAuthGuard` and `PermissionsGuard` are registered globally in `main.ts`. This means they run on every request including health checks or any route you might add. Use `@Public()` consistently on new public endpoints or they'll silently 401.

### 8.3 Refresh Token Cookie Path
`RefreshToken` is set with `path: '/'`. This means the browser sends it on all requests to the backend origin. The `JwtRefreshGuard` only activates on the `/auth/refresh` endpoint, so this is safe, but it's worth noting if you add cross-origin scenarios.

### 8.4 No Roles Module Listed
The `src/modules/roles/` directory exists but is empty. Role and permission seeding is handled in `prisma/seed.ts`. There's no HTTP API for managing roles/permissions at runtime — changes require a DB migration or seed update.

### 8.5 Messaging Provider Coupling
`CampaignsService` calls `ZaloProvider` / `FacebookProvider` synchronously in the send loop. For large subscriber lists this will block the event loop. Consider moving to a queue (Bull/BullMQ) for production scale.

### 8.6 Revalidation Secret
`RevalidationService` sends a `x-revalidation-secret` header. This must match `REVALIDATION_SECRET` in both `.env` (be) and `.env.local` (fe). If misconfigured, ISR will silently fail.

---

*Report generated by graphify — token budget: ~15,000 tokens read*
