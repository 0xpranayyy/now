# NOW — Engineering Operating System

## 1. Solo-founder engineering model

The founder is simultaneously:

- product owner
- designer
- engineer
- tester
- growth operator

The answer is not to imitate a 40-person company.

The answer is to adopt **professional engineering discipline with minimal ceremony**.

## 2. Weekly operating cycle

### Monday — decide

Choose the smallest set of problems that could materially improve the product.

### Tuesday–Thursday — build

Focused execution.

### Friday — ship and measure

Release, observe, collect feedback, review metrics.

### Weekend / field sessions

Use the product in real life.

Observe people using it.

## 3. Issue format

Every ticket should include:

```text
Problem
Why now
Desired behavior
Acceptance criteria
Instrumentation
Risks
```

Avoid tickets that are just:

> “build notifications”

## 4. Branching

Prefer short-lived branches:

```text
feat/moment-feed
feat/realtime-presence
fix/location-permission
```

Merge frequently.

Avoid long-running branches.

## 5. Pull request standard

Even as a solo founder, use pull requests for meaningful changes when practical.

PR checklist:

- [ ] behavior is correct
- [ ] authorization considered
- [ ] errors handled
- [ ] analytics added
- [ ] tests added/updated
- [ ] mobile verified
- [ ] no accidental secrets
- [ ] rollback is understood

## 6. Environment strategy

At minimum:

```text
local
staging
production
```

Production data must never be used casually for development.

## 7. Definition of done

A feature is done when:

- happy path works
- failure path works
- loading state works
- empty state works
- mobile layout works
- permissions are correct
- analytics exist
- error monitoring exists
- tests exist where risk warrants
- documentation exists when necessary

## 8. Design engineering

Build a small design system early.

Tokens:

- typography
- spacing
- radii
- shadows
- surfaces
- borders
- interaction states

Components:

```text
Button
Input
Avatar
MomentCard
MomentHeader
PresencePill
MapMarker
BottomNav
Sheet
Toast
Dialog
Skeleton
```

Do not duplicate UI primitives.

## 9. Performance budget

Targets for the main experience:

- fast first render on mobile
- instant-feeling navigation between cached screens
- no layout jumps
- image optimization by default
- minimal JavaScript on public pages
- realtime only when visible/needed

Track real user performance instead of guessing.

## 10. Error handling

Every user-facing async state needs:

- loading
- success
- empty
- error
- retry where useful

Errors should be:

- understandable
- non-catastrophic
- actionable

## 11. Accessibility

Minimum:

- semantic HTML
- keyboard navigation
- visible focus state
- accessible labels
- sufficient contrast
- reduced-motion support
- screen-reader-friendly controls

## 12. Technical debt policy

Debt is acceptable when:

- it accelerates a learning experiment
- the cost is known
- the code is isolated

Debt is dangerous when it touches:

- auth
- billing
- location privacy
- data integrity
- moderation
- core domain boundaries

## 13. Architecture review trigger

Reconsider architecture when:

- deploys become slow
- one subsystem requires independent scaling
- database load is concentrated
- realtime reliability becomes a bottleneck
- team size creates ownership conflicts

Until then:

> keep the system simple.
