# MAA Union – ID Card Registration (Google Apps Script)

Photographers & Videographers Welfare Association – member details + ID card photo collection web app.

## Files
| File | Purpose |
|---|---|
| `Code.gs` | Server code (Google Sheet + Drive photo save, Excel export) |
| `Index.html` | Web page (form, member list, edit, photo download) |
| `appsscript.json` | Apps Script manifest (for `clasp`) |
| `MAA_Members_Template.xlsx` | Blank Excel template (columns + blood group dropdown) |

## Note
GitHub Pages **cannot run** this app, because it needs Google Apps Script (`google.script.run`).
GitHub is only used to store the code. The app runs from the Apps Script **/exec** link.

## Setup (Telugu / English)
1. Google Sheet తెరవండి → **Extensions → Apps Script**.
2. `Code.gs` లో కోడ్ పేస్ట్ చేయండి; `FOLDER_ID` ను మీ Drive ఫోల్డర్ ID తో మార్చండి (ఫోల్డర్ లో మీ ఖాతాకు **Editor** access ఉండాలి).
3. **+ → HTML** → పేరు `Index` → `Index.html` కోడ్ పేస్ట్ చేయండి.
4. Function `testSetup` ను **Run** చేసి అనుమతులు ఇవ్వండి.
5. **Deploy → New deployment → Web app** → Execute as: **Me**, Who has access: **Anyone**.
6. కోడ్ మార్చినప్పుడు: **Deploy → Manage deployments → ✏️ → New version → Deploy**.
7. సభ్యులకు `/exec` లింక్ మాత్రమే షేర్ చేయండి (డౌన్లోడ్ చేసిన `Index.html` ను నేరుగా తెరవవద్దు).

## Optional: clasp
```
npm i -g @google/clasp
clasp login
clasp create --type webapp --title "MAA ID"   # or: clasp clone <scriptId>
clasp push
```
