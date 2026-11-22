# LostX – MVP Build Plan

Goal: a working lost & found web app, built fast. Rule-based matching, no image analysis, no extras.

---

## 1. MVP Scope

### In
- Register / login (JWT), two roles: `user`, `admin`
- Report a lost item / report a found item (with optional photo upload, stored only, never analysed)
- Browse + search + filter all reports
- Rule-based match suggestions (lost ↔ found)
- In-app notifications
- Claim a found item, with private-detail verification
- Admin: review claims (approve/reject), delete bad reports, see basic stats
- Status lifecycle: `open → matched → claimed → recovered`

### Out (do later, if ever)
- Image matching / computer vision / AI
- GPS, maps, QR codes
- Email / SMS / push (use in-app notifications only)
- Mobile app, multilingual, chatbot, ID-system integration
- Real-time sockets (polling every 30s is enough)
- Analytics beyond 4–5 counts

---

## 2. Stack (keep it boring)

| Layer | Choice |
|---|---|
| Frontend | React (Vite) + React Router + Axios + Tailwind (or plain CSS) |
| Backend | Node.js + Express |
| DB | MongoDB (Atlas free tier) + Mongoose |
| Auth | JWT + bcrypt |
| Uploads | `multer` → local `/uploads` folder (swap to Cloudinary only if deploying somewhere with ephemeral disk) |
| Deploy | Render/Railway (API) + Vercel/Netlify (client) + Atlas |

---

## 3. Data Models

```
User
  name, email (unique), passwordHash, role ('user'|'admin'), createdAt

Item   // one collection for both lost and found
  type            'lost' | 'found'
  title
  category        enum: id_card, wallet, phone, keys, books, bag, electronics, documents, other
  description
  location        enum/dropdown of predefined campus locations (+ 'other')
  date            date lost / found
  imageUrl        optional
  privateDetails  string  // found: finder's hidden detail (e.g. wallpaper, contents). Never returned in public APIs
  handoverInfo    string  // found: where the item is kept
  status          'open' | 'matched' | 'claimed' | 'recovered'
  reportedBy      ref User
  createdAt

Match
  lostItem        ref Item
  foundItem       ref Item
  score           number
  createdAt
  (unique index on lostItem + foundItem)

Claim
  foundItem       ref Item
  claimant        ref User
  lostItem        ref Item (optional – the claimant's own lost report)
  proofText       string  // claimant's description of hidden details
  status          'pending' | 'approved' | 'rejected'
  adminNote       string
  createdAt

Notification
  user            ref User
  message         string
  link            string  // e.g. /items/:id
  read            boolean
  createdAt
```

Use a **fixed dropdown for location** (e.g. Library, Hostel A, Canteen, Main Gate…). This makes location matching a simple equality check instead of fuzzy text.

---

## 4. Rule-Based Matching

Runs automatically whenever an item is created. A new `lost` item is compared against all `open` `found` items, and vice versa.

**Hard filter:** same `category`, otherwise skip.

**Score (max 100):**

| Rule | Points |
|---|---|
| Category match (required) | 40 |
| Same location | 25 |
| Date within 3 days | 15 (within 7 days: 8) |
| Keyword overlap in title + description | up to 20 |

Keyword overlap = lowercase, strip punctuation, remove a small stop-word list, then `shared words / smaller set size × 20`.

**Threshold:** score ≥ 60 → create a `Match`, notify both reporters, set both items to `matched` (or leave `open` and just show suggestions, simpler and avoids edge cases).

Put this in one file (`services/matcher.js`) with a single exported function `findMatches(item)`. About 40 lines, and easy to unit test.

---

## 5. Claim & Verification Flow

1. Finder posts a found item with public description plus a **private detail** (never shown publicly).
2. Owner finds it via search or match suggestion → clicks **Claim**.
3. Owner fills `proofText` describing things only the real owner would know.
4. Admin opens the claim and sees the claimant's proof next to the item's `privateDetails`.
5. Admin approves → found item status `claimed`, claimant notified with `handoverInfo`.
   Admin rejects → claimant notified with reason.
6. After physical handover, admin marks the item `recovered`.

Rules: one pending claim per user per item; the finder cannot claim their own item.

---

## 6. API Endpoints

```
Auth
  POST   /api/auth/register
  POST   /api/auth/login
  GET    /api/auth/me

Items
  POST   /api/items                 create lost/found (multipart, auth)
  GET    /api/items                 list + filters: type, category, location, q, status, dateFrom, dateTo
  GET    /api/items/mine            current user's reports
  GET    /api/items/:id             detail (strip privateDetails unless owner/admin)
  PUT    /api/items/:id             edit own item
  DELETE /api/items/:id             delete own item (admin can delete any)
  GET    /api/items/:id/matches     suggested matches for this item

Claims
  POST   /api/claims                submit claim
  GET    /api/claims/mine           my claims
  GET    /api/claims                admin: list pending
  PATCH  /api/claims/:id            admin: approve/reject {status, adminNote}

Notifications
  GET    /api/notifications
  PATCH  /api/notifications/:id/read

Admin
  PATCH  /api/admin/items/:id/recovered
  GET    /api/admin/stats           counts: users, lost, found, recovered, pending claims
```

Middleware: `auth` (verify JWT), `adminOnly`, `upload` (multer, 2 MB, images only), basic input validation (`express-validator` or manual).

---

## 7. Folder Structure

```
lostx/
├── server/
│   ├── src/
│   │   ├── models/          User.js Item.js Match.js Claim.js Notification.js
│   │   ├── routes/          auth.js items.js claims.js notifications.js admin.js
│   │   ├── controllers/
│   │   ├── middleware/      auth.js adminOnly.js upload.js
│   │   ├── services/        matcher.js notify.js
│   │   ├── scripts/         seedAdmin.js
│   │   └── app.js
│   ├── uploads/
│   └── .env
└── client/
    └── src/
        ├── pages/           Home Login Register ReportItem Browse ItemDetail MyReports
        │                    MyClaims Notifications AdminDashboard AdminClaims
        ├── components/      Navbar ItemCard FilterBar ProtectedRoute
        ├── api.js           axios instance + token interceptor
        └── App.jsx
```

---

## 8. Build Order (≈ 7 days solo, compressible to 4–5)

### Day 1 – Setup + Auth
- [ ] Init repo, `server/` and `client/`, `.env`, MongoDB Atlas connection
- [ ] User model, register/login, JWT middleware, `seedAdmin.js`
- [ ] React: Login, Register, `ProtectedRoute`, token storage

### Day 2 – Items CRUD
- [ ] Item model, multer upload, create/read/update/delete endpoints
- [ ] Report form (lost/found toggle), "My Reports" page
- [ ] Strip `privateDetails` from public responses

### Day 3 – Browse + Search
- [ ] `GET /api/items` with filters + keyword (`$regex` or a text index on title/description)
- [ ] Browse page with `FilterBar` and `ItemCard`, plus item detail page

### Day 4 – Matching + Notifications
- [ ] `matcher.js`, called after item creation
- [ ] Match + Notification models, `notify()` helper
- [ ] "Possible matches" section on item detail, notification bell with unread count

### Day 5 – Claims
- [ ] Claim model and endpoints, claim form on found-item detail
- [ ] Status transitions + notifications on submit / approve / reject
- [ ] "My Claims" page

### Day 6 – Admin
- [ ] Admin claims queue with side-by-side proof vs private detail
- [ ] Mark recovered, delete any item, stats endpoint and dashboard page

### Day 7 – Polish + Deploy
- [ ] Loading and error states, form validation messages, empty states
- [ ] Seed demo data (10–15 items, 2 users, 1 admin)
- [ ] Deploy API + client, set CORS and env vars, smoke test the full flow

---

## 9. Definition of Done

The MVP is complete when this end-to-end demo works:

1. User A registers and reports a **found** wallet at "Library" with a private detail.
2. User B registers and reports a **lost** wallet at "Library".
3. Both get a match notification.
4. B claims the item and enters proof.
5. Admin sees the claim, compares proof, approves.
6. B sees the handover info, admin marks it **recovered**.

---

## 10. Shortcuts to Keep It Fast

- One `Item` model for both lost and found. Don't build two modules.
- Predefined location and category dropdowns. No free-text matching.
- Notifications are DB rows fetched by polling. No sockets.
- Don't over-style: use Tailwind defaults or a component kit (DaisyUI, shadcn).
- Skip tests except for `matcher.js` (a few quick unit cases).
- Seed the admin from a script. Don't build an admin signup flow.
- Add pagination (`?page=&limit=`) on list endpoints from the start. It's cheap now and painful later.

---

## 11. Post-MVP (only after the demo works)

1. Email notifications (Nodemailer)
2. Cloudinary for image storage
3. Better keyword scoring (TF-IDF / MongoDB text score)
4. Item expiry / auto-archive after N days
5. Everything on the synopsis's Future Scope list
