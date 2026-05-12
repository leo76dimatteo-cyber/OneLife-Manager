# Security Specification: OneLife Manager

## 1. Data Invariants
- A match or event cannot exist without being tied to a specific `{userId}`.
- Users can only read and write their own data.
- The `type` in `Contact` must be either 'sport' or 'personal'.
- Document IDs must follow strict character validation.

## 2. The "Dirty Dozen" Payloads (Denial Expected)
1. **Identity Spoofing**: Attempt to create a match in another user's subcollection.
2. **Schema Invalidation**: Missing required `title` field on a match.
3. **Ghost Field Injection**: Adding an `isAdmin: true` field to a user profile.
4. **ID Poisoning**: Using a 2KB string as a contact ID.
5. **PII Leak**: Authenticated user trying to read another user's profile.
6. **Type Poisoning**: Sending `reminders` as a string instead of an array.
7. **Size Attack**: Sending a 500KB string as `notes`.
8. **Orphaned Write**: Creating a match with a future date but no title.
9. **Identity Integrity**: Setting `ownerId` (if it existed) to someone else's UID.
10. **Global Read Attempt**: Trying to list all `/users`.
11. **Update Gap**: Modifying `createdAt` after it was created.
12. **Query trust**: Trying to list matches without a `where` clause (or trying to list all matches across users).

## 3. Fortress Rules Architecture
- **Global Safety Net**: Deny all by default.
- **isValidId()**: Strict validation for all path variables.
- **Relational Sync**: Sub-resource access tied to authenticated UID.
- **Strict Keys**: `affectedKeys().hasOnly()` for all updates.
- **Size Enforcements**: `.size() <= MAX` for all strings and arrays.
