# NOW — Architecture Decision Records

## ADR-001: Web/PWA before native

### Decision
Launch the first production product as a mobile-first PWA.

### Why
The product needs frictionless distribution, shareable moments and QR/event entry.

### Rejected
Native-first.

### Revisit when
Retention proves the product and native capabilities materially improve behavior.

---

## ADR-002: Modular monolith before microservices

### Decision
One Next.js application with clear domain modules.

### Why
A solo founder needs maximum iteration speed and minimum operational load.

### Rejected
Microservice architecture.

### Revisit when
One subsystem requires independent scaling, deployment, or reliability isolation.

---

## ADR-003: PostgreSQL as system of record

### Decision
Use PostgreSQL for persistent product state.

### Why
The domain is relational and location-aware.

### Rejected
Document-first database.

### Revisit when
A measured workload demonstrates a different storage pattern.

---

## ADR-004: Moment as the primary domain object

### Decision
Posts belong to moments.

### Why
The differentiation is contextual, live, and real-world rather than generic publishing.

### Rejected
Post-first social graph.

---

## ADR-005: Explainable ranking before ML

### Decision
Use deterministic ranking rules initially.

### Why
The product has insufficient behavioral data for a high-quality ML ranker and needs debuggability.

### Revisit when
Data volume and product maturity make personalization meaningfully better than rules.

---

## ADR-006: Privacy-first location

### Decision
Precise user location is never a default public social object.

### Why
Safety and trust are existential for a location-based network.

### Rejected
Public exact location pins.
