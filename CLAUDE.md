# CLAUDE.md

Loaded at the start of every Claude Code session in this repo. Keep it current. It should let
a brand new session act like a colleague who already knows what you are working on and why.

## What I am building

- **What it is:** A daily puzzle web app for phones: a new puzzle type each day, 20 types in 4 classes (Space, Quantity, Direction, Sequence), each class with its own look.
- **Who it is for:** First the owner, then one invited friend. Wants to feel stimulated and get better at geometric, algebraic, and investment logic.
- **My role:** solo builder (product owner); Claude Code builds.
- **Why they would use it:** a new kind of puzzle every day that makes them sharper at decisions.

## Current state

- **This sprint's goal:** Sprint 3 (sprints/sprint-3-plan.md): 30 puzzles, playable, and a working, beautiful UI. Done: playable each day without breaking, and one other person has joined.
- **Live at:** [URL]
- **Biggest open risk:** [the thing most likely to make this fail]

## How this repo works

- Non-code work is committed as files, same as code. Interviews, experiments, pricing models,
  and usability findings all live here.
- Specs go in `specs/` and are written before building. When asked to build something
  non-trivial, check for its spec first. If there is none, draft one and confirm it before
  writing code.
- Meaningful choices get a numbered record in `decisions/`, written when the choice is made,
  including what was rejected and why.
- Sprint plans and reviews live in `sprints/`. The plan is committed on day one.
- Never put real names, emails, or phone numbers in this repo. Anonymize.

## Stack and conventions

- **Stack:** phone-first web app, static HTML/CSS/JS in `product/`, no build step. Game rules in plain ES modules (`product/logic/`, see specs/001). Direction class may need a 3D library (open decision). Tests: `node --test`.
- **Deploy:** [how a push becomes live]
- **Testing and style:** [fill in as they emerge]

## Working with me

- Ask before large refactors or before adding a dependency.
- When I am wrong about something technical, say so directly and explain why.
- Show me the plan before executing anything that touches more than a couple of files.

## Voice

Copy that users read sounds like: [2 or 3 adjectives, plus one example line]
