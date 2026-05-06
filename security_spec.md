# Security Specification for Lenden

## Data Invariants
- A transaction (income/expense) must belong to the authenticated user (`userId`).
- A customer must belong to the authenticated user (`userId`).
- A ledger entry must belong to the authenticated user (`userId`) and reference a valid customer owned by that user.
- Amounts must be positive numbers.
- Timestamps must correspond to server time.

## The Dirty Dozen Payloads (Denial Expected)
1. **Identity Spoofing**: Creating a transaction with someone else's `userId`.
2. **Orphaned Ledger**: Creating a ledger entry for a `customerId` that doesn't exist or isn't owned by the user.
3. **Ghost Update**: Adding a field like `isAdmin: true` to a user profile.
4. **Time Travel**: Setting `createdAt` to a future or past date instead of `request.time`.
5. **Negative Money**: Setting `amount` to `-100`.
6. **Cross-User Read**: Trying to `get` or `list` transactions of another user.
7. **Cross-User Delete**: Trying to `delete` a customer record owned by another user.
8. **ID Poisoning**: Using a 2KB string as a transaction ID.
9. **Bulk Scrape**: Querying `transactions` without a `userId` filter (should be caught by rule-side enforcement).
10. **Type Mismatch**: Sending a string for the `amount` field.
11. **Shadow State**: Updating a fixed field like `type` after creation.
12. **Unverified Auth**: Accessing data with a non-verified email (if `email_verified` enforcement is active).

## Red Team Status
- All rules must enforce `request.auth.uid == data.userId`.
- `isValidTransaction`, `isValidCustomer`, `isValidLedgerEntry` helpers will be implemented.
- `allow list` will be restricted to `resource.data.userId == request.auth.uid`.
