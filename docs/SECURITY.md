# NOW — Security, Privacy & Trust

## 1. Security posture

Security is a product feature.

For a location-based social product, the highest-risk surfaces are:

1. location exposure
2. identity abuse
3. stalking/harassment
4. spam/bot activity
5. unauthorized content access
6. account takeover

## 2. Location privacy

Never expose exact user coordinates to other users.

Instead:

```text
exact client location
      ↓
authorized server processing
      ↓
coarse public representation
```

Examples of acceptable public information:

- “87 people nearby”
- “1.2 km away”
- “At Park Street”
- “at the event”

Avoid:

- exact personal pins
- movement trails
- home/work inference
- historical location replay

## 3. Location permissions

Make location optional.

If permission is denied:

- allow city selection
- allow search
- allow manual place selection
- do not make the product unusable

Explain why location is useful before requesting it.

## 4. Row Level Security

Every protected table must have explicit RLS policies.

Examples:

- users can edit their own profile
- users can delete their own posts
- only allowed participants can access restricted moments
- reports are not visible to reporters beyond their own submission
- private user data is never public by default

## 5. Authorization

Authentication answers:

> Who are you?

Authorization answers:

> Are you allowed to do this?

Do both on every sensitive operation.

## 6. Rate limiting

Rate-limit:

- account creation
- moment creation
- posts
- comments
- reactions
- reports
- searches
- media uploads
- realtime connections

Use progressively stricter controls for suspicious behavior.

## 7. Anti-abuse

Plan for:

- fake accounts
- bot-created moments
- spam posts
- mass reactions
- harassment
- impersonation
- location spoofing

Start with deterministic rules and manual moderation.

Introduce automated classifiers only when the volume justifies them.

## 8. Content uploads

Media must use controlled upload flows.

```text
authenticated user
      ↓
signed upload
      ↓
storage
      ↓
validation
      ↓
thumbnail/processing
      ↓
public/private delivery
```

Validate file type and size server-side.

## 9. Secrets

Never ship secrets in the browser.

Client-exposed keys must be intentionally public.

All privileged keys belong server-side.

## 10. Auditability

Record important administrative actions:

- account suspension
- content deletion
- report resolution
- moderator changes
- permission changes

## 11. Incident response

Maintain a minimal runbook:

```text
detect
 ↓
contain
 ↓
identify impact
 ↓
preserve evidence
 ↓
fix
 ↓
verify
 ↓
communicate
 ↓
postmortem
```

## 12. Privacy principle

Collect data because the product needs it, not because the company might use it later.
