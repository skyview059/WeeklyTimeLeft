# Weekwise

[Open the live app](https://skyview059.github.io/WeeklyTimeLeft/) · [Source code](https://github.com/skyview059/WeeklyTimeLeft)

A small, open-source weekly AI quota planner for Codex and Claude. Compare **quota remaining / time remaining**, see your weekly timeline, and keep manual usage check-ins. No backend, account, API key, or build step.

## Use locally

Open `index.html` in a modern browser, or run `python -m http.server 8080` in this folder and visit http://localhost:8080. Using a local server gives a consistent browser-storage origin.

1. Choose Codex or Claude and open **Week settings**.
2. Enter the date and time your weekly window starts, in your browser's local timezone. If you know the reset date instead, enter seven days before it.
3. Enter either a percentage **remaining** or your weekly token limit and remaining tokens. If a provider shows 43% **used**, enter 57% remaining.
4. Update usage after work sessions. Each provider has separate settings and readings.

The clock updates every 15 seconds. Weeks are fixed 168-hour windows anchored to your selected instant, so a daylight-saving transition may shift the displayed local reset hour. Future windows show a full week and no pacing ratio until they begin. When a window rolls over, quota is unknown until you enter a new reading.

**Ratio:** remaining quota percentage divided by remaining time percentage. A ratio of 1 is balanced; below 1 means quota was consumed faster than time. Daily allowance divides remaining quota by fractional days remaining; under one day, it is a 24-hour equivalent rate, not extra quota.

## Privacy and limitations

Usage is manual and is not read from provider accounts. A percentage does not imply a fixed number of tokens; token mode is only useful when you know a meaningful limit. Readings can become stale between updates.

Settings and the latest 100 readings per provider stay in this browser's `localStorage`; the latest five appear in the timeline. Visitors do not share data, and there is no cross-device sync. Browser-data clearing removes your history. Changing a provider's start, quota mode, or token limit starts a fresh history. Local-file and hosted versions use separate storage. Google Fonts is the only external request; system fonts work offline. Remove the CSS `@import` for fully offline assets.

## Publish on GitHub Pages

1. Create a **public** repository named `WeeklyTimeLeft` (or your preferred name).
2. Upload this folder's files, keeping `index.html` at the repository root.
3. In **Settings → Pages → Build and deployment**, select **Deploy from a branch**, then **main** and **/ (root)**; save.
4. GitHub provides the live URL, usually `https://YOUR-USERNAME.github.io/WeeklyTimeLeft/`.

All asset paths are relative, so project Pages URLs work. `.nojekyll` disables Jekyll processing. No secrets or generated build are needed. If publishing from a shell after authenticating GitHub CLI:

```sh
git init -b main
git add index.html styles.css app.js logic.js tests README.md LICENSE .nojekyll .gitignore
git commit -m "Build Weekwise weekly quota tracker"
gh repo create WeeklyTimeLeft --public --source=. --remote=origin --push
```

Then enable Pages as described above. Anyone can view and use the hosted page, fork the repository, modify their copy under the MIT license, and propose changes via pull requests. Public visibility does not grant strangers direct write access to your repository.

## Develop and test

- `index.html`: structure and accessible settings dialog
- `styles.css`: responsive dark dashboard
- `logic.js`: weekly window and quota calculations
- `app.js`: rendering, settings, and browser persistence
- `node --test tests/logic.test.cjs`: boundary and input-validation tests

No dependency installation is required. Contributions are welcome through forks and pull requests.

## License

MIT — see [LICENSE](LICENSE). Independent project; not affiliated with OpenAI or Anthropic.

