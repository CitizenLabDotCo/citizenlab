# Start here

The design workbench is the library, its tokens and the real platform in one place. You change the look in it or through Claude Code; the code is the only truth, and every change goes to a developer as a small pull request.

## Once

1. Node 24.14 or later (`nvm install 24`).
2. The code:
   ```
   git clone https://github.com/CitizenLabDotCo/citizenlab.git
   cd citizenlab
   git switch design-system/workbench
   cd front
   npm ci
   ```
3. The MCP servers for Claude Code (with the workbench running, see below):
   ```
   claude mcp add --transport http --scope user storybook http://localhost:6006/mcp
   claude mcp add --transport http --scope user figma https://mcp.figma.com/mcp
   ```
   In Claude Code, `/mcp`, pick figma, log in.

## Every day

In `front/`:

```
NODE_OPTIONS=--max-old-space-size=4096 API_URL=https://uxusertesting.govocal.com npm run ds:local
```

Then open:

- `http://localhost:3000/storybook/workbench/`: the workbench.
- `http://localhost:3000/`: the platform, on the test platform's data. Log in once with your test admin account.

Start `claude` in a second terminal, also in `front/`, so it finds the skills (`heal`, `lift`, `story`, `new-component`, `audit`, `a11y-review`, `propose`).

Only the test platform, never a customer's.

## Change something

- **A token** (a colour, a space, a radius): open it under Foundations, or on a component's Design tab, and edit it. Then Changes, Save to code. Every screen that uses it repaints.
- **A value in a component**: on its Design tab, click the element in the canvas and pick the token for a value that has none. Then Changes, Save to code.
- **Anything on a real page**: Inspect tab, click the element, say what should change, Hand to my agent. Paste the prompt it shows into Claude Code. Its edit repaints the page in a second.

Every saved edit lists under Saved, not pushed, with Undo. Push sends them: token edits to the current branch, component edits each to their own small branch off master. Then the PR's own epic shows it on its Review tab: how many changes the PR carries and, for each, before and after and the pages it reaches.

## The boundaries

- Style only: values, tokens, spacing, swapping homemade markup for a library component. Never data, handlers, routing or copy.
- Admin first. Resident-facing pages wait for an accessibility review.
- Small commits, one component at a time, each marked AI-assisted, so a developer can review each one.
- Say "checked by axe" or "keyboard tested", never "compliant".
- Branches start with `design-system/`. Nothing goes to master without a developer's review.

For agents: `.storybook/AGENTS.md` explains every command and file.
