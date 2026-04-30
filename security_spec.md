# Security Specification for Byte_daily

## 1. Data Invariants
- A subscription must have a valid email format.
- A subscription must have a `createdAt` timestamp equal to the request time.
- A subscription `status` must be 'active' by default.
- Once created, a subscription email cannot be changed.

## 2. The Dirty Dozen Payloads (to be rejected)
1. `{ "email": "not-an-email" }` - Invalid email format.
2. `{ "email": "test@test.com", "status": "admin" }` - Invalid status enum.
3. `{ "email": "test@test.com", "createdAt": "2000-01-01T00:00:00Z" }` - Client-side timestamp.
4. `{ "email": "test@test.com", "extraField": "malicious" }` - Shadow field attack.
5. `{ "email": "victim@test.com" }` - Attempting to overwrite an existing subscription (if handled by ID).
6. `{ "email": "test@test.com", "status": "active" }` (Update) - Changing the email of a subscription.
7. `{ "email": "test@test.com", "status": "active" }` (Update by non-owner) - Unauthorized update.
8. Querying `subscriptions` without a filter.
9. Attempting to delete a subscription without authentication.
10. Using a 2MB string for the email field.
11. Setting status to `unsubscribed` from the start.
12. Attempting to create a subscription with a path variable that is too long.

## 3. Test Runner (Conceptual)
The `firestore.rules.test.ts` would verify these payloads return `PERMISSION_DENIED`.
