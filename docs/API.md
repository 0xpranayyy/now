# NOW — API Contract

## 1. General rules

- JSON request/response bodies.
- UTC timestamps.
- Cursor pagination for feeds.
- Explicit schemas for all inputs.
- Server-side authorization on every mutation.
- Idempotency for actions that may be retried.

All user-generated strings are validated and length-limited.

## 2. Authentication

Authentication is handled by Supabase Auth.

The application layer consumes the authenticated user identity.

Do not trust a user ID sent from the client when it should come from the session.

## 3. Feed

### GET `/api/feed`

Query:

```text
lat
lng
radius
category?
cursor?
limit?
```

Response:

```json
{
  "items": [
    {
      "id": "moment-id",
      "title": "park street tonight",
      "category": "nightlife",
      "distance_meters": 800,
      "participant_count": 1284,
      "post_count": 218,
      "status": "live",
      "started_at": "2026-08-15T15:30:00Z",
      "expires_at": "2026-08-15T18:00:00Z"
    }
  ],
  "next_cursor": "..."
}
```

## 4. Moment

### GET `/api/moments/:id`

Returns:

- moment
- place
- event
- participant count
- activity summary
- current user's membership state

### POST `/api/moments`

Request:

```json
{
  "title": "street food meetup",
  "description": "let's explore Park Street",
  "latitude": 22.5521,
  "longitude": 88.3524,
  "category": "food",
  "visibility": "public",
  "expires_at": "2026-08-15T18:00:00Z"
}
```

Server validates location, rate limits creation, and owns lifecycle fields.

### POST `/api/moments/:id/join`

Idempotent.

### POST `/api/moments/:id/leave`

Idempotent.

## 5. Posts

### GET `/api/moments/:id/posts`

Cursor pagination.

### POST `/api/moments/:id/posts`

```json
{
  "body": "this place is packed tonight",
  "media_asset_id": null
}
```

## 6. Reactions

### PUT `/api/posts/:id/reactions/:kind`

Adds a reaction.

### DELETE `/api/posts/:id/reactions/:kind`

Removes a reaction.

## 7. Search

### GET `/api/search?q=`

Searches across:

- moments
- places
- events
- users

Search should be relevance-aware and location-aware when coordinates are available.

## 8. Nearby

### GET `/api/nearby`

Returns:

- nearby active moments
- nearby places with active moments
- upcoming events

## 9. Reporting

### POST `/api/reports`

```json
{
  "target_type": "post",
  "target_id": "uuid",
  "reason": "harassment",
  "details": "..."
}
```

## 10. Error contract

Use consistent structure:

```json
{
  "error": {
    "code": "MOMENT_NOT_FOUND",
    "message": "The moment is no longer available.",
    "request_id": "req_..."
  }
}
```

Never expose internal stack traces to clients.

## 11. Pagination

All potentially large collections use cursor pagination.

Do not use deep offset pagination for feeds.

## 12. Idempotency

For retriable mutations:

```text
POST /api/moments/:id/join
POST /api/moments/:id/posts
```

Support an idempotency key where duplicate operations would be costly or user-visible.

## 13. Versioning

Do not prematurely create `/v1` for every internal endpoint.

When a public contract must evolve incompatibly, version the contract explicitly.
