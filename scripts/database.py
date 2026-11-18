"""Run project SQL using a password supplied through hidden stdin."""
import getpass
import json
import pathlib
import sys
import psycopg

payload = json.loads(getpass.getpass('Database operation JSON (hidden): '))
try:
    with psycopg.connect(host='db.xqturhxjnwjzakfkypxi.supabase.co', dbname='postgres', user='postgres', password=payload['password'], sslmode='require', connect_timeout=15) as conn:
        with conn.cursor() as cur:
            if payload['operation'] == 'inspect':
                cur.execute("select table_schema, table_name from information_schema.tables where table_schema in ('public','private') order by 1,2")
                print(json.dumps({'tables': cur.fetchall()}))
            else:
                cur.execute(pathlib.Path(payload['file']).read_text(encoding='utf-8-sig'))
                results = []
                while True:
                    if cur.description:
                        results.append(cur.fetchall())
                    if not cur.nextset():
                        break
                print(json.dumps({'operation': payload['operation'], 'results': results}, default=str))
            if payload.get('admin_email'):
                cur.execute('insert into private.admin_invitations(email) values(lower(%s)) on conflict do nothing', (payload['admin_email'],))
                cur.execute('insert into private.staff_members(user_id) select id from auth.users where lower(email)=lower(%s) and email_confirmed_at is not null on conflict do nothing', (payload['admin_email'],))
                cur.execute('select exists(select 1 from private.staff_members s join auth.users u on u.id=s.user_id where lower(u.email)=lower(%s))', (payload['admin_email'],))
                print(json.dumps({'admin_invitation': 'configured', 'verified_staff_account_active': cur.fetchone()[0]}))
except Exception as error:
    print(json.dumps({'error_type': type(error).__name__, 'message': str(error).replace(payload['password'], '[redacted]')}))
    sys.exit(1)
