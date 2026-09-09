# Auth Testing Playbook

## Endpoints
- POST /api/auth/register – body: name, email, password, mobile, role (farmer default)
- POST /api/auth/login – body: email, password
- POST /api/auth/logout – clears cookies
- GET  /api/auth/me – returns current user

## Cookies
`access_token` (15 min) + `refresh_token` (7 days), httpOnly, secure, SameSite=None.

## Curl checks
```
curl -c cookies.txt -X POST $URL/api/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"subhamsathua57@gmail.com","password":"Admin@2026"}'
curl -b cookies.txt $URL/api/auth/me
```

## Mongo verification
- users.email unique index
- password_hash begins with `$2b$`
- password_reset_tokens TTL on expires_at
- login_attempts index on identifier
