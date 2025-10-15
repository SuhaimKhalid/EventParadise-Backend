# TODO: Implement Error Handling for All Tables and Endpoints

- [ ] Add global error handler middleware to `src/api.ts` to handle errors consistently and send JSON responses to frontend
- [ ] Update `src/models/events-model.ts` to throw errors for not found cases (e.g., selectSingleEvent, updateEvent, etc.)
- [ ] Update `src/models/users-model.ts` to ensure consistent error throwing
- [ ] Update `src/models/payments-model.ts` to ensure consistent error throwing
- [ ] Update `src/models/emails-model.ts` to ensure consistent error throwing
- [ ] Add error handling tests in `__test/events.test.ts` for invalid IDs, not found, etc.
- [ ] Add error handling tests in `__test/users.test.ts` for invalid IDs, not found, etc.
- [ ] Add error handling tests in `__test/payments.test.ts` for invalid IDs, not found, etc.
- [ ] Add error handling tests in `__test/emails.test.ts` for invalid IDs, not found, etc.
- [ ] Run tests to verify error handling works correctly

# TODO for Payment Status Update

- [x] Add updatePaymentStatus function in src/models/payments-model.ts
- [x] Add patchPayment function in src/controllers/payments-Controller.ts
- [x] Add PATCH route in src/api.ts for /api/payments/:id
- [x] Adjust tests in \_\_test/payments.test.ts to include PATCH endpoint test
