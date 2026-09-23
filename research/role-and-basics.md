# Figma reference transcription — "2. property basics" & "3. contact & role"

Source: Figma file `in00irv1MhiMgmyUNkTRKX`, section "3. contact & role" (node 6647:109143) and "2. property basics" (node 6647:109142). These are flattened reference screenshots (raster images) of the real production wizard, pasted into Figma as image nodes — not live components. Transcribed verbatim from screenshots at 1600px max dimension. Left sidebar nav (visible on some screens) is a 10-step wizard: Address, Property basics, Contact & role, Home & property details, Schools and Utilities, Service Contracts, Disclosures, Financial & closing, Media (locked), Review & valuation (locked), Sign (locked), Preview.

---

## SECTION 2 — Property Basics (Step 2 of 10)

### Screen: image 27 (node 6636:108459) — main/base screen

Header eyebrow: "Property Basics"
H1: "Tell us about your property."
Subhead: "Verify and complete a few details. Most of this is pre-filled from public records."
Button: "Autofill (dev)" (dev-only helper, has a wand/sparkle icon)

**Section: PROPERTY DETAILS**
- "Property type" — dropdown, placeholder "Select a type"
- "Year built" — dropdown, placeholder "Select a year"
- "Square footage" — text/number input, placeholder "2,450"
- "Lot size" — text/number input, placeholder "3,500", with a segmented toggle to the right: "Sq Ft" / "Acre" (Sq Ft shown selected/highlighted)
  - Checkbox: "Less than .25 acre"
  - Helper text: "For condos and zero lot line, use "less than .25 acres"."

**Section: ROOMS & FEATURES**
- "Bedrooms" — stepper input (− / numeric field showing "0" / +)
- "Bathrooms" — stepper input (− / numeric field showing "0" / +)
- "Garage spaces" — stepper input (− / numeric field showing "0" / +)
- "Part of an HOA?" — two-option segmented toggle: "Yes" / "No"

Below that, a placeholder/promo card with a "NEW" badge and an icon (looks like a stack/archive icon) — content below it was cut off in the screenshot (likely a feature callout, not a form field). Flagging as unclear/not a question — possibly a "document upload" or "new feature" teaser card; exact copy not visible.

Footer buttons: "Back" (left), "Save and Continue" (right, primary/orange), "Feedback" chat bubble (bottom-right corner, appears to be a dev/QA widget not part of the real product).

Left nav shows "0 of 10 sections complete" progress bar.

### Screen: image 28 (node 6636:108462) — "Property type" dropdown expanded

Dropdown options (checkmark shown next to top item, indicating default/selected):
1. "Single-family home" (checked)
2. "Condo"
3. "Townhouse"
4. "Multi-family"
5. "Land / Lot"
6. "Other"

### Screen: image 29 (node 6636:108465) — Rooms & Features + HOA branch (HOA = Yes)

Repeats ROOMS & FEATURES fields with sample data filled in:
- "Bedrooms": 3
- "Bathrooms": 2
- "Garage spaces": 2
- "Part of an HOA?": "Yes" selected (highlighted orange)

**New section revealed when HOA = Yes: "HOME OWNERS ASSOCIATION"**
- "Name of HOA" — text input
- "Phone Number" — text input
- "Name of HOA Contact or Manager" (Optional) — text input
- "Street address" — text input, placeholder "123 Main St" (with location pin icon)
- "Street address line 2" (Optional) — text input
- "City" — text input
- "State" — dropdown, placeholder "Select a state"
- "ZIP code" — text input, placeholder "37201"

### Screen: image 30 (node 6636:108468) — HOA fields continued

- "ZIP code" — placeholder "37201" (continuation from above)
- "Association fee" — text/number input, placeholder "0"
- "Fee Frequency" — checkbox group (note: rendered as checkboxes, not radio, though logically single-select — flag as possibly should be radio):
  - "Monthly"
  - "Quarterly"
  - "Annually"
- "Association Fee Includes" — checkbox group (multi-select), two-column layout:
  - "Cable TV" / "Electricity"
  - "Exterior Maintenance" / "Gas"
  - "Grounds Maintenance" / "Insurance"
  - "Maint. On Pool/Tennis/Club" / "Sewer"
  - "Trash Pickup" / "Water"
  - "Other"
- "Association transfer fee" (Optional) — text/number input, placeholder "0"
- "Are you current with HOA dues (if applicable)?" (Optional) — radio group:
  - "Yes"
  - "No"

### Screen: image 31 (node 6636:108471) — HOA rules questions (continued)

Radio-button questions (each Yes/No unless noted):
- "Renting permitted?" — "Yes" / "No"
- "Trailers permitted?" — "Yes" / "No"
- "Pets permitted?" — "Yes" / "No" / "See Remarks" (3 options)
- "Is there a special levy?" — "Yes" / "No"

**Property Basics field summary (order as it appears):**
1. Property type (dropdown: Single-family home / Condo / Townhouse / Multi-family / Land / Lot / Other)
2. Year built (dropdown)
3. Square footage (number)
4. Lot size (number + Sq Ft/Acre toggle + "Less than .25 acre" checkbox)
5. Bedrooms (stepper)
6. Bathrooms (stepper)
7. Garage spaces (stepper)
8. Part of an HOA? (Yes/No toggle) → if Yes, reveals:
   - Name of HOA, Phone Number, Name of HOA Contact/Manager (optional), HOA mailing address (street/street2/city/state/zip)
   - Association fee, Fee Frequency (Monthly/Quarterly/Annually), Association Fee Includes (10 checkbox options + Other), Association transfer fee (optional)
   - Are you current with HOA dues? (optional, Yes/No)
   - Renting permitted? (Yes/No)
   - Trailers permitted? (Yes/No)
   - Pets permitted? (Yes/No/See Remarks)
   - Is there a special levy? (Yes/No)

No unrelated fields — this appears to be the complete Property Basics screen (no further screenshots provided beyond image 31, so anything after "special levy" was not captured; flag as possibly incomplete at the tail end since the section could continue beyond what was screenshotted).

---

## SECTION 3 — Contact & Role (Step 3 of 10)

### Screen: image 32 (node 6636:108477) — main/base screen (top portion)

Header eyebrow: "Contact & role"
H1: "Let's start with the basics"
Subhead: "Tell us where the property is, how to reach you, and your role in the sale."
Button: "Autofill (dev)"

**Section: LISTING ADDRESS**
- "Street address" — text input w/ location pin icon, placeholder "123 Main St"
- "Street address line 2" (Optional) — text input
- "City" — text input
- "State" — dropdown, placeholder "Select a state"
- "ZIP code" — text input, placeholder "37201"

**Section: YOUR ROLE**
Heading: "I am the…"
(role cards begin here — see image 33 for full list)

### Screen: image 33 (node 6636:108480) — "roles" quick picker, full list

This is the definitive list of ALL role options, each rendered as a selectable card with an icon, a bold title, and a gray description line:

1. **"Sole owner"** — icon: single person
   "I own the property by myself."
2. **"Co-owner with spouse/domestic partner"** — icon: two people
   "I own with a spouse or partner."
3. **"Attorney-in-fact (POA)"** — icon: scales of justice
   "I act under a power of attorney."
4. **"Trustee (held in a trust)"** — icon: bank/institution building
   "The property is held in a trust."
5. **"Member of an LLC"** — icon: building/office
   "The property is held by an LLC."
6. **"Assisting the homeowner"** — icon: link/chain
   "I am helping the owner complete this form."

**This is 6 role options, not 5 — "Assisting the homeowner" is an additional role beyond the 5 named in the task prompt.**

---

### ROLE: Sole owner (images 34, 35 — nodes 6636:108483, 6636:108486)

image 34 shows the role list with "Sole owner" selected (highlighted), then:

**Section: CONTACT INFORMATION**
- "First name" — text input
- "Last name" — text input
- "Phone number" — text input
- "Email address" — text input
- "Confirm email address" — text input

image 35 continues:
- "Preferred method of communication" — radio group: "Phone" / "Text" / "Email"

**Section: OCCUPANCY**
- "Do the owners live on the property?" — radio: "Yes" / "No"

**Section: PROPERTY READINESS**
- "Do you feel the property ready to be photographed?" — radio: "Yes" / "No, we need cleaning/staging" / "No, repairs are needed before listing" / "Other"

(Sole owner has no extra ownership-proof fields beyond standard contact info — this matches what was already built.)

---

### ROLE: Co-owner with spouse/domestic partner (images 36, 37, 38 — nodes 6636:108489, 6636:108492, 6641:108495)

image 36: role list with "Co-owner with spouse/domestic partner" selected, then:

**Section: HOMEOWNER #1**
- "First name", "Last name", "Phone number", "Email address", "Confirm email address"

image 37 continues:
- "Preferred method of communication" — radio: "Phone" / "Text" / "Email"

**Section: HOMEOWNER #2** (second co-owner, added automatically/by default for this role — no visible "+ Add" button in this screenshot, distinct from Attorney/LLC flows which show an explicit add-button pattern)
- "First name", "Last name", "Cell phone" (note: labeled "Cell phone" here vs "Phone number" for Homeowner #1 — inconsistent label, transcribed exactly as seen), "Email"
- "Preferred method of communication" — radio: "Phone" / "Text" / "Email"

- "Which party will be responsible for the task of scheduling showings and answering buyer questions?" (Optional) — radio: "Homeowner #1" / "Homeowner #2"

image 38 continues (shared tail, same as other roles):
**Section: OCCUPANCY**
- "Do the owners live on the property?" — radio: "Yes" / "No"

**Section: PROPERTY READINESS**
- "Do you feel the property ready to be photographed?" — radio: "Yes" / "No, we need cleaning/staging" / "No, repairs are needed before listing" / "Other"

---

### ROLE: Attorney-in-fact (POA) (images 39, 40, 41, 42 — nodes 6645:108498/108501/108504/108507)

image 39: role list with "Attorney-in-fact (POA)" selected, then:

**Section: CONTACT INFORMATION** (this is the attorney/POA-holder's own contact info — the person filling out the form)
- "First name", "Last name", "Phone number", "Email address", "Confirm email address"

image 40 continues:
- "Preferred method of communication" — radio: "Phone" / "Text" / "Email"

**Section: HOMEOWNER #1** (the actual property owner(s) the attorney represents — capitalization differs slightly: "First Name"/"Last Name" here vs "First name" elsewhere, transcribed as seen)
- "First Name", "Last Name", "Cell Phone", "Email Address"
- "Preferred method of communication" — radio: "Phone" / "Text" / "Email"
- Dashed button: **"+ Add Homeowner"** (dynamically add additional homeowner entries)

image 41 continues (shared tail):
**Section: OCCUPANCY**
- "Do the owners live on the property?" — radio: "Yes" / "No"

**Section: PROPERTY READINESS**
- "Do you feel the property ready to be photographed?" — radio: "Yes" / "No, we need cleaning/staging" / "No, repairs are needed before listing" / "Other"

image 42: shows the result of clicking "+ Add Homeowner" — a second card appears:
**Section: HOMEOWNER #2** (with an "X" close/remove icon top-right)
- "First name", "Last name", "Phone", "Email"

**Note:** No separate field was found on these screens for uploading/attaching the actual Power of Attorney document, nor a field for "principal's relationship to attorney." The only distinguishing structure vs. Sole owner is: (a) the filer's own contact info is captured first, then (b) one-or-more "Homeowner" entries (the actual title-holders) are captured via an addable repeater. It's possible POA document upload lives in a later step (e.g. "Disclosures" or "Financial & closing") not covered by this screenshot set — flagging as not found here, don't assume it doesn't exist elsewhere in the flow.

---

### ROLE: Trustee (held in a trust) (images 43, 44, 45, 46 — nodes 6645:108510/108513/108516/108519)

image 43: role list with "Trustee (held in a trust)" selected, then:

**Section: TRUST INFORMATION** (gray info callout box, educational copy — exact text below)

> "Selling a property held in a trust can be complicated, especially if the property was inherited through the trust. But still, you can do that.
>
> We want to be sure the title company is aware of the trust and handles it accordingly.
>
> **What are the Main Types of Trust?**
>
> Trust is of different types described below.
>
> 1. **A Revocable Trust** offers flexibility and control during your lifetime, allowing you to modify or cancel it if your circumstances change.
> 2. **An Irrevocable Trust** is a powerful tool to protect your assets from creditors and ensure they pass to your beneficiaries without being subject to estate tax.
> 3. **A Living Trust** is a flexible and popular estate planning tool that allows you to transfer your assets to your beneficiaries while avoiding probate.
> 4. **A Testamentary Trust** is created through your Will and takes effect after your death. It allows you to provide for your beneficiaries while ensuring that your assets are managed according to your wishes."

This is purely informational copy (no input controls in this block) — 4 trust types listed as an educational aid, not a question the user answers.

image 44 continues:
- "Name of the Trust" — text input

**Section: CONTACT INFORMATION**
- "First name", "Last name", "Phone number", "Email address", "Confirm email address"
- "Preferred method of communication" — radio: "Phone" / "Text" / "Email"

image 45 continues:
**Section: HOMEOWNER #1** (i.e., the trustee(s)/beneficiary contact(s) tied to the trust)
- "First Name", "Last Name", "Cell Phone", "Email Address"
- "Preferred method of communication" — radio: "Phone" / "Text" / "Email"

**HOMEOWNER #2** (shown already added, with "X" remove icon)
- "First name", "Last name", "Phone", "Email"

image 46 continues (shared tail):
- "Which party will be responsible for the task of scheduling showings and answering buyer questions?" (Optional) — radio: "Homeowner #1" (only one option visible in this screenshot; likely also includes "Homeowner #2" per the co-owner pattern, but only "Homeowner #1" was visible in frame)

**Section: OCCUPANCY**
- "Do the owners live on the property?" — radio: "Yes" / "No"

**Section: PROPERTY READINESS**
- "Do you feel the property ready to be photographed?" — radio: "Yes" / "No, we need cleaning/staging" / "No, repairs are needed before listing" / "Other"

**Trustee-specific extra field: "Name of the Trust" (text input), plus the educational trust-types callout.** No explicit "trustee certificate/documentation upload" field found on these screens.

---

### ROLE: Member of an LLC (images 47, 48, 49, 50 — nodes 6645:108522/108525/108528/108531)

image 47: role list with "Member of an LLC" selected, then:

**Section: LLC INFORMATION** (gray info callout box, exact text below)

> "**When a property is owned by an LLC**, it means that the business is holding the title to the property. While the sale isn't too different from a traditional owner sale, there are quite a few documents that will be requested by title in the transaction.
>
> It is important to know the documents that will need to be collected for clearing the title.
>
> Please be prepared, the Title Company will request the following documents:
>
> - a copy of the Operating Agreement
> - a copy of the Articles of Organization (signing Authorization)
> - the EIN # for the LLC
> - a Proceeds Disbursement Authorization
>
> The title company will also need to verify that the LLC is in good standing with the state.
>
> When writing the contract of sale, be sure to have the seller as the name of the LLC and the signatures to be "*Name of LLC by Name of Signer*" and their member status. For example, *Tennessee LLC by Rick Marino, Member.*"

(Note: bullet list item 2 in the source shows "Articles of Organization (signing Authorization)" with lowercase "signing" — transcribed exactly as seen, may be a source typo for "Signing Authorization.")

This is informational only (no inputs in this block) — lists 4 documents the title company will require: Operating Agreement, Articles of Organization, EIN #, Proceeds Disbursement Authorization.

image 48 continues:
- "Legal name of the LLC" — text input
- "Street address" — text input w/ pin icon, placeholder "123 Main St"
- "Street address line 2" (Optional) — text input
- "City" — text input
- "State" — dropdown, placeholder "Select a state"
- "ZIP code" — text input, placeholder "37201"
- "Please list the contact info for each member of the LLC that is required to sign" (Optional) — multi-line textarea
- "Who is the Primary Contact for the LLC?" — radio: "I am the Primary Contact" / "Other"

image 49 continues:
**Section: CONTACT INFORMATION**
- "First name", "Last name", "Phone number", "Email address", "Confirm email address"
- "Preferred method of communication" — radio: "Phone" / "Text" / "Email"

**Section: HOMEOWNER #1**
- "First Name", "Last Name", "Cell Phone", "Email Address"

image 50 continues:
- "Preferred method of communication" — radio: "Phone" / "Text" / "Email"
- Dashed button: **"+ Add Homeowner"**
- "Which party will be responsible for the task of scheduling showings and answering buyer questions?" (Optional) — radio: "Homeowner #1"

**Section: OCCUPANCY**
- "Do the owners live on the property?" — radio: "Yes" / "No"

**Section: PROPERTY READINESS**
- "Do you feel the property ready to be photographed?" — radio: "Yes" / "No, we need cleaning/staging" / "No, repairs are needed before listing" / "Other"

**LLC-specific extra fields:** LLC info callout (4 required docs listed), Legal name of the LLC, LLC's mailing address (street/street2/city/state/zip), "list the contact info for each member required to sign" (optional textarea), "Who is the Primary Contact for the LLC?" (I am the Primary Contact / Other), plus the filer's own Contact Information, plus one-or-more Homeowner entries (the LLC members/title holders) via the same addable repeater pattern as Attorney and Trustee.

---

### ROLE: "Assisting the homeowner" — NOT CAPTURED

No screenshot nodes were provided for this 6th role option's detail screen(s). It appears in the picker list (image 33) with description "I am helping the owner complete this form." but its follow-up fields were not part of the requested node set. **Flag: needs its own screenshot pass** if a full implementation is required — likely captures the assistant's own contact info plus the actual homeowner's contact info (proxy pattern similar to Attorney/Trustee/LLC), but this is a guess, not confirmed from source.

---

## Cross-role structural pattern (as transcribed, not inferred)

Every role screen shares this tail, in this order:
1. Role picker (6 cards, same list every time, selected card highlighted)
2. Role-specific info/education callout (Trust and LLC only — Sole owner, Co-owner, Attorney show none)
3. Role-specific entity field(s) (Trust name; LLC legal name + address + member list + primary contact radio) — Sole owner and Co-owner have none; Attorney has none beyond the homeowner repeater
4. "CONTACT INFORMATION" for the filer (First/Last name, Phone, Email, Confirm email, Preferred method of communication) — present for Sole owner, Attorney, Trustee, LLC. Co-owner instead leads directly with "HOMEOWNER #1" (i.e., co-owner IS one of the homeowners, no separate "filer vs. owner" split)
5. "HOMEOWNER #1" (and optionally #2+ via "+ Add Homeowner") for Co-owner, Attorney, Trustee, LLC — represents the actual title-holder(s) being represented. Sole owner has no separate Homeowner block (the filer IS the homeowner).
6. "Which party will be responsible for the task of scheduling showings and answering buyer questions?" (Optional, radio of Homeowner #1/#2) — present for Co-owner, Trustee, LLC (not clearly seen for Attorney but likely present, screen may have been cut off — flag as unconfirmed for Attorney)
7. OCCUPANCY: "Do the owners live on the property?" (Yes/No) — present on all roles reviewed
8. PROPERTY READINESS: "Do you feel the property ready to be photographed?" (Yes / No, we need cleaning/staging / No, repairs are needed before listing / Other) — present on all roles reviewed

## Ambiguities / things to double check against the live Figma file (not guessed, flagged)
- The "NEW" badge card at the bottom of the Property Basics main screen (image 27) is cut off — content/copy unknown.
- Property Basics screen may continue past "Is there a special levy?" — no further screenshots were captured beyond image 31.
- "Fee Frequency" renders as checkboxes (square) but is logically single-select (Monthly/Quarterly/Annually) — likely should be radio buttons; flagging the discrepancy rather than assuming.
- Label casing inconsistency: "First name" vs "First Name", "Phone number" vs "Cell Phone" vs "Cell phone" vs "Phone" — appears inconsistent in the source designs themselves across Homeowner vs Contact Information blocks. Transcribed exactly as seen per screen.
- Attorney-in-fact: no document-upload field for the POA instrument was found in this section; may exist in Disclosures or Financial & closing steps (out of scope for this transcription).
- Trustee: no document-upload field for trust certification was found in this section either.
- "Assisting the homeowner" role's dedicated fields were not captured at all (no node IDs were provided for it) — needs a follow-up Figma pull.
- Co-owner's Homeowner #2 block has no visible "+ Add Homeowner" affordance (unlike Attorney/Trustee/LLC) — suggests Co-owner may be hardcoded to exactly 2 homeowners rather than an arbitrary repeater. Not fully confirmed since no "remove" affordance was visible either in the co-owner screenshots (unlike image 42/45 which show an "X" on Homeowner #2).
