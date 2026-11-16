# SevaDera Secure Seller Dashboard

## Intent

Turn the current browser-only “List your home” draft into a trusted listing workflow for Army personnel, Army doctors, CRPF/CAPF members, government and CBI employees, veterans, and their families. Sellers should be able to sign in with username/password, submit a property with exact photos, and receive a shareable WhatsApp link after admin approval.

## Goals

- Make the hero headline consistently readable against the property image.
- Provide seller sign-up/sign-in with Supabase email/password authentication.
- Capture seller category, property details, private address/contact, and multiple property images.
- Give admins a protected review queue to approve or reject listings.
- Publish approved listings with public photos while keeping exact address and direct contact private until an enquiry is approved.
- Generate a property share page and WhatsApp share URL using the listing’s real lead image.

## Non-goals

- No public exposure of seller phone numbers, email addresses, or exact addresses.
- No payment, rent collection, or legal agreement signing in this slice.
- No automated identity verification; admin review is the first trust gate.

## Constraints

- Build on the existing vanilla frontend and Supabase schema/client.
- Use Supabase Auth, Storage, RLS, and signed URLs rather than putting secrets in browser code.
- Preserve the current SevaDera visual language and responsive behavior.
- Keep listing images private until a listing is approved, then serve approved photos through controlled paths.

## Approaches considered

1. Secure seller dashboard (chosen): authenticated sellers submit listings and photos; admins moderate; approved listings get share pages. Best balance of trust, scalability, and seller self-service.
2. Admin-first intake: fastest launch, but every listing requires manual entry and sellers cannot maintain their own records.
3. Magic-link access: safer operationally, but does not match the requested username/password experience.

## Chosen design

- Add auth views for sign-up, sign-in, sign-out, and account state.
- Extend listing records with seller category, status, private address/contact, and a public share slug.
- Add seller dashboard sections for “My listings,” listing creation/editing, photo upload, and share actions for approved listings.
- Add admin route protected by an allowlisted admin email or role claim; show pending listings, preview photos, and approve/reject controls.
- Add a public share route that shows the exact lead image, public listing facts, trust copy, and a WhatsApp share action. It must not reveal private seller fields.
- Add a high-contrast headline scrim/overlay and explicit text-shadow so hero copy remains legible on varied image crops.

## Acceptance criteria

- A new seller can create an account, sign in, submit a listing, and upload at least one image.
- The listing is not publicly visible until approved by an admin.
- An admin can approve or reject a pending listing.
- An approved listing has a stable public share URL and WhatsApp share button with the exact lead image shown on the page.
- The public page omits exact address and direct seller contact.
- The hero headline is readable on desktop and mobile.
- Build, database migration, and live deployment complete successfully.
