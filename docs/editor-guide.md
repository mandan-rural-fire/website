# Content editor's guide

For whoever keeps the site's content current, usually the district secretary.
No technical background needed.

## The one thing to understand

The website is rebuilt, not edited live. When you press **Publish** in the
editor, the site rebuilds itself and your change appears **a minute or two
later**. Refresh the page after a couple of minutes; if you still don't see
it, see "Updating the website yourself" below.

## Getting in

1. Go to `https://mandanruralfire.org/studio`
2. Sign in with the account you were invited with.

The left menu is grouped by owner. The **Emergency alert** sits alone on
top. Under **The District**: Meetings, Meeting schedule, Board members,
Votes, Townships, and District facts. Under **The Department**: Officers,
Stations, Apparatus, and Department facts. Under **Website**: Site
settings, Prevention topics, Seasonal tips, and Happenings.

Two extra tabs live in the top bar: **Update website** (the publish
button, see "Updating the website yourself") and **Instructions** (this
guide).

## Updating the website yourself

The **Update website** tab at the top of the editor has a button that
rebuilds the site on demand:

1. Finish your edits and **Publish** each document first.
2. Open **Update website** and press the button once. One press covers
   everything you published; there is no need to press it per change.
3. Watch the little status light: it turns green when the site is updated,
   usually a minute or two.

Use it when a change hasn't appeared on its own, or any time you want to
push your published edits out right away. If the light stays red, or your
change still doesn't appear a few minutes after it turns green, contact
whoever maintains the site.

## Posting a meeting agenda (before the meeting)

1. Open **Meetings**, click the ➕ (new document).
2. The **date** is pre-filled with the next regular meeting date; change it if
   this is a special meeting.
3. The **title** defaults to "Regular Board Meeting"; adjust if needed.
4. Click **Generate** next to the URL slug.
5. On the **Agenda** tab, paste the agenda from Word into the editor. It
   keeps headings and lists; that's all the site needs.
6. Optionally upload the official **Agenda PDF**; the page offers it as a
   download.
7. **Publish.** The agenda appears on the District page and at its own link.
   The "Next meeting" cards on the home and district pages also switch to
   this meeting's date, time, and location until its date passes, so this is
   how a special or rescheduled meeting gets announced.

## Posting minutes (after the meeting)

1. Open the existing meeting document (don't create a new one).
2. On the **Minutes** tab, paste the minutes from Word.
3. When the board approves them, set **Minutes status** to, for example,
   "Approved August 19, 2026", and upload the **Signed minutes PDF** if you
   have one.
4. **Publish.** Until minutes exist, the meeting shows as "agenda only" with
   minutes pending; after this, it appears in the minutes list too.

The site lists the past two years of meetings; older ones stay safely in
the editor as the archive of record (never delete them), and the site tells
residents to contact the board for older records.

## Alert banners

Three kinds of banner appear on the site **automatically**; you never post
these:

- NWS **Red Flag Warnings** and **Fire Weather Watches**
- A **County Burn Ban** banner, when Morton County's official burn
  declaration (state DES data) prohibits all open burning

The same data drives the home page's "Open burning" line: prohibited under
a Red Flag Warning, when the danger rating is High or above, or during a
county ban.

The manual banner is for anything the automatic sources don't cover:

1. Open **Emergency alert** at the top of the left menu.
2. Turn on **Show manual alert banner**.
3. Pick the level, set the **label** and the **message**. The editor won't
   let you publish an enabled banner without a message.
4. **Publish.** When it no longer applies, turn the toggle off and publish
   again.

Multiple banners can show at once; visitors can dismiss each one for their
browsing session.

## Announcing a vote and posting results

When the district schedules a public vote (a levy change, a ballot
measure; director elections happen at the annual meeting and belong in its
minutes), add it under **Votes**: what is being voted on, the voting day, a
plain-terms summary, and where and how to vote. It is highlighted on the
home and district pages until voting day.

After the vote, open the same document and fill in **Outcome** (passed or
failed) and the **Result summary** (the tally and what happens next). The
vote then appears under Past votes on the district page, so residents can
always see what was decided. If the result changes district funding, also
update **District facts** under Funding news.

## Board members, officers, stations, trucks

Each is its own list. Common tasks:

- **Townships**: add each township the district spans once, under
  **Township** in the left menu. The district page groups the board by these.
- **Board seat changes**: each township has two seats, with no distinction
  between them. Create a board member document only for a real person and
  pick their township; a township with fewer than two members shows its
  remaining seats as "Open" on the site automatically, so there is nothing
  to do for vacancies (delete a departing member's document and the seat
  reopens itself). Leave township empty for at-large members.
- **Meeting schedule change**: **Meeting schedule** (next to Meetings): week of
  month, weekday, time, location. Every "next meeting" date on the site
  computes from this; there is nothing else to update. The one exception: a
  posted upcoming meeting shows its own details on the "Next meeting" cards
  until its date passes.
- **Contact info**: **Site settings** under Website holds the phone numbers
  and two emails: the **Department email** (operations: footer Department
  column, join page, accessibility statement) and the **Board email** (the
  district page and the footer District column). The district mailing
  address lives in **District facts**. The footer's street address comes
  from the station marked **Headquarters**; that station's optional
  **Mailing address** field (for example, PO Box 187) adds a "Mail:" line
  under it, and clearing the field removes the line.

## Prevention topics

The prevention page is built from **Prevention topics**: each topic is a
page section with a title (for example, Structure fire safety), an optional
kicker line and summary, and a set of **tip cards**, each card a short
heading with bullet points. Two cards sit side by side on desktop. Topics
get jump links at the top of the page automatically; use Display order to
arrange them. The "Safe burning basics" section at the bottom is part of
the site itself and needs no entry.

## Things that hide when empty

The mill rate (in **District facts**) and the volunteer count and square
miles (in **Department facts** under The Department) each hide their stat
on the site while empty, so an empty field never shows a made-up number.
Fill them when you have real figures. The **mission statement** (same
document) works the same way: its band on the Department page appears
only while the field has text.

**Funding news** (District facts) is the same idea: the highlighted box in
the district page's funding section shows whatever headline and note you
put there (a levy vote, a budget decision). Update it when the story
changes; clear the note and the box disappears. Do not leave old news up.

The home page's seasonal safety tip card also hides itself: it only appears
when **Seasonal tips** exist for the current season (each tip is tagged
Winter, Spring, Summer, or Fall). Add a few per season and the card shows
and rotates through them.

## If a publish doesn't show up

Wait five minutes and hard-refresh (Ctrl+Shift+R). Still missing? Press
the button in **Update website** and watch for the green light. If even
that doesn't bring the change through, ask whoever maintains the site to
check `docs/deployment.md`, section "The content webhook".
