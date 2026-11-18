"""Exercise the public deployment with disposable records. Requires project-owner credentials."""
import argparse
import getpass
import json
import secrets
import subprocess
import urllib.error
import urllib.request
import uuid
from pathlib import Path

import psycopg


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--keep", action="store_true", help="Keep the run active for inspection until Enter is pressed")
    parser.add_argument("--editor", choices=["live", "local"], help="Post through the staff editor with a simulated stalled browser cache")
    parser.add_argument("--retain-draft", action="store_true", help="Leave one labelled private draft in the verified staff account specified in the hidden credentials")
    args = parser.parse_args()
    if args.retain_draft and not args.editor:
        parser.error("--retain-draft requires --editor")
    credentials = json.loads(getpass.getpass("Project credentials JSON (hidden): "))
    site = "https://aangansetu.vercel.app"
    config = request(site + "/config.js", accept="text")
    options = json.loads(config.split("=", 1)[1].strip().rstrip(";"))
    base = options["supabaseUrl"]
    public = {"apikey": options["supabasePublishableKey"]}
    secret = credentials["apiKey"]
    service = {"apikey": secret}
    if secret.startswith("ey"):
        service["Authorization"] = "Bearer " + secret
    owner_id = None
    retained_id = None
    paths = []
    ids = []
    token = None
    email = f"listing-smoke-{uuid.uuid4().hex[:10]}@example.com"
    password = "Smoke-" + secrets.token_urlsafe(24)
    try:
        owner = request(base + "/auth/v1/admin/users", "POST", service,
                        {"email": email, "password": password, "email_confirm": True})
        owner_id = owner["id"]
        with psycopg.connect(host="db." + base.split("//", 1)[1], dbname="postgres", user="postgres",
                             password=credentials["dbPassword"], sslmode="require", connect_timeout=10) as db:
            db.execute("insert into private.staff_members(user_id) values (%s)", (owner_id,))
        token = request(base + "/auth/v1/token?grant_type=password", "POST", public,
                        {"email": email, "password": password})["access_token"]
        staff = {**public, "Authorization": "Bearer " + token}
        assert request(base + "/rest/v1/rpc/is_staff", "POST", staff, {}) is True
        print("Staff login verified", flush=True)
        photo_path = Path("dist/assets/realtora/127d5d37fa97e8c6.jpg")
        photo = photo_path.read_bytes()
        if args.editor:
            draft_title = "TEST ONLY - Wanwadi form verification " + uuid.uuid4().hex[:8] if args.retain_draft else None
            try:
                result = subprocess.run(["node", "scripts/marketplace-editor-smoke.cjs"],
                                        input=json.dumps({"site": site, "email": email, "password": password,
                                                          "photoPath": str(photo_path), "local": args.editor == "local",
                                                          "draftTitle": draft_title}),
                                        encoding="utf-8", timeout=60)
                if result.returncode:
                    raise RuntimeError("Staff editor smoke test failed")
                if draft_title:
                    with psycopg.connect(host="db." + base.split("//", 1)[1], dbname="postgres", user="postgres",
                                         password=credentials["dbPassword"], sslmode="require", connect_timeout=10) as db:
                        retained = db.execute(
                            """update public.properties p set owner_id=u.id
                               from auth.users u join private.staff_members s on s.user_id=u.id
                               where lower(u.email)=lower(%s) and u.email_confirmed_at is not null
                               and p.owner_id=%s and p.title=%s and p.status='draft'
                               and not exists(select 1 from public.property_photos f where f.property_id=p.id)
                               returning p.id,p.title,p.area,p.status""",
                            (credentials["staffEmail"], owner_id, draft_title)
                        ).fetchone()
                        if retained is None:
                            raise RuntimeError("Unable to retain the private draft for the verified staff account")
                        retained_id = retained[0]
                    print("Private draft retained in properties:", *retained, flush=True)
            finally:
                with psycopg.connect(host="db." + base.split("//", 1)[1], dbname="postgres", user="postgres",
                                     password=credentials["dbPassword"], sslmode="require", connect_timeout=10) as db:
                    ids.extend(row[0] for row in db.execute("select id from public.properties where owner_id=%s", (owner_id,)))
                    paths.extend(row[0] for row in db.execute("select name from storage.objects where bucket_id='property-photos' and split_part(name,'/',1)=%s", (owner_id,)))
            return
        for kind, title in [("home", "Demo – Wanwadi rental smoke test"), ("item", "Demo – cupboard smoke test")]:
            listing = str(uuid.uuid4())
            path = f"{owner_id}/{listing}/smoke.jpg"
            result = request(base + "/rest/v1/rpc/save_listing", "POST", staff, {
                "listing_id": listing,
                "listing_data": {"title": title, "listing_kind": kind, "public_title": title, "area": "Wanwadi",
                                 "rent": 18000 if kind == "home" else 2000, "bedrooms": 2,
                                 "furnishing": "Unfurnished", "size_sqft": 650, "description": ""},
                "private_data": {"exact_address": "Synthetic smoke-test address", "contact_phone": "0000000000"},
            })
            assert result == listing
            ids.append(listing)
            print(kind + ": draft saved in production", flush=True)
            request(base + "/storage/v1/object/property-photos/" + path, "POST",
                    {**staff, "Content-Type": "image/jpeg"}, photo)
            paths.append(path)
            request(base + "/rest/v1/property_photos", "POST", staff,
                    {"property_id": listing, "storage_path": path, "position": 0})
            request(base + "/rest/v1/properties?id=eq." + listing, "PATCH",
                    {**staff, "Prefer": "return=representation"}, {"status": "published"})
            shared = request(base + "/rest/v1/rpc/marketplace_public_details", "POST", public,
                             {"kind": None, "slug": listing})
            assert shared[0]["public_title"] == title and shared[0]["photos"] == [path]
            assert "exact_address" not in shared[0] and "contact_phone" not in shared[0]
            feed = request(base + "/rest/v1/rpc/marketplace_public_details", "POST", public, {"kind": kind})
            assert any(row["id"] == listing for row in feed)
            signed = request(base + "/storage/v1/object/sign/property-photos/" + path, "POST", public, {"expiresIn": 60})
            image = request(base + "/storage/v1" + signed["signedURL"], accept="bytes")
            assert image == photo
            print(kind + ": signed-out feed, share data and exact uploaded photo verified: " + site + "/#share/" + listing,
                  flush=True)
        if args.keep:
            print("Disposable demos active. Press Enter to remove.", flush=True)
            input()
    finally:
        if owner_id:
            try:
                if ids:
                    with psycopg.connect(host="db." + base.split("//", 1)[1], dbname="postgres", user="postgres",
                                         password=credentials["dbPassword"], sslmode="require", connect_timeout=10) as db:
                        db.execute("update public.properties set status='archived' where id=any(%s::uuid[])", (ids,))
                if paths:
                    request(base + "/storage/v1/object/property-photos", "DELETE", service, {"prefixes": paths})
            finally:
                request(base + "/auth/v1/admin/users/" + owner_id, "DELETE", service)
                print("Removed temporary staff account and demo listings.", flush=True)
                if retained_id:
                    with psycopg.connect(host="db." + base.split("//", 1)[1], dbname="postgres", user="postgres",
                                         password=credentials["dbPassword"], sslmode="require", connect_timeout=10) as db:
                        assert db.execute("select status from public.properties where id=%s", (retained_id,)).fetchone() == ("draft",)
                    print("Confirmed retained draft still exists after cleanup.", flush=True)


def request(url, method="GET", headers=None, data=None, accept="json"):
    headers = dict(headers or {})
    if data is not None and not isinstance(data, bytes):
        data = json.dumps(data).encode()
        headers["Content-Type"] = "application/json"
    try:
        with urllib.request.urlopen(urllib.request.Request(url, data, headers, method=method), timeout=15) as response:
            body = response.read()
    except urllib.error.HTTPError as error:
        body = error.read()
        try:
            details = json.loads(body)
            reason = details.get("message") or details.get("error_description") or details.get("msg")
            code = details.get("code") or details.get("error_code")
        except (ValueError, AttributeError):
            reason = code = None
        route = urllib.parse.urlsplit(url).path.split("/")[1:4]
        raise RuntimeError(f"{method} {'/'.join(route)}: HTTP {error.code}, {code or ''} {reason or ''}") from None
    if accept == "bytes":
        return body
    if accept == "text":
        return body.decode()
    return json.loads(body) if body else None


if __name__ == "__main__":
    main()
