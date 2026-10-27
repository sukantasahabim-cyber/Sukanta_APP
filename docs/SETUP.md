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

Where secrets go: [**New repository secret**](https://github.com/sukantasahabim-cyber/Sukanta_APP/settings/secrets/actions/new) on GitHub
(repository → **Settings** → **Secrets and variables** → **Actions**). Type the
name exactly as written here, paste the value, and press **Add secret**.

---

## 1. Cloudflare: publish the app and its server

1. Open this link while signed in to Cloudflare. It opens the token form with
   everything already filled in:
   [**Create the SurTaal deploy token**](https://dash.cloudflare.com/profile/api-tokens?permissionGroupKeys=%5B%7B%22key%22%3A%22workers_scripts%22%2C%22type%22%3A%22edit%22%7D%2C%7B%22key%22%3A%22workers_routes%22%2C%22type%22%3A%22edit%22%7D%2C%7B%22key%22%3A%22account_settings%22%2C%22type%22%3A%22read%22%7D%2C%7B%22key%22%3A%22zone%22%2C%22type%22%3A%22read%22%7D%5D&accountId=%2A&zoneId=all&name=SurTaal%20GitHub%20deploy).
   Press **Continue to summary** → **Create Token**, then **Copy** the token
   (it is shown only once).
2. Open [**New repository secret**](https://github.com/sukantasahabim-cyber/Sukanta_APP/settings/secrets/actions/new). Name: `CLOUDFLARE_API_TOKEN`,
   value: the token → **Add secret**.
3. Tell Claude, or start it yourself: GitHub → **Actions** → **Test and publish**
   → **Run workflow**.

The workflow finds your Cloudflare account by itself, picks a free
`workers.dev` address for it if it has none, publishes the app, and checks
the live site. The address appears at the top of the run's summary, for
example `https://surtaal.surtaal-app.workers.dev`. From then on every merge to
`main` publishes to Cloudflare as well as GitHub Pages.

- Only if the run says the token can reach more than one account: add a second
  secret `CLOUDFLARE_ACCOUNT_ID` with the account you want (shown on the
  Cloudflare dashboard's **Workers & Pages** page).
- Claude then records the site address in the workflows, so the GitHub Pages
  copy and the iPhone app can reach the AI teacher. (By hand: add a GitHub
  **variable** `SURTAAL_SITE_URL` with the address, without a slash at the end.)

## 2. Google AI Studio: switch on the AI teacher

1. Open <https://aistudio.google.com/app/apikey>, sign in with your Google
   account, press **Create API key**, and copy the key.
2. Open [**New repository secret**](https://github.com/sukantasahabim-cyber/Sukanta_APP/settings/secrets/actions/new). Name: `GEMINI_API_KEY`,
   value: the key → **Add secret**.
3. Tell Claude, or run **Actions → Test and publish → Run workflow** again. The
   workflow hands the key to the Cloudflare server, which is the only place it
   is kept, and then asks the AI teacher a test question; its answer appears in
   the run's summary.

Good to know:
- The model is set in `wrangler.jsonc` (`GEMINI_MODEL`, default `gemini-flash-latest`).
- Each learner can ask at most 10 questions a minute. Google's free tier has
  its own daily limits. If many people use the app, turn on billing for the
  key's Google Cloud project; that also stops Google using the questions to
  improve its products. The privacy page mentions this.
- When accounts (part 3) are switched on, only signed-in learners can use the teacher.

## 3. Supabase: sign-in and progress sync

**Quickest way:** connect the **Supabase** connector to Claude at
<https://claude.ai/customize/connectors>, then start a new Claude Code session
on this repository and ask: *"Set up Supabase for SurTaal, following
docs/SETUP.md part 3."* Claude creates the project, the table and the keys and
publishes them; you only do step 3 (the email template). To do it all by hand:

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

1. Cloudflare dashboard → **Workers & Pages** → **surtaal** → **Domains** →
   **Buy a domain**. Search for a name, for example `surtaal`, and buy one that
   is free (`.com`, `.app` and `.org` are good choices). Cloudflare charges the
   registry price with no mark-up, renews it each year, and connects it to the
   app automatically with HTTPS.
2. Tell Claude the domain. Claude adds it to `wrangler.jsonc` so every deploy
   keeps it, and points the workflows and the iPhone app at it.
3. If accounts are on (part 3): Supabase → **Authentication** → **URL
   Configuration** → **Site URL**: `https://yourdomain`.

## 5. Apple TestFlight: the iPhone app

The iPhone app is in `ios/`. It is built on a Mac in GitHub Actions, so you
do not need a Mac.

1. Join the **Apple Developer Program** at <https://developer.apple.com/programs/enroll/>
   ($99 a year). Approval can take a day or two.
2. Find your **Team ID**: <https://developer.apple.com/account> → **Membership details**.
3. Register the app's ID at <https://developer.apple.com/account/resources/identifiers/add/bundleId>
   → **App IDs** → **App** → Description `SurTaal`, Bundle ID **Explicit**
   `com.sukantasaha.surtaal` → **Register**.
   (To use a different ID, also add a GitHub **variable** `IOS_BUNDLE_ID` with it.)
4. Create the app record: <https://appstoreconnect.apple.com/apps> → **+** →
   **New App** → iOS, name `SurTaal` (if the name is taken, try
   `SurTaal – Singing & Tabla`), language, the bundle ID from step 3, and SKU `surtaal`.
5. Make an API key for GitHub at <https://appstoreconnect.apple.com/access/integrations/api>
   → **Team Keys** → **+**. Name it
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
