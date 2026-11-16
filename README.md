# SevaDera

Housing and move-in portal for service families, starting in Wanwadi. The working name remains subject to domain and trademark clearance.

## Run and build

Use `npm ci` and `npm run build` to bundle the Supabase client. Serve `dist` with `python -m http.server 4173 --directory dist`.

The Sites project is recorded in `.openai/hosting.json`. Its current URL retains the original AanganSetu slug.

## Connected data

The Supabase project contains profiles, properties, private property contact details, photo metadata, expiring photo links, saved properties, enquiries, service requests and move tasks. Private tables store staff membership, admin invitations and moderation events. All application tables have RLS enabled. SQL migrations are in `supabase/migrations`.

The website uses the project URL and publishable key in `src/cloud.js`. Database passwords and Supabase secret keys are supplied through hidden stdin for administration and tests. They are excluded from the website and source files. If the publishable key is rotated, replace it in `src/cloud.js` and `scripts/integration_test.py`, rebuild and republish. Rotating the secret key or database password does not require a website rebuild.

Members authenticate with Supabase email/password. New accounts confirm their email. The configured site owner receives staff membership after email verification. Staff can review listings and service requests at `#admin`. Admin invitation addresses remain in the private database schema.

Owners create a draft with an atomic property/contact transaction, upload photographs and submit for review. Staff publish eligible listings. Editing a published home or adding/deleting photos returns it to a draft or pending review. Tenants can request a viewing. Owner approval grants that tenant access to the address and contact phone. Account email and professional identity are excluded from listings.

Uploads re-encode images in the browser to remove EXIF metadata. The private storage bucket allows JPEG, PNG and WebP up to 8 MB. Owners create photo-only share links with a seven-day expiry and can revoke all links for a property. Signed images expire after 60 seconds, and recipients can retain downloaded photographs. Published-property photos shared through an active link are accessible by recipients. The Sites access policy additionally restricts who can reach the website.

## Verification

`scripts/database.py` accepts a hidden JSON operation with a database password and SQL file path. The access test in `supabase/tests/access.sql` runs synthetic fixtures inside a rolled-back transaction. It covers ownership, private address access, self-publication denial, enquiry approval, per-account isolation and photo-link expiry/revocation.

`scripts/integration_test.py` accepts the secret API key through hidden stdin. It creates disposable confirmed accounts, exercises Auth, REST and Storage, then removes the fixtures. The database access suite and real API integration test passed on 16 November 2026.

## Launch configuration

Supabase Auth's Site URL and allowed redirect URLs should match the published site before public onboarding. These project settings require Supabase dashboard or Management API access. Email/password sign-in was tested with disposable confirmed accounts. Production email delivery and confirmation redirects have not been verified. Real SMTP delivery may require configuration in Supabase.

Real listings are submitted by owners. Illustrative sample homes appear until published inventory is available. Samples cannot receive bookings or be saved. Service requests reach the database and staff dashboard. Provider assignment, notifications and payments are outside this release. The platform fee is zero during launch.
