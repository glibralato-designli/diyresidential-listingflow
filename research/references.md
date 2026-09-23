# Reference research — Mobbin

Done before any code, per spec section 1. Findings below are answers to the seven questions, in order, followed by a note on tool limitations, other flows searched, and a summary of contradictions to carry into the build.

**Tool limitation, stated up front:** the Mobbin MCP connector only exposes semantic search (`search_flows`, `search_screens`, `search_sections`) — there is no fetch-by-URL / fetch-by-ID call. I could not open the two exact URLs in section 1 as pages. Instead I searched for the same flows by description and matched results back to the same flow IDs that appear in those URLs, which Mobbin's search confirmed exist verbatim:

- Airbnb — `Listing a home`, flow id `390e0140-7492-495a-8669-6cbdb8f73655`, 20 screens, `platform: web`. This is the exact flow the spec links. I retrieved images for all 20 screens across two search passes.
- Zillow — `Listing a property`, flow id `dd1f0388-8743-42f3-a1d0-ef1babc87e58`, 33 screens, `platform: web`. This is also the exact flow ID the spec links, confirmed to exist, but semantic search never surfaced its own screen thumbnails directly — every query aimed at "Zillow listing flow" returned other, related Zillow flows instead (home-value funnel, Rental Manager). See Q7 for what I used instead and why I'm confident about the substitution.

---

## 1. Act structure (Airbnb)

The 20-screen flow is organized around exactly **three full-bleed stage-intro screens**, not four, and not evenly spaced:

- Intro 1 — "Step 1 / Tell us about your place": isometric illustration right, left-aligned small label ("Step 1"), a ≤4-word heading, a two-sentence description of what the step will ask ("we'll ask which type of property you have and if guests will book the entire place or just a room. Then let us know the location and how many guests can stay."), "Save & exit" + "Questions?" pinned top-right, Back (disabled) / Next footer, and a **thin 3-segment progress bar** at the very bottom edge.
- Intro 2 — "Step 2 / Make your place stand out", identical template, describing amenities + 5 photos + title/description.
- Intro 3 (implied by the 3-segment bar and the "Step 3" pattern, not directly captured in this pass) — pricing/publish.

Between "start" and the first real question there is exactly **one screen** (the Step 1 intro) — Airbnb does not stack multiple onboarding/marketing screens before asking anything, unlike our four-act overview (`E2`) which precedes five acts' worth of content on one screen. No duration is ever stated on these intro screens — confirms the spec's "no duration, ever" rule is safe and consistent with the closest reference.

## 2. Pacing (Airbnb)

Within a step group, Airbnb runs **single-question or single-purpose screens almost exclusively**: place-type list → guest/bedroom/bed steppers + one Yes/No radio (the densest screen in the whole flow, and it's still only 4 fields) → location search → pin confirmation → "show specific location" toggle. The amenities grid (step 2) is the one screen that reads as a checkbox inventory rather than a single question. Nothing in the 20-screen flow approaches our spec's 12–16-field dense grids or six-question disclosure batches.

**Contradiction to flag:** our spec's dense screens are considerably denser than anything Airbnb ships. This is expected and correct — Airbnb has zero legal-form obligations, we have 332 fields mapped to Tennessee RF 201/203. Follow the spec's dense-screen pattern; Airbnb is not a valid ceiling for field count per screen.

The switch between "paced" and "dense" is signaled purely by the stage-intro screen — there is no separate visual cue mid-step. This matches how the spec uses act covers to mark the paced/dense alternation, and supports keeping `A2.3` as a real breathing screen rather than a cosmetic one.

## 3. Progress (Airbnb)

A **thin horizontal bar at the bottom of the screen**, divided into segments equal to the number of top-level steps (3, matching the 3 intro screens), filling solid black left-to-right as steps complete. No percentage, no fraction, no step count is shown next to this bar on the main "Listing a home" flow.

However, a sibling Airbnb flow — **"Listing an Airbnb service"** (nail-art example, same design system, different product surface) — does show a small centered **"Step 5 of 6"** label at the top of each screen, alongside a persistent dark left sidebar listing every step by name with done/active/upcoming states (icons only, no labels, collapsed). This is inconsistent within Airbnb itself: the primary home-listing flow never numbers steps for the seller; the services flow does.

**This is useful evidence for the spec, not against it.** The spec's rule — "Act 1 of 4" only, never a step or field count — is stricter than Airbnb's own primary flow (which shows nothing) and stricter than Airbnb's services flow (which shows "Step X of Y"). Treat the spec's rule as a deliberate improvement on an inconsistent reference, not a contradiction.

## 4. Exit (Airbnb)

"Save & exit" is a plain top-right text link, present on every in-flow screen, paired with a "Questions?" affordance also top-right. No modal, no confirmation step, and **no reassurance copy is shown alongside it** in any captured screen — it's just the two words. This is thinner than I expected going in. Our spec doesn't actually require reassurance copy either (section 5 just says it sits below a separator, unlocked, outside the acts) — so there's no contradiction, just a correction to my own assumption: don't invent reassurance copy for Save & Exit that isn't in the spec, since the closest reference doesn't have any either.

## 5. The assembling artifact (Airbnb)

**This is the most important finding.** Airbnb's listing flow has no persistent, updating preview of the listing anywhere in its 20 screens. The closest thing is a single one-off screen after photo upload — "Ta-da! How does this look?" — showing the uploaded photos in a reorderable grid with a cover-photo badge. That's a photo-arrangement tool, not a living miniature of the listing that grows as every field is answered. The only place a "listing card" appears at all is on the **post-publish host dashboard** ("Your listing" → a static card reading "House room in Jakarta · Action required").

**There is no external precedent for the living card in this reference set.** The spec is correct that this is untested territory (section 0: "does the living card actually feel like accompaniment, or does it feel like decoration?") — Airbnb never attempted it, so the prototype is the only way to answer that question. This raises the stakes on the `photographed` transition specifically, since it's not validated by any comparable product.

## 6. Choice cards (Airbnb)

Two different choice-card moments, neither matching a 3×2 icon-above-label grid:

- **"What type of place will guests have?"** (entire place / room / shared room) — 3 full-width stacked rows, each with a title, a one-line description, and a small icon at the far right. Selected state is a black 2px border.
- **"Which of these best describes your place?"** (~20 property categories: House, Apartment, Barn, Bed & breakfast, Boat, Cabin, Camper/RV, Casa particular, Castle, Cave, Container, Cycladic home, Dammuso, Dome, Earth home, Farm, Guesthouse, Hotel, …) — a **single-column scrollable list**, one row per option, small line-icon left + label right, no subtitle, no grid. Selected state again is a black border + bold label. "Next" stays disabled until a selection is made.

**Contradiction to flag:** the spec's `E1` (six property-type cards, 3×2 grid, icon above label, 32–40px icons) does not match either Airbnb pattern. Airbnb never uses a multi-column icon-grid for this decision at any option count. Given our option count is 6 (not ~20), a 3×2 grid is still reasonable and is what the spec explicitly asks for — follow the spec. But do not look to Airbnb for the grid's visual treatment (icon size, card proportions); there is no Airbnb precedent for it. The Figma reference frames are the actual source for that layout.

## 7. Zillow specifically

Zillow **has no self-serve "publish a for-sale listing" wizard equivalent to Airbnb's.** An individual seller cannot author and publish their own for-sale listing directly on Zillow's consumer site — for-sale listings arrive via MLS/agent syndication. This matters directly for how much weight Zillow can carry as a reference for our flow, which is explicitly a DIY self-publish flow.

What Zillow does have, and what the spec's question 7 is actually asking about, is the **address-first, public-record-prefill pattern**, captured clearly:

- Homepage search bar: "Enter an address, neighborhood, city, or ZIP code" — this is the entire address-entry surface, no autocomplete map shown before submission.
- On resolving an address, Zillow immediately shows a claimed/unclaimed property card with **Zestimate, beds, baths, and sqft already populated from public records** — directly analogous to our `A1.1` prefill.
- When key facts are missing, Zillow interrupts with a **dedicated modal**: a friendly robot illustration, "We're Missing Critical Home Facts," one line of explanation ("We need your help! Add these facts to improve the accuracy of your home's Zestimate."), and a single "Edit My Home Facts" button — no inline field-level treatment at all.

**Contradiction to flag:** Zillow's answer to "prefill is incomplete" is a full-screen interrupt modal, not an inline per-field state. Our spec's `A1.1` handles this with an inline confirmation control (unconfirmed / confirmed / corrected / nothing-prefilled) sitting in the flow, not a modal. Follow the spec — the seller is mid-task in our flow, not visiting a dashboard, so an interrupt modal would break the pacing the rest of the spec is built around. But the Zillow modal is worth citing as validation that "tell the seller plainly when data is missing, with one clear action" is the right instinct, just not the right container for us.

Zillow also has a separate, real multi-step **seller questionnaire** ("Generating selling options" / valuation flow) that starts once an address and rough facts are known: single rich-list questions like "How would you describe your main bathroom?" with five photo-illustrated answer options (Fixer upper / Dated / Standard / High-end / Luxury), a thin top progress bar (no step count visible, just a filling bar — closer to our spec's restraint than Airbnb's own bottom bar), then contact-info screens ("What's your name?", "What's your phone number?" with reassurance chips "Here to help / No pressure / Opt out anytime"), ending in agent matches and a cash-offer estimate. This is a lead-qualification funnel for connecting sellers to agents or iBuyers — it never lets the seller author listing content (no photos of *their* home, no description field) — so it's a poor model for our Acts 1–3, but a good model for the tone of `A2.5` (financial/closing) and for how to phrase reassurance chips next to a sensitive field.

**On the missing dd1f0388 screen captures specifically:** converging evidence (Zillow Rental Manager's "Adding a listing" flow, 11 screens, and its numbered stepper — Property info → Rent details → Media → Amenities → Screening criteria → Costs & fees → Final details → Review → Pay & publish, each step checkmarked when done) strongly suggests the 33-screen `dd1f0388` flow is the **expanded Rental Manager capture** (a rental-listing wizard), not a for-sale FSBO wizard — because, as above, Zillow has no such thing. I'm flagging this as inference, not a direct observation, since I could not open the flow by its ID.

---

## Other property-listing flows searched

Per the spec's request to also search Redfin, Compass, Opendoor, Realtor.com: **none of these returned a dedicated listing-creation flow.** Every query aimed at Redfin or Opendoor returned Zillow flows instead (the connector's semantic matching appears to route generic "sell your home" queries to Zillow's library regardless of the named brand), which suggests Mobbin's indexed library doesn't currently carry a listing-creation capture for these apps, at least not one the search surfaced. I did not force further pagination beyond this, since the spec says to search "if the connector supports it" rather than requiring exhaustive coverage.

One incidental find worth citing even though it's not a property flow: **Etsy's "Creating a listing" flow** uses a horizontal stepper with named steps and three visual states — done (checkmark), active (filled dot), upcoming (hollow circle) — e.g. "✓ Shop preferences · ✓ Name your shop · ● Stock your shop · ○ How you'll get paid · ○ Share your billing info · ○ Your shop security." This is structurally the closest external validation of our act-scoped sidebar's three step-states (`done`/`active`/`todo`), even though it's horizontal and Etsy's product has nothing to do with real estate.

Also incidental: Airbnb's own **services-listing flow** (sibling to the home-listing flow, same design system) uses a persistent dark left sidebar with collapsed icon-only rows per step and "Save and exit" pinned at the bottom — much closer in spirit to our act-scoped sidebar than Airbnb's primary home-listing flow, which uses no sidebar at all.

---

## Summary of contradictions to carry into the build

Flagging per the spec's instruction: where spec and reference disagree, follow the spec, but state the disagreement plainly.

1. **Biggest structural contradiction:** Airbnb's actual home-listing wizard (our primary reference) uses **no persistent sidebar at all** — full-bleed screens throughout, exit top-right, thin progress bar at the bottom. Our spec mandates an act-scoped sidebar for every working screen. Follow the spec — jump-back navigation across 332 fields with 193 conditional gates needs real, resumable navigation that a 3-segment progress bar cannot provide. Airbnb's flow is linear and disposable by comparison; ours is not.
2. Airbnb's choice-card patterns (stacked full-width rows, or a single-column icon list) don't match the spec's 3×2 grid for `E1`. Follow the spec; our option count (6) makes a grid viable where Airbnb's (~20) does not.
3. Zillow's missing-data handling is a full-screen interrupt modal; our spec's inline prefill-confirmation control is lighter-weight and fits mid-flow pacing better. Follow the spec.
4. There is no external precedent — on either reference — for a persistent, incrementally-assembling listing preview during the creation flow. The living card is the one part of this design with no comparable product to check against. This raises the importance of getting the `skeleton → partial → photographed → complete` states right in the prototype, since we can't lean on a reference to validate the feel.
5. Progress communication is inconsistent even within Airbnb (no step count on the main flow, "Step X of Y" on the services flow). The spec's single rule ("Act 1 of 4," never anything else) is a deliberate tightening, not a contradiction — noted for completeness.
