# EVLENT Education — Security Standards

**Stack:** React 18 + TypeScript + Supabase (PostgreSQL + Auth + RLS + Storage) + Vite
**Enforcement:** Every feature must pass ALL checks before merge. No exceptions.

---

## Attack Vector Coverage

Every feature built through `/workflow` is hardened against these attack vectors. The table maps each attack to its prevention mechanism AND the pipeline stage that enforces it.

| # | Attack Vector | Prevention Mechanism | Enforced At | Blocker Level |
|---|--------------|---------------------|-------------|---------------|
| 1 | **SQL Injection** | Supabase client parameterized methods only (`.eq()`, `.in()`, `.gte()`). NO raw SQL in client code. Supabase Edge Functions use parameterized queries. | BUILD + AUDIT (grep) | BLOCKER |
| 2 | **XSS (Stored)** | React auto-escapes JSX by default. `dangerouslySetInnerHTML` is BANNED unless wrapped in DOMPurify sanitization. | BUILD + REVIEW + AUDIT (grep) | BLOCKER |
| 3 | **XSS (DOM)** | No `.innerHTML`, `document.write()`, or `eval()` with user data. All dynamic content rendered through React JSX. | REVIEW + AUDIT (grep) | BLOCKER |
| 4 | **Input Validation** | Zod schemas on ALL form submissions. Validate: types, max lengths, enums, required fields. Server-side: Supabase column constraints + CHECK constraints. | PLAN + BUILD + TEST | HIGH |
| 5 | **CSRF** | Supabase uses JWT Bearer tokens (not cookies) — CSRF is mitigated by design. Verify no cookie-based auth is accidentally introduced. | AUDIT | HIGH |
| 6 | **Broken Access Control** | RLS policies on EVERY table. Server-side role enforcement via `has_role()` DB function. UI role checks via `useUserRole()` are defense-in-depth only, never the sole guard. | BUILD + REVIEW + TEST | BLOCKER |
| 7 | **IDOR (Insecure Direct Object Reference)** | RLS policies enforce ownership. Every query is scoped by `auth.uid()`. Students can only access enrolled courses. Teachers can only access own courses. Parents can only access linked students. | BUILD + REVIEW + TEST | BLOCKER |
| 8 | **Data Exposure** | Supabase `select()` specifies exact columns — never `select("*")` for API responses with sensitive data. RLS prevents cross-user data access. | REVIEW | HIGH |
| 9 | **Rate Limiting** | Supabase built-in rate limiting. Client-side: `useMutation` with `isPending` guard prevents double-submit. Debounce on search inputs. | BUILD + REVIEW | HIGH |
| 10 | **File Upload Attacks** | Whitelist file types (images: jpg/png/webp, docs: pdf/doc/docx/txt). Max size limits (submissions: 10MB, thumbnails: 2MB). Validate MIME type, not just extension. Storage bucket RLS enforces path ownership. | BUILD + REVIEW + TEST | BLOCKER |
| 11 | **Insecure Storage** | No secrets in client code. Supabase keys are publishable (anon key only). Service role key NEVER in frontend. API keys for third-party services (Stripe, AI) only in Supabase Edge Functions. | AUDIT (grep) | BLOCKER |
| 12 | **Broken Authentication** | Supabase Auth handles password hashing (bcrypt), JWT lifecycle, token refresh. Email verification on signup. Password reset via secure tokens. Session auto-logout on expiry. | AUDIT | HIGH |
| 13 | **Sensitive Data in URLs** | No tokens, passwords, or PII in URL query parameters. Use POST bodies or headers. | REVIEW | HIGH |
| 14 | **Dependency Vulnerabilities** | `npm audit --audit-level=high` must pass with zero high/critical. Run before every push. | AUDIT | BLOCKER |
| 15 | **Open Redirect** | No user-controlled redirect URLs. All navigation uses React Router `<Link>` or `navigate()` with hardcoded paths. External URLs (meeting links) open in `target="_blank" rel="noopener noreferrer"`. | REVIEW + AUDIT | HIGH |
| 16 | **Realtime Channel Security** | Supabase Realtime subscriptions filtered by `user_id`. No broadcast of sensitive data to unscoped channels. | REVIEW | HIGH |

---

## Automated Audit Grep Patterns

These grep patterns run in the AUDIT stage. ANY match is flagged for manual review. Patterns marked BLOCKER must be resolved before merge.

```bash
# BLOCKER: Raw SQL in client code
grep -rn "\.rpc\|\.sql\|raw(" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules | grep -v "\.test\."

# BLOCKER: dangerouslySetInnerHTML without DOMPurify
grep -rn "dangerouslySetInnerHTML" src/ --include="*.tsx" | grep -v "DOMPurify\|sanitize"

# BLOCKER: innerHTML or document.write
grep -rn "\.innerHTML\|document\.write\|eval(" src/ --include="*.ts" --include="*.tsx"

# BLOCKER: Hardcoded secrets (API keys, passwords, tokens)
grep -rn "sk_live\|sk_test\|password.*=.*['\"]" src/ --include="*.ts" --include="*.tsx" | grep -v "\.test\.\|\.env\|type\|interface\|placeholder"

# BLOCKER: Service role key in client code
grep -rn "service_role\|supabase_service" src/ --include="*.ts" --include="*.tsx"

# HIGH: console.log in production code
grep -rn "console\.\(log\|debug\|info\)" src/ --include="*.ts" --include="*.tsx" | grep -v "\.test\.\|node_modules"

# HIGH: Missing noopener on external links
grep -rn "target=\"_blank\"" src/ --include="*.tsx" | grep -v "noopener"

# HIGH: Any type usage
grep -rn ": any\|as any" src/ --include="*.ts" --include="*.tsx" | grep -v "\.test\.\|node_modules\|// existing pattern"

# HIGH: Unvalidated file upload (no type/size check)
grep -rn "\.upload\|\.createSignedUrl\|supabase.*storage" src/ --include="*.ts" --include="*.tsx" | grep -v "\.test\."
```

---

## Per-Stage Security Requirements

### PLAN Stage
- [ ] Every form input has a Zod schema defined in the plan
- [ ] Every new DB table has RLS policies specified
- [ ] Every new Storage bucket has access rules specified
- [ ] File upload features specify allowed types + size limits
- [ ] New API routes specify required authentication + authorization

### BUILD Stage
- [ ] All Supabase queries use parameterized methods (`.eq()`, `.in()`, `.gte()`, `.lte()`)
- [ ] No `dangerouslySetInnerHTML` without DOMPurify wrapping
- [ ] All forms validated with Zod before Supabase mutation
- [ ] All mutations use `isPending` guard to prevent double-submit
- [ ] File uploads validate type + size before sending to Storage
- [ ] External links use `target="_blank" rel="noopener noreferrer"`
- [ ] No hardcoded secrets, API keys, or passwords in source code
- [ ] No `console.log` in production code (remove after debugging)
- [ ] RLS policies created for every new table in migrations
- [ ] Storage bucket policies enforce path ownership

### TEST Stage
- [ ] Test: unauthenticated access returns redirect to `/login` (ProtectedRoute)
- [ ] Test: wrong role accessing restricted page shows appropriate behavior
- [ ] Test: empty/invalid form data is rejected by Zod validation
- [ ] Test: file upload with invalid type is rejected
- [ ] Test: loading states prevent double-submit (button disabled while `isPending`)

### REVIEW Stage — 14-Point Checklist

Every review MUST check all 14 points. 4 are BLOCKERs (cannot merge), 5 are HIGHs (fix before next sprint), 5 are STANDARD.

| # | Check | Level | Pass Criteria |
|---|-------|-------|--------------|
| 1 | No raw SQL or string interpolation in queries | BLOCKER | Zero grep matches for raw SQL patterns |
| 2 | No unsanitized `dangerouslySetInnerHTML` | BLOCKER | Zero instances without DOMPurify |
| 3 | RLS policies on all new tables | BLOCKER | Every new table has SELECT/INSERT/UPDATE/DELETE policies |
| 4 | No hardcoded secrets in source | BLOCKER | Zero grep matches for secret patterns |
| 5 | Zod validation on all form inputs | HIGH | Every form has a schema; every mutation validates before calling Supabase |
| 6 | File upload type + size validation | HIGH | Whitelist check + size check before upload |
| 7 | External links have `rel="noopener noreferrer"` | HIGH | Zero grep matches for bare `target="_blank"` |
| 8 | No `any` types introduced | HIGH | Zero new `any` usages (existing patterns excepted) |
| 9 | Mutation double-submit prevention | HIGH | `isPending` or `disabled` on submit buttons during mutation |
| 10 | Loading and error states handled | STANDARD | Spinner on load, toast on error, empty state on no data |
| 11 | Query keys include all dependencies | STANDARD | No stale cache from missing key variables |
| 12 | No `console.log` in production code | STANDARD | Zero grep matches outside test files |
| 13 | TypeScript strict compliance | STANDARD | `npx tsc --noEmit` passes with zero errors |
| 14 | Tests cover happy + unhappy paths | STANDARD | Auth, validation, empty state, error state all tested |

### AUDIT Stage
- [ ] Run all automated grep patterns (see above) — zero BLOCKERs
- [ ] Run `npm audit --audit-level=high` — zero high/critical
- [ ] Verify RLS policies in Supabase migration files
- [ ] Verify Storage bucket policies
- [ ] Cross-reference OWASP Top 10 against new code
- [ ] Verify no sensitive data in Supabase Realtime channel subscriptions

---

## Stack-Specific Security Notes

### Supabase RLS (Row Level Security)
- RLS is the PRIMARY access control mechanism — it runs at the database level
- UI role checks (`useUserRole()`) are secondary — they improve UX but don't provide security
- Every table MUST have RLS enabled. A table without RLS is accessible to any authenticated user
- Use `has_role(auth.uid(), 'admin')` in policies, not client-side role checks
- Test RLS policies by querying from different user contexts in Supabase SQL Editor

### React XSS Protection
- React auto-escapes all JSX expressions `{variable}` — this is safe by default
- `dangerouslySetInnerHTML` bypasses this protection — only use with DOMPurify:
  ```tsx
  import DOMPurify from "dompurify";
  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlContent) }} />
  ```
- Never use `document.createElement` + `.innerHTML` to render user content

### Supabase Auth
- Supabase handles password hashing (bcrypt), JWT tokens, and session management
- The publishable (anon) key is safe to include in client code — it only works with RLS
- The service_role key MUST NEVER appear in client code — it bypasses all RLS
- For server-side operations (webhooks, cron jobs), use Supabase Edge Functions with the service_role key stored as an environment variable

### File Upload Security
```typescript
// Always validate before upload
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_DOC_TYPES = ["application/pdf", "text/plain", "application/msword"];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;  // 2MB
const MAX_DOC_SIZE = 10 * 1024 * 1024;   // 10MB

function validateFile(file: File, allowedTypes: string[], maxSize: number): string | null {
  if (!allowedTypes.includes(file.type)) return "Invalid file type";
  if (file.size > maxSize) return "File too large";
  return null; // valid
}
```

---

*This document is referenced by all PHASE*_PLAN.md files and enforced by the `/workflow` command pipeline.*
