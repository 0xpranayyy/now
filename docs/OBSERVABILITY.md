# NOW — Observability

## 1. Three layers

### Product analytics
What are users doing?

### Application monitoring
Is the software working?

### Infrastructure monitoring
Is the platform healthy?

Use:

- PostHog
- Sentry
- platform/database metrics

## 2. Product events

Initial event vocabulary:

```text
app_opened
location_permission_requested
location_permission_granted
location_permission_denied

feed_loaded
moment_viewed
moment_joined
moment_left

post_composed
post_created
post_deleted

reaction_added
search_performed

moment_created
moment_shared
report_created

notification_received
notification_opened
```

Event naming should remain stable.

## 3. Event properties

Useful properties:

```text
moment_id
moment_category
distance_bucket
city
source_surface
position_in_feed
experiment_id
```

Avoid sending sensitive raw location when a bucket or coarse value is enough.

## 4. Request tracing

Every API response should have a request ID.

Log it server-side.

Example:

```text
request_id=req_123
route=/api/moments/abc
duration_ms=84
user_id=...
status=200
```

## 5. Error monitoring

Sentry should capture:

- unhandled exceptions
- rejected mutations
- realtime failures
- media errors
- map failures

Tag:

```text
environment
release
route
feature
```

## 6. Performance metrics

Monitor:

- server response time
- feed query latency
- map load time
- image delivery time
- realtime connection success
- client crash/error rate

## 7. Alerts

Do not alert on everything.

Alert on:

- severe error-rate spikes
- database saturation
- auth failures
- realtime outage
- storage failures
- elevated latency

## 8. Weekly product review

Every week review:

```text
activation
moment conversion
participation
retention
active moments
moment density
errors
performance
```

Engineering work should be influenced by these numbers.
