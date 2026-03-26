# Secret Rotation Runbook

## Goals

- Stop committing live credentials.
- Rotate all active secrets without changing app structure.
- Verify production after each rotation step.

## Recommended order

1. Generate new secrets with `npm run secrets:generate`.
2. Update secrets in the deployment platform first.
3. Deploy and verify auth, password reset, AI chat, and payments.
4. Replace local `.env` values.
5. Revoke old credentials from providers.

## Must-rotate secrets

- `DATABASE_URL`
- `DIRECT_URL`
- `AUTH_SECRET`
- `NEXTAUTH_SECRET`
- `GEMINI_API_KEY`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` if exposure scope changed

## Verification checklist

- `npm run env:check`
- `npm run lint`
- `npm run build`
- Login with student and institute accounts
- Password reset request succeeds
- Student payment order and verification succeed
- AI tutor returns a valid response

## Notes

- `.env` is now ignored going forward, but an already tracked `.env` still needs manual removal from git history or index.
- Rotate provider-side secrets before assuming the repo is safe.
