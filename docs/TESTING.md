# NOW — Testing Strategy

## 1. Testing philosophy

Test behavior and risk, not line count.

The highest-value tests protect:

- authentication
- authorization
- moment lifecycle
- location privacy
- data integrity
- feed ranking rules
- realtime state
- core user journeys

## 2. Test pyramid

```text
             E2E
            /   \
       Integration
         /       \
       Unit ---- domain
```

Most tests should be fast and close to the domain.

## 3. Unit tests

Use for:

- ranking functions
- lifecycle transitions
- validation
- privacy transformations
- formatting
- permission helpers

Example:

```text
given a live moment 400m away
and another live moment 4km away
the nearer moment should rank higher
when other signals are equal
```

## 4. Integration tests

Test:

- API + database
- RLS policies
- authentication
- moment creation
- join/leave
- post creation
- moderation

## 5. E2E tests

The critical flows:

### New user

```text
open
→ location choice
→ home
→ enter moment
```

### Participant

```text
enter moment
→ join
→ post
→ see realtime update
→ leave
```

### Creator

```text
create moment
→ moment becomes live
→ another user joins
→ creator sees activity
→ moment expires
```

## 6. Realtime tests

Verify:

- duplicate connections
- reconnects
- message ordering assumptions
- stale presence
- authorization to channels
- failure when network disappears

## 7. Visual regression

Prioritize:

- home feed
- moment page
- map
- create flow
- mobile breakpoints

A social consumer product can regress visually even when its logic still passes.

## 8. Production smoke tests

After deployment:

- auth works
- feed loads
- map loads
- moment opens
- join works
- post works
- analytics arrive
- errors are reported

## 9. Release strategy

Prefer:

- preview deploy
- staging validation
- production deploy
- short observation window
- rollback if needed

For risky changes, use feature flags.

## 10. Test data

Create deterministic fixtures:

- cities
- places
- active moments
- archived moments
- users
- posts

Do not depend on random production-like state to test basic behavior.
