# Setting up SurTaal's online services

SurTaal works fully without any of this. Each part below switches on one extra
feature and can be done on its own day. Do them in this order:

| Part | What you get | Cost |
| --- | --- | --- |
| 1. Cloudflare | The app at a fast `…workers.dev` address, plus the server the AI teacher needs | Free |
| 2. Google AI Studio | The AI teacher (🧑‍🏫 in Tools, on lessons and after practicals) | Free tier |
| 3. Supabase | Sign-in with an emailed code, progress saved online and shared across devices | Free tier |
| 4. Your own domain | The app at your own address, such as `surtaal.app` | About $10–15 a year |
| 5. Apple TestFlight | SurTaal as a real iPhone app for you and your testers | $99 a year (Apple Developer Program) |

**Keep secret values secret.** The Cloudflare token, Gemini key and Apple key
go only into GitHub's **Secrets** page (steps below), never into a chat,
email or file in the repository. Anyone holding them can spend your quota.
The Supabase project address and *publishable* key are not secret; they are
designed to be inside the app.

Where secrets go: on GitHub open the repository → **Settings** → **Secrets and
variables** → **Actions**. The **Secrets** tab holds secrets; the **Variables**
tab holds ordinary settings.

---

## 1. Cloudflare: publish the app and its server

1. Sign in at <https://dash.cloudflare.com>.
2. Open **Workers & Pages**. If Cloudflare asks you to choose a `workers.dev`
   subdomain, pick one (for example `sukanta`). Your app will be at
   `https://surtaal.<subdomain>.workers.dev`.
3. Copy your **Account ID** (shown on the Workers & Pages overview, right-hand side).
4. Make an API token: click your profile icon → **My Profile** → **API Tokens**
   → **Create Token** → use the **Edit Cloudflare Workers** template.
   - Account Resources: *Include → your account*.
   - Zone Resources: *Include → All zones* (needed later for your own domain).
   - **Continue to summary** → **Create Token**, and copy the token. It is shown only once.
5. On GitHub add two **secrets**:
   - `CLOUDFLARE_ACCOUNT_ID`: the Account ID.
   - `CLOUDFLARE_API_TOKEN`: the token.
6. Publish: GitHub → **Actions** → **Test and publish** → **Run workflow** (on `main`).
   When the **cloudflare** job is green, open
   `https://surtaal.<subdomain>.workers.dev`.
7. On GitHub add a **variable** `SURTAAL_SITE_URL` with that address, for example
   `https://surtaal.sukanta.workers.dev`, without a slash at the end. The
   GitHub Pages copy and the iPhone app use it to reach the AI teacher.

From now on every merge to `main` publishes to Cloudflare as well as GitHub Pages.

## 2. Google AI Studio: switch on the AI teacher

1. Open <https://aistudio.google.com> and sign in with a Google account.
2. Click **Get API key** → **Create API key**, then copy the key.
3. On GitHub add a **secret** `GEMINI_API_KEY` with the key.
4. Run **Actions → Test and publish → Run workflow** again. The workflow hands
   the key to the Cloudflare server, which is the only place it is kept.
5. Check it: `https://<your site>/api/health` should show `"ai":true`. Open
   **Tools → AI Teacher** and ask a question.

Good to know:
- The model is set in `wrangler.jsonc` (`GEMINI_MODEL`, default `gemini-flash-latest`).
- Each learner can ask at most 10 questions a minute. Google's free tier has
  its own daily limits. If many people use the app, turn on billing for the
  key's Google Cloud project; that also stops Google using the questions to
  improve its products. The privacy page mentions this.
- When accounts (part 3) are switched on, only signed-in learners can use the teacher.

## 3. Supabase: sign-in and progress sync

1. Create a free account at <https://supabase.com> → **New project**. Name it
   `surtaal`, choose a strong database password (keep it somewhere safe), and
   pick the region nearest your learners (for India: **Mumbai**).
2. Create the database table: **SQL Editor** → **New query** → paste everything
   from [`supabase/setup.sql`](../supabase/setup.sql) → **Run**. It should say *Success*.
3. Make the emails carry a code: **Authentication** → **Emails** (Email
   Templates). In **both** the **Magic link** and the **Confirm sign up**
   templates, replace the body with:

   ```html
   <h2>Your SurTaal sign-in code</h2>
   <p>Type this code in the app:</p>
   <p style="font-size:28px;font-weight:bold;letter-spacing:4px">{{ .Token }}</p>
   <p>If you did not ask for it, you can ignore this email.</p>
   ```

   Subject: `Your SurTaal code`. The app asks for the code instead of using a
   link, so it works the same in the browser and in the iPhone app.
4. **Authentication** → **URL Configuration** → **Site URL**: your site address
   from part 1 (later your own domain).
5. **Before inviting other people:** Supabase's built-in email sender only
   delivers to your own team's addresses, a few per hour. Under
   **Authentication** → **Emails** → **SMTP Settings**, connect a mail service.
   [Resend](https://resend.com) has a free plan; its guide shows the exact
   Supabase settings.
6. **Project Settings** → **API Keys**: copy the **Project URL** and the
   **Publishable key** (`sb_publishable_…`). Paste both to Claude, or put them in
   [`js/config.js`](../js/config.js) as `supabaseUrl` and `supabaseKey` and
   merge. Never use the *secret* (`sb_secret_…`) or `service_role` key in the app.

When it is published, **Progress** shows an **Account & sync** card. Sign in
with your email, type the code, and your progress is saved online. Sign in on
another device with the same email and it appears there.

## 4. Your own domain

1. Cloudflare dashboard → **Domain Registration** → **Register Domains**.
   Search for a name, for example `surtaal`, and buy one that is free
   (`.com`, `.app` and `.org` are good choices). Cloudflare charges the
   registry price with no mark-up and renews it each year.
2. Tell Claude the domain. Claude adds it to `wrangler.jsonc` as a custom
   domain, and the next publish puts the app there with HTTPS. (To do it
   yourself, add `"routes": [{ "pattern": "yourdomain.app", "custom_domain": true }]`.)
3. Then update:
   - the GitHub variable `SURTAAL_SITE_URL` to `https://yourdomain.app`;
   - Supabase → **Authentication** → **URL Configuration** → **Site URL**.

## 5. Apple TestFlight: the iPhone app

The iPhone app is in `ios/`. It is built on a Mac in GitHub Actions, so you
do not need a Mac.

1. Join the **Apple Developer Program** at <https://developer.apple.com/programs/>
   ($99 a year). Approval can take a day or two.
2. Find your **Team ID**: <https://developer.apple.com/account> → **Membership details**.
3. Register the app's ID: **Certificates, IDs & Profiles** → **Identifiers** → **+**
   → **App IDs** → **App** → Description `SurTaal`, Bundle ID **Explicit**
   `com.sukantasaha.surtaal` → **Register**.
   (To use a different ID, also add a GitHub **variable** `IOS_BUNDLE_ID` with it.)
4. Create the app record: <https://appstoreconnect.apple.com> → **Apps** → **+** →
   **New App** → iOS, name `SurTaal` (if the name is taken, try
   `SurTaal – Singing & Tabla`), language, the bundle ID from step 3, and SKU `surtaal`.
5. Make an API key for GitHub: App Store Connect → **Users and Access** →
   **Integrations** → **App Store Connect API** → **Team Keys** → **+**. Name it
   `GitHub`, Access **Admin**, then **Generate**. Download the `.p8` file (you can
   download it only once) and note the **Key ID** and the **Issuer ID** shown above the list.
   *Admin* is needed so the build can create its own signing certificate.
6. On GitHub add four **secrets**:
   - `APPLE_TEAM_ID`: from step 2.
   - `APP_STORE_CONNECT_KEY_ID`: the Key ID.
   - `APP_STORE_CONNECT_ISSUER_ID`: the Issuer ID.
   - `APP_STORE_CONNECT_PRIVATE_KEY`: open the `.p8` file in a text editor and
     paste all of it, including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines.
7. Build: GitHub → **Actions** → **iOS app to TestFlight** → **Run workflow**. It
   takes about 15–25 minutes. If it fails, send Claude the link to the run.
8. App Store Connect → your app → **TestFlight**. After Apple's processing
   (5–30 minutes), the build appears. Add yourself under **Internal Testing**.
   Install the **TestFlight** app on your iPhone and accept the invitation.
9. To invite friends (**External Testing**), Apple first reviews the build
   (usually within a day). Fill in **Test Information**: a feedback email, and
   the privacy policy address `https://<your site>/privacy.html`.

Each run makes a new build number, so you can run it again after every change.

### Please check on the iPhone

- The microphone permission prompt appears, and the practicals hear you.
- Sound plays even with the ring/silent switch on silent. If it is silent,
  tell Claude; the app may need to ask iOS for "playback" audio.
- Signing in with the emailed code, and the AI teacher.
- Saving an MP3 from the Music Studio and from "Sing with your own track", and
  YouTube videos in "Sing with your own track". These behave differently
  inside apps than in Safari, so please report anything that does not work.

---

## How it fits together

```
iPhone app / browser ──► Cloudflare Worker (wrangler.jsonc, worker/index.js)
                           ├─ the app's files (built into dist/ by scripts/build.mjs)
                           └─ /api/ai ──► Google Gemini   (key: Worker secret)
        └──────────────► Supabase (sign-in + progress table, row-level security)
```

- `js/config.js`: public settings (Supabase address and publishable key, API address).
- `js/online/account.js`: sign-in with an email code, sync and account deletion.
- `js/online/ai.js` and `js/views/teacher.js`: the AI teacher.
- `.github/workflows/pages.yml`: tests, GitHub Pages and Cloudflare publishing.
- `.github/workflows/ios-testflight.yml`: the iPhone build.
