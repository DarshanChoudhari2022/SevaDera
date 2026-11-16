# Secure Seller Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (native implementation) task-by-task.

**Goal:** Replace browser-only listing drafts with a secure seller/admin workflow for reviewed property listings, real photos, and WhatsApp-ready share pages.

**Architecture:** Keep the current vanilla frontend in `dist/app.js`, use `src/cloud.js` as the Supabase integration boundary, and add one migration for seller/listing/photo moderation fields. Public listing pages read only approved public fields; seller/admin actions require Supabase Auth and RLS. Build continues to generate `dist/config.js` and `dist/cloud.js`.

**Tech Stack:** Vanilla JavaScript, Supabase Auth/Postgres/Storage/RLS, esbuild, Vercel.

**Spec:** `docs/superpowers/specs/2026-11-16-secure-seller-dashboard-design.md`

## Global Constraints

- No public exposure of seller phone numbers, email addresses, or exact addresses.
- Use Supabase Auth, Storage, RLS, and signed URLs rather than browser-exposed secrets.
- Preserve the SevaDera visual language and responsive behavior.
- Keep listing images private until the listing is approved.

## Review Focus

- Unauthenticated users must not create, edit, approve, or view private listing fields.
- Rejected and pending listings must not appear in public browse or share routes.
- Image upload failures and unsupported files must leave a usable draft state.
- WhatsApp share text must omit private seller/address data and use the stable public URL.
- Hero headline must remain readable on desktop, mobile, and light/dark image crops.

### Task 1: Supabase seller, listing, moderation, and photo schema

**Files:**
- Create: `supabase/migrations/20261116_seller_dashboard.sql`
- Modify: `supabase/tests/access.sql`
- Test: `scripts/database.py` migration runner and access SQL checks

**Interfaces:**
- Produces tables/columns consumed by `src/cloud.js`: `profiles.role`, `profiles.seller_category`, `properties.status`, `properties.public_slug`, `properties.private_address`, `properties.private_contact`, and `property_photos.storage_path`.
- Produces RLS policies for seller-owned drafts, admin moderation, approved public reads, and private storage access.

- [ ] Write SQL checks proving anonymous reads return only approved public listing fields.
- [ ] Add failing access checks for seller ownership, admin approval, and pending-listing invisibility.
- [ ] Implement the migration, constraints, indexes, and RLS policies.
- [ ] Apply the migration and run `python scripts/database.py test-access` (or the repo’s equivalent access test command).
- [ ] Commit with `feat: add seller dashboard data model`.

### Task 2: Auth and seller/admin Supabase client boundary

**Files:**
- Modify: `src/cloud.js`
- Modify: `dist/config.js` only through `scripts/build-config.mjs`
- Test: `scripts/integration_test.py`

**Interfaces:**
- Produces `window.SevaCloud.auth`, `window.SevaCloud.listings`, and `window.SevaCloud.photos` methods: `signIn`, `signUp`, `signOut`, `session`, `createDraft`, `updateDraft`, `uploadPhoto`, `submitForReview`, `approve`, `reject`, and `publicListing`.

- [ ] Add integration cases for sign-up/sign-in, seller-owned draft creation, and admin approval.
- [ ] Implement typed-by-convention wrappers that return `{ data, error }` and never return service-role credentials.
- [ ] Use signed storage URLs for private seller/admin previews and public approved-photo URLs for share pages.
- [ ] Run the integration test with disposable accounts and clean up created rows/files.
- [ ] Commit with `feat: add auth and listing cloud boundary`.

### Task 3: Seller dashboard and property form

**Files:**
- Modify: `dist/app.js`
- Modify: `dist/style.css` or `dist/army.css`
- Test: browser smoke checks via the deployed app and `node --check dist/app.js`

**Interfaces:**
- Adds routes `#login`, `#account`, `#owner`, `#owner/new`, and `#owner/:id`.
- Form fields: seller category, title, area, rent, bedrooms, furnishing, amenities, private address, private contact, notes, and image files.

- [ ] Add auth form with username/email and password, plus sign-up and sign-out states.
- [ ] Replace local draft saving with Supabase-backed create/edit/submit actions while preserving an offline error message.
- [ ] Add image preview, upload progress, file type/size validation, and lead-image selection.
- [ ] Show seller listing status (`Draft`, `Pending review`, `Approved`, `Rejected`) and rejection reason.
- [ ] Run `node --check dist/app.js` and verify a seller can submit a listing in the browser.
- [ ] Commit with `feat: add seller listing dashboard`.

### Task 4: Admin review queue

**Files:**
- Modify: `dist/app.js`
- Modify: `dist/style.css` or `dist/army.css`
- Test: admin/unauthenticated browser smoke checks

**Interfaces:**
- Adds protected route `#admin` and renders pending listing cards with signed photo previews.
- Calls `SevaCloud.listings.approve(id)` and `SevaCloud.listings.reject(id, reason)`.

- [ ] Hide the admin route and controls unless the authenticated profile has `role = admin`.
- [ ] Add review cards showing seller category, public facts, photos, and private details only inside the admin view.
- [ ] Add approve/reject actions with required rejection reason.
- [ ] Verify pending listings do not appear in public browse or share routes after rejection.
- [ ] Commit with `feat: add admin listing moderation`.

### Task 5: Public exact-photo share page and WhatsApp action

**Files:**
- Modify: `dist/app.js`
- Modify: `dist/style.css` or `dist/army.css`
- Test: URL/share smoke checks

**Interfaces:**
- Adds public route `#share/:public_slug` backed by `publicListing(slug)`.
- Generates `https://wa.me/?text=<encoded text and stable URL>` and a copy-link fallback.

- [ ] Render the approved listing’s exact lead image and photo gallery, with no sample-label copy.
- [ ] Display area, rent, bedrooms, furnishing, and trust statement; omit exact address and direct seller contact.
- [ ] Add “Share on WhatsApp” and “Copy link” actions with mobile/desktop fallback behavior.
- [ ] Verify the generated URL uses the exact property image shown on the page and contains no private values.
- [ ] Commit with `feat: add approved property sharing`.

### Task 6: Headline contrast, build, deployment, and verification

**Files:**
- Modify: `dist/army.css`
- Modify: `README.md` with admin setup and environment notes
- Test: `npm run build`, `node --check`, Vercel production smoke checks

- [ ] Add a dark image scrim/text-shadow and explicit z-index/contrast rules so the hero headline is visible on all crops.
- [ ] Document how to mark the first admin profile and how sellers use the listing flow.
- [ ] Run the full build and secret scan; verify repeated builds are idempotent.
- [ ] Deploy with `vercel --prod --yes --scope choudharidarshan5453gmailcoms-projects`.
- [ ] Verify the production home headline, seller login, admin guard, approved share page, and WhatsApp link.
- [ ] Commit with `chore: verify seller dashboard production release`.

