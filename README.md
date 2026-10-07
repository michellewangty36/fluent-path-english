# Fluent Path English

A free English course from A1 to C2. It covers grammar, vocabulary, reading, listening, writing, speaking, presenting, daily conversation, business English and IELTS/Cambridge practice, with tap-to-translate into Chinese.

The course is locked with an access code. `index.html` holds only encrypted content (AES-GCM, key derived from the code with PBKDF2), so the lessons can't be read without the code. To change the code, rebuild `index.html` with the new code and push it. Everyone then needs the new code.

The Chinese dictionary is a subset of [ECDICT](https://github.com/skywind3000/ECDICT) (MIT licence).

## Change the access code yourself

One-time setup: under **Settings → Secrets and variables → Actions**, add two repository secrets:
- `SOURCE_KEY`: the key that unlocks the course source (`src.enc`). Keep it private.
- `ACCESS_CODE`: the code your learners type.

To change the code at any time:
1. **Settings → Secrets and variables → Actions** → edit `ACCESS_CODE` → type the new code → **Update secret**.
2. **Actions → Change access code → Run workflow**.

About two minutes later the site uses the new code, and the old code stops working.

## Files
- `index.html`: the published, code-locked course.
- `src.enc`: the course source, encrypted with `SOURCE_KEY`.
- `tools/build.mjs`: locks the course with an access code. `tools/seal.mjs`: encrypts and decrypts `src.enc`.
