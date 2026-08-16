# NOW — Realtime & Presence

## 1. What needs realtime

Realtime is justified for:

- active moment presence
- chat
- reactions
- participant count changes
- moment activity
- hot/trending state

Do not make the entire application realtime.

## 2. Moment channel

Channel naming:

```text
moment:{moment_id}
```

Events:

```text
presence.joined
presence.left
message.created
reaction.created
moment.activity
participant_count.updated
```

## 3. Presence model

A user can have multiple tabs/devices.

The system should aggregate them into one logical presence.

```text
User
 ├── browser tab
 ├── phone
 └── desktop
        ↓
logical active presence
```

## 4. Heartbeat strategy

Do not write every heartbeat to PostgreSQL.

Recommended model:

```text
client heartbeat
      ↓
realtime presence
      ↓
ephemeral state
      ↓
periodic aggregation
      ↓
moment participant_count
```

Use a reasonable inactivity timeout.

The exact interval should be measured and adjusted rather than hard-coded around assumptions.

## 5. Chat consistency

Messages are persistent records.

Realtime only distributes the event quickly.

Canonical flow:

```text
client
 ↓
POST message
 ↓
database commit
 ↓
broadcast
 ↓
clients update
```

Do not rely on a broadcast event as the only durable copy.

## 6. Optimistic UI

Use optimistic updates for:

- reactions
- join
- leave
- lightweight UI state

Never hide server rejection.

On failure:

```text
optimistic state
      ↓
server rejects
      ↓
revert
      ↓
show actionable error
```

## 7. Scaling

Supabase Realtime is appropriate for early stages.

If realtime becomes the dominant scaling constraint, extract presence independently rather than redesigning the entire platform.

## 8. Abuse control

Realtime channels need:

- authenticated access
- membership authorization
- per-user rate limits
- message length limits
- moderation hooks
- connection limits

A user should not be able to subscribe to every private or restricted moment.
