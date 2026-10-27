# SurTaal: tasks that need the owner's accounts

**For Claude Cowork, working in the owner's browser on their computer.**

SurTaal is a music-learning app (singing and tabla). Its code is finished and
lives at <https://github.com/sukantasahabim-cyber/Sukanta_APP>. A separate Claude
Code session (called "the developer session" below) built it. That session
cannot open these websites itself. Each task below switches on one feature by
creating something in the owner's own accounts.

## Ground rules (read first)

1. **The owner signs in.** Whenever a site asks for a password, a 2-step code or
   a passkey, stop and ask the owner to do it. Never type passwords.
2. **Secrets go only into GitHub Secrets.** The Gemini key, the Cloudflare token
   and the Apple key are secrets. Copy each one from the page that shows it and
   paste it straight into the GitHub secret form described below. Never paste a
   secret into a chat (including this one), an email, a document or a file, and
   never repeat it in your messages.
3. **The owner pays and agrees.** For any payment (domain, Apple), identity
   check or "I agree to the terms" box, stop and let the owner do it.
4. **Change nothing else.** Only do what is listed here. If a page looks
   different from these steps, describe what you see to the owner instead of
   guessing.
5. Keep the list of [values to send back](#values-to-send-back) (none of them
   are secret). The owner gives them to the developer session.

### How to add a GitHub secret (used in several tasks)

1. Open <https://github.com/sukantasahabim-cyber/Sukanta_APP/settings/secrets/actions/new>.
   The owner must be signed in to GitHub as **sukantasahabim-cyber**.
2. **Name**: type the name exactly as given in the task (capital letters, underscores).
3. **Secret**: paste the value.
4. Press **Add secret**. GitHub may ask the owner to confirm with a password or code.
5. Check: the name now appears at <https://github.com/sukantasahabim-cyber/Sukanta_APP/settings/secrets/actions>.

---

## Checklist

| # | Task | Owner needed for | Time |
| --- | --- | --- | --- |
| 1 | [Gemini API key → GitHub](#1-gemini-api-key) | Google sign-in, accepting Google's terms | 3 min |
| 2 | [Cloudflare token → GitHub, publish](#2-cloudflare-token-and-first-publish) | Cloudflare sign-in | 8 min |
| 3 | [Supabase project (sign-in and sync)](#3-supabase-sign-in-and-progress-sync) | Supabase sign-up or sign-in | 10 min |
| 4 | [Domain name](#4-domain-name) | Payment | 5 min |
| 5 | [Apple Developer and TestFlight](#5-apple-developer-and-testflight) | Apple ID, identity check, $99 payment | 30 min, plus Apple's approval (up to 2 days) |

Do them in this order. Tasks 1 and 2 are needed for the AI teacher.

---

## 1. Gemini API key

Needed for: the AI music teacher.

1. Open <https://aistudio.google.com/app/apikey>. The owner signs in with their Google account.
2. If Google shows its terms, the owner reads and accepts them.
3. Press **Create API key**. If asked for a Google Cloud project, choose the
   suggested one (for example *Default Gemini Project*) or **Create API key in
   new project**.
4. Copy the key. It is a long text that starts with `AIza`.
5. Add it as a GitHub secret named **`GEMINI_API_KEY`** (see [How to add a GitHub secret](#how-to-add-a-github-secret-used-in-several-tasks)).

- [ ] `GEMINI_API_KEY` added

## 2. Cloudflare token and first publish

Needed for: the app's main website and the server for the AI teacher.

1. The owner signs in at <https://dash.cloudflare.com>.
2. Open this link. It opens the API-token form with the right permissions
   already filled in:
   <https://dash.cloudflare.com/profile/api-tokens?permissionGroupKeys=%5B%7B%22key%22%3A%22workers_scripts%22%2C%22type%22%3A%22edit%22%7D%2C%7B%22key%22%3A%22workers_routes%22%2C%22type%22%3A%22edit%22%7D%2C%7B%22key%22%3A%22account_settings%22%2C%22type%22%3A%22read%22%7D%2C%7B%22key%22%3A%22zone%22%2C%22type%22%3A%22read%22%7D%5D&accountId=%2A&zoneId=all&name=SurTaal%20GitHub%20deploy>
3. Check the form shows these permissions. If any are missing, add them with **+ Add more**:
   - Account → **Workers Scripts** → **Edit**
   - Account → **Account Settings** → **Read**
   - Zone → **Workers Routes** → **Edit**
   - Zone → **Zone** → **Read**
   - Account Resources: **Include → All accounts**; Zone Resources: **Include → All zones**.
4. Press **Continue to summary**, then **Create Token**. Copy the token (it is shown only once).
5. Add it as a GitHub secret named **`CLOUDFLARE_API_TOKEN`**.
6. Publish: open <https://github.com/sukantasahabim-cyber/Sukanta_APP/actions/workflows/pages.yml>,
   press **Run workflow**, keep branch **main**, and press the green **Run workflow** button.
7. Wait about 3–5 minutes, then open the new run at the top of the list. The run's
   **Summary** shows **"SurTaal is live at https://…"**. If the Gemini key
   from task 1 is in place, it also shows a test answer from the AI teacher.
   - Write down the address. → *value to send back*
   - If the run is red, copy the run's address (URL). → *value to send back*
   - If the run says the token can reach more than one account: open
     <https://dash.cloudflare.com/?to=/:account/workers-and-pages>, ask the owner
     which account SurTaal should use, copy its **Account ID** (shown on the
     right of that page), add it as a GitHub secret named
     **`CLOUDFLARE_ACCOUNT_ID`**, and run the workflow again.

- [ ] `CLOUDFLARE_API_TOKEN` added
- [ ] Publish run green, live address noted

## 3. Supabase: sign-in and progress sync

Needed for: learners signing in with a code sent by email, and progress saved online.

1. Open <https://supabase.com/dashboard>. The owner signs up or signs in. ("Continue with GitHub" is easiest.)
2. Create a project at <https://supabase.com/dashboard/new>:
   - Organization: the owner's own, or a new free one called `SurTaal` (Plan: **Free**).
   - Project name: `surtaal`.
   - Database password: press **Generate a password**. The owner saves it in
     their own password manager. It is not needed anywhere else, so don't send it.
   - Region: the one nearest the learners. For India, choose **South Asia (Mumbai)**.
   - Press **Create new project** and wait until it is ready (about 2 minutes).
3. Create the database table:
   - Open the SQL editor: **SQL Editor** in the left menu → **New query**.
   - Open <https://raw.githubusercontent.com/sukantasahabim-cyber/Sukanta_APP/main/supabase/setup.sql>,
     select all the text and copy it.
   - Paste it into the query box, then press **Run**. Expected: *"Success. No rows returned"*.
   - If Supabase warns that the query is destructive, it is the
     "drop policy if exists" lines; this is expected. Confirm and run.
4. Make the sign-in email show a code. Go to **Authentication** → **Emails** → **Templates**.
   Do this for **Confirm sign up** and again for **Magic link**:
   - Subject: `Your SurTaal code`
   - Body: delete what is there and paste:
     ```html
     <h2>Your SurTaal sign-in code</h2>
     <p>Type this code in the app:</p>
     <p style="font-size:28px;font-weight:bold;letter-spacing:4px">{{ .Token }}</p>
     <p>If you did not ask for it, you can ignore this email.</p>
     ```
   - Press **Save**.
5. Set the site address: **Authentication** → **URL Configuration** → **Site URL**.
   Enter the live address from task 2 (for example `https://surtaal.something.workers.dev`), then **Save**.
6. Copy the two public values (these are **not** secret):
   - **Project URL**: on the project's home page, or **Project Settings** →
     **Data API**. It looks like `https://abcdefghijklmnop.supabase.co`. → *value to send back*
   - **Publishable key**: **Project Settings** → **API Keys**. It starts with
     `sb_publishable_`. (If the page only shows "legacy" keys, use the one named
     **anon public**.) → *value to send back*
   - Do **not** copy the **secret** key (`sb_secret_…`) or the `service_role` key anywhere.

- [ ] Project created, `setup.sql` ran with no errors
- [ ] Both email templates show the code
- [ ] Project URL and publishable key noted

## 4. Domain name

Needed for: SurTaal at its own address, such as `surtaal.app`. This costs about
$10–15 a year, so **the owner pays**.

1. Open <https://dash.cloudflare.com/?to=/:account/workers-and-pages>, open the
   Worker named **surtaal** (it exists after task 2), and go to its **Domains** tab.
2. Choose **Buy a domain**. Search for `surtaal` and show the owner which endings
   are free and their prices (`.com`, `.app`, `.org` are good choices). The owner
   chooses and pays.
3. If the domain is not connected to the Worker automatically: in the same
   **Domains** tab choose **Add** → **Custom domain**, type the domain, and confirm.
4. Note the domain. → *value to send back*

- [ ] Domain bought and connected

## 5. Apple Developer and TestFlight

Needed for: SurTaal as an iPhone app, tested through TestFlight. The build itself
runs on GitHub; nobody needs a Mac.

### 5a. Join the Apple Developer Program (owner only)
1. The owner opens <https://developer.apple.com/programs/enroll/>, signs in with
   their Apple ID (2-step verification must be on), enrolls as an **Individual**,
   confirms their identity, and pays $99 a year.
2. Apple usually approves within 48 hours and sends an email. Continue after that.

### 5b. Team ID
1. Open <https://developer.apple.com/account> → **Membership details**.
2. Copy the **Team ID** (10 letters and numbers).
3. Add it as a GitHub secret named **`APPLE_TEAM_ID`**.

### 5c. Register the app's ID
1. Open <https://developer.apple.com/account/resources/identifiers/add/bundleId>.
2. Choose **App IDs** → **Continue** → **App** → **Continue**.
3. Description: `SurTaal`. Bundle ID: **Explicit**, `com.sukantasaha.surtaal`.
   Leave all capabilities unticked.
4. **Continue** → **Register**.

### 5d. Create the app in App Store Connect
1. Open <https://appstoreconnect.apple.com/apps> → **+** → **New App**.
2. Platform **iOS**. Name `SurTaal` (if the name is taken, try `SurTaal – Singing & Tabla`).
   Primary language **English (U.S.)**. Bundle ID **com.sukantasaha.surtaal**.
   SKU `surtaal`. User access **Full Access**.
3. Press **Create**.

### 5e. App Store Connect API key for GitHub
1. Open <https://appstoreconnect.apple.com/access/integrations/api>. If Apple asks
   to **Request Access** first, the owner (Account Holder) accepts it.
2. Choose **Team Keys** → **+** (Generate API Key). Name `GitHub`, Access **Admin**, then **Generate**.
3. Note the **Issuer ID** (shown above the list) and the new key's **Key ID**.
4. Press **Download API Key**. Apple allows this **only once**. It downloads a
   file named like `AuthKey_ABC123DEFG.p8`.
5. Add three GitHub secrets:
   - **`APP_STORE_CONNECT_KEY_ID`**: the Key ID.
   - **`APP_STORE_CONNECT_ISSUER_ID`**: the Issuer ID.
   - **`APP_STORE_CONNECT_PRIVATE_KEY`**: open the `.p8` file in a text editor
     (TextEdit or Notepad), select **all** the text, including the lines
     `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`, copy and paste.
6. Ask the owner whether to keep the `.p8` file in their password manager or
   delete it. It can always be replaced by making a new key. Never email or share it.

### 5f. Build the iPhone app
1. Open <https://github.com/sukantasahabim-cyber/Sukanta_APP/actions/workflows/ios-testflight.yml>
   → **Run workflow** (branch **main**) → **Run workflow**.
2. Wait about 20–30 minutes. If the run is green, Apple processes the build for
   another 5–30 minutes. If it is red, copy the run's address. → *value to send back*

### 5g. Install it on the owner's iPhone
1. Open <https://appstoreconnect.apple.com/apps> → **SurTaal** → **TestFlight**.
2. Under **Internal Testing** press **+**, make a group called `Owner`, and add the owner's Apple ID.
3. The owner installs the **TestFlight** app from the App Store on their iPhone,
   opens the invitation email, and installs SurTaal.

- [ ] Apple Developer membership approved
- [ ] `APPLE_TEAM_ID`, `APP_STORE_CONNECT_KEY_ID`, `APP_STORE_CONNECT_ISSUER_ID`, `APP_STORE_CONNECT_PRIVATE_KEY` added
- [ ] App ID registered and app created in App Store Connect
- [ ] TestFlight build installed on the owner's iPhone

---

## Values to send back

Give these to the developer session (none of them are secret):

| Value | From task | Example |
| --- | --- | --- |
| Which GitHub secrets were added (names only) | 1, 2, 5 | `GEMINI_API_KEY`, `CLOUDFLARE_API_TOKEN`, … |
| Live address from the publish run | 2 | `https://surtaal.something.workers.dev` |
| Supabase Project URL | 3 | `https://abcdefghijklmnop.supabase.co` |
| Supabase publishable key | 3 | `sb_publishable_…` |
| Domain bought | 4 | `surtaal.app` |
| Address of any red (failed) run | 2, 5f | `https://github.com/…/actions/runs/…` |

**Never send:** passwords, the Gemini key, the Cloudflare token, the Supabase
database password or secret/`service_role` key, or the Apple `.p8` file. Those
live only in GitHub Secrets and with the owner.

The developer session then puts the public values into the app, publishes it,
switches on sign-in, connects the domain everywhere, and checks that each
feature works.
