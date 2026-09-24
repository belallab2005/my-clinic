# Creating the first accounts

There's no public sign-up (correct, for a clinical system) — accounts are
created by you, once, after the schema is installed.

## Fastest way: Supabase Dashboard
1. Authentication → Users → **Add user** → set email + password, tick
   "Auto Confirm User".
2. In the "User Metadata" field (raw JSON) set the fields the
   `handle_new_user` trigger reads, e.g.:
   ```json
   { "name": "Dr. Aya Nasser", "role": "super_admin", "title": "Super Admin" }
   ```
   `role` must be one of: `super_admin`, `admin`, `supervisor`, `student`.
3. Repeat for a supervisor and a student account so you have one of each
   role to test with. A `profiles` row is created automatically by the
   trigger in `schema.sql`.

## Or via SQL (after creating the auth user in the dashboard)
If you created the auth user without metadata, just update their profile
row directly:
```sql
update profiles
set role = 'supervisor', title = 'Clinical Supervisor'
where email = 'supervisor@example.edu';
```

## Assigning students to a section
```sql
update sections
set student_ids = array_append(student_ids, '<student-uuid>')
where id = '<section-uuid>';
```
(Get a user's uuid from `select id, email from profiles;`.)
