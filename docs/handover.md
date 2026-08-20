# Account handover checklist

Everything the site runs on, moved from Taylor's personal accounts to
department-owned ones. Taylor stays an admin on each service but stops being
the owner. Work top to bottom; the order matters in a few places.

## 0. Create the department identities first

- [ ] A department email that outlives any one person, for owning accounts
      and receiving alerts. The existing mandanruralfd@midconetwork.com works
      if the department controls the inbox; otherwise create one it does.
- [ ] A password manager or a written credential sheet the secretary and one
      board officer can access. Every account below gets recorded in it.

## 1. GitHub (the code)

Currently: repo under Taylor's personal account (tbosch82/mrfd-website).

- [ ] Create a free GitHub organization owned by the department account
      (for example, mandan-rural-fire).
- [ ] Transfer the repository into the organization
      (repo Settings -> General -> Transfer ownership). GitHub leaves a
      redirect at the old URL, so nothing breaks immediately.
- [ ] Add Taylor as an organization admin.
- [ ] IMPORTANT: transferring the repo breaks Netlify's connection to it.
      Immediately after the transfer, relink the site in Netlify
      (Site configuration -> Build & deploy -> Link repository).
- [ ] Confirm the daily fire-data-contract Action still runs (Actions tab);
      its failure emails now go to organization watchers, so make sure the
      department account watches the repo and Taylor does too.

## 2. Netlify (hosting, forms, functions)

Currently: site under Taylor's personal team.

- [ ] Create a Netlify team owned by the department email.
- [ ] Transfer the site to that team (Site configuration -> General ->
      Transfer site). Site settings, env vars, forms, and functions move
      with it.
- [ ] Add Taylor as a team member (Owner/Admin role).
- [ ] Verify after transfer, each takes one minute:
  - [ ] Env vars PUBLIC_SANITY_PROJECT_ID and PUBLIC_SANITY_DATASET intact.
  - [ ] Both build hooks still exist (Build & deploy -> Build hooks):
        "Sanity content publish" and "Studio publish button". If a hook URL
        changed, update the Sanity webhook and deployTool.tsx to match.
  - [ ] Form submission notifications point at department addresses.
  - [ ] Deploy-failure notification points at Taylor AND a department
        address.
  - [ ] Trigger one deploy and press the Studio's Update website button once.

## 3. Sanity (the content)

Currently: project ri0z6y8l under Taylor's personal account.

- [ ] Simplest path if the project already lives in an organization you
      created: invite the department email as an org Administrator, rename
      the org to the department, and set the billing contact. No project
      move needed, and no path here moves any content; a project transfer
      is metadata only (same project ID, dataset, and URLs).
- [ ] If the project instead lives under a personal account, transfer it
      into the department org (project Settings -> General -> Organization).
- [ ] Add Taylor as an org/project administrator.
- [ ] Audit project members: secretary as Editor, remove anything stale.
- [ ] Verify the content webhook (API -> Webhooks -> attempts log) fires on
      a test publish after the move.
- [ ] Billing contact (free plan today, but the contact should be the
      department in case that changes).

## 4. Domain (when wired)

Currently: the district owns the domain; confirm the registrar account.

- [ ] Registrar account owned by the department email, not a personal one;
      Taylor added as a delegate/admin if the registrar supports it.
- [ ] Auto-renew ON, department card on file, renewal reminders to the
      department email. An expired domain is the single worst failure mode
      this site has.
- [ ] DNS records documented in the credential sheet (they are also
      recoverable from docs/deployment.md's custom-domain checklist).

## 5. Google (search presence, created during launch)

These do not exist yet; create them under the department from day one
rather than transferring later.

- [ ] A department Google account (or use the department email for these).
- [ ] Google Search Console: verify the custom domain under the department
      account; add Taylor as a full user. Submit the sitemap.
- [ ] Google Business Profile: created and owned by the department account;
      Taylor as manager. The verification postcard goes to the station.

## 6. Already department-owned, just confirm

- [ ] mandanruralfd@midconetwork.com inbox access (it receives NWS contact
      queries, form notifications if configured, and public email).
- [ ] The state data feeds (ND DES ArcGIS, NWS) and the daily contract
      check require no accounts; nothing to transfer.

## Done when

Taylor can be removed from any single account without the site, its builds,
its content editing, or its alerts breaking, and the department can do the
same to any departing member, including, someday, the next webmaster.
