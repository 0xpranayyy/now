# NOW — Product Specification

## 1. Core idea

NOW is a **real-time social layer for live moments**.

A moment can be:

- a place becoming busy
- a concert
- a sports match
- a campus event
- nightlife
- a restaurant opening
- a festival
- a spontaneous meetup
- a major online event with a real-time audience

The system should eventually create moments automatically from signals. Users should not always have to create the room themselves.

## 2. Core product language

### Moment
The atomic product object.

A live, contextual social space around something happening.

### Presence
A user's participation in a moment.

A person can be:

- viewing
- nearby
- attending
- watching
- participating

We expose only the minimum public presence required for the experience.

### Post
A piece of user-generated content attached to a moment.

### Place
A physical location that can accumulate moments.

### Event
A scheduled occurrence that can generate a moment.

## 3. Main surfaces

### Home / Now
Primary feed.

Shows live moments ranked by relevance, freshness, proximity and activity.

### Map
Spatial discovery of active moments.

### Moment
The core destination.

Contains:

- title
- location/context
- activity
- participant count
- posts
- reactions
- live chat
- presence
- relevant event/place information

### Profile
Lightweight identity.

MVP profile:

- username
- name
- avatar
- bio
- city
- basic moment history

### Create
User-created moment or event.

Creation should be fast enough that it feels like posting.

## 4. The 30-second experience

When the user opens NOW:

1. Location is requested or coarse location is inferred.
2. The app immediately renders useful cached content.
3. The feed shows currently active moments.
4. Every card explains why it is interesting:
   - nearby
   - trending
   - friends are there
   - starting soon
   - active right now
5. The user taps a moment.
6. The moment opens with immediate social context.

Do not make onboarding block discovery.

## 5. MVP launch strategy

Launch into one dense geographic community.

Good launch characteristics:

- high population density
- many events and venues
- young social population
- strong nightlife/food/sports culture
- easy founder access for seeding and feedback

The initial market is a product experiment, not a permanent geographic limitation.

## 6. Cold-start strategy

The most dangerous failure mode is:

> “There is nothing here.”

Therefore MVP can mix:

- founder-curated events
- manually seeded places
- public events
- user-created moments
- automated activity later

A user should not need 10,000 existing users to perceive value.

## 7. Ranking principles

Initial deterministic score:

```text
score =
  proximity
+ current_activity
+ activity_velocity
+ freshness
+ social_relevance
+ category_relevance
+ quality
```

Do not build a black-box ML ranker initially.

Prefer explainable rules.

## 8. Product metrics

### North-star candidate

**Meaningful moments per active user**

A meaningful moment:

- user opens a moment
- remains long enough to consume context
- performs a social action or returns to it

### Activation

`new users who enter at least one meaningful moment / new users`

### Moment conversion

`moment entries / moment views`

### Participation rate

`users who post/react/join / moment visitors`

### Density

`active users / active geographic area`

### Retention

D1, D7, D30.

### Supply health

- active moments per active area
- median moment lifetime
- moments with zero engagement
- new moments per day

## 9. Product quality bar

A moment card should answer at a glance:

**What? Where? Why now? Who is there?**

A user should never have to decode the UI.

## 10. Privacy promise

Public location should be contextual, not individually traceable.

Never expose:

- exact home location
- precise user coordinates
- continuous public movement trails

Prefer:

- approximate presence
- place-level context
- radius-based aggregation
- explicit controls

## 11. Future product thesis

The long-term pipeline is:

```text
real world
    ↓
places + events + activity
    ↓
moments
    ↓
people
    ↓
conversation + content
    ↓
social graph
    ↓
personalized NOW
```

The goal is not to build another content feed.

The goal is to make **the world itself socially legible**.
