# Sprint 3 Puzzle App: Taxonomy and Design Checklist

How to use: change `[ ]` to `[x]` for each item you accept. Write a change next to any item you reject.
Items are numbered 1 to 82 across the whole file.
Visual facts about the reference games come from a Gemini web search (Wikipedia pages). Colors and rules for our app are my proposals.

## Part A. Taxonomy (20 puzzle types, 4 classes)

Space: you place or move things on a board.
- [ ] 1. Traffic jam (Klotski boards as extra levels)
- [ ] 2. Golf tee (other board shapes as extra levels)
- [ ] 3. Build-the-square/pyramid
- [ ] 4. Sokoban (redesigned for more fun)
- [ ] 5. Pentomino square (parts already placed, always a 5x5 square)

Quantity: you judge amounts, numbers, or odds.
- [ ] 6. Bag-draw (keeps its luck; called a skill game)
- [ ] 7. Knapsack (redesigned for more fun)
- [ ] 8. Resource allocation board
- [ ] 9. Balance/scale puzzles
- [ ] 10. Shape-Sudoku (weak fit; Space also works)

Direction: you aim, route, or steer.
- [ ] 11. Mirrors and laser
- [ ] 12. Monument Valley-type (path through impossible 3D)
- [ ] 13. Network/flow
- [ ] 14. Lemmings-type (the style may not fit)

Sequence: the order of steps is the puzzle.
- [ ] 15. Into the Breach (our version)
- [ ] 16. Lights Out
- [ ] 17. Tower of Hanoi
- [ ] 18. Tower-fall (you know the waves beforehand; dramatic redesign)
- [ ] 19. Matrix reasoning
- [ ] 20. Domino logic

Open taxonomy questions:
- [ ] 21. Lemmings-type stays in Direction (alternative: Sequence).
- [ ] 22. Shape-Sudoku stays in Quantity (alternative: Space).
- [ ] 23. Pure pattern games (matrix, domino) stay in Sequence. If you add many more, make a fifth class.
- [ ] 24. Classes are visual themes, not unlock order. Daily unlock picks a puzzle type from any class.

## Part B. Shared "flow" layer (all four classes)

References: Alto's Adventure and Odyssey, Monument Valley, Journey, Gris, Mini Metro, Gorogoa.
Facts from the references: no fail screens, deep parallax, generous easing, ambient music, soft drifting particles, almost no interface.

- [ ] 25. No fail screen. A bad result shows fewer stars and a "try again" fade, never a red "You lose".
- [ ] 26. Every move eases: cubic-out, 250 to 400 ms. Nothing snaps without motion.
- [ ] 27. Backgrounds have 3 parallax layers that drift slowly, even when you do nothing.
- [ ] 28. Soft particles (motes, petals, dust) float in each class, in that class's palette.
- [ ] 29. Interface is hidden during play. Only three icons remain: undo, reset, tries/stars. They fade to 30 percent when idle.
- [ ] 30. Every move plays one note from a scale for that class. A solved puzzle plays a short chord. (Mini Metro, Tetris Effect, Dots do this.)
- [ ] 31. Each class has one looping ambient track. No track has words.
- [ ] 32. Level changes use a camera move (zoom or slide), not a menu. (Gorogoa, Monument Valley.)
- [ ] 33. Day unlock moment: the new puzzle type grows into the home screen like a flower opening. One animation, under 3 seconds.
- [ ] 34. Rating uses 3 stars based on tries or moves versus the best known score. The freeze item shows as a small ice-crystal icon.
- [ ] 35. Colors never carry meaning alone. Every important color also has a shape or pattern (for color-blind players).
- [ ] 36. Phone first: portrait, one-thumb reach, nothing important in the top 15 percent of the screen.

## Part C. The four class designs

### Space: cartoon, fun, warm colors
References: Snakebird, Patrick's Parabox, Cut the Rope, Unpacking, A Good Snowman Is Hard to Build, Donut County, Bad Piggies, Hidden Folks.
- [ ] 37. Palette: cream #FFF3E0, apricot #FFB26B, tomato #F4623A, honey #FFC857, leaf #6BBF59, sky #7FC8F8, outline brown #4A2C2A.
- [ ] 38. Shapes: chunky, rounded, 12 to 24 px corners. Thick 3 px outlines. Pieces have small faces or eyes (Patrick's Parabox, Cut the Rope).
- [ ] 39. Texture: flat color with a soft cardboard or paper-grain background. Glossy highlight on pieces.
- [ ] 40. Camera: top-down or side, orthographic, flat. No 3D.
- [ ] 41. Motion: squash and stretch on every move. Pieces land with a small bounce. Grid snaps feel "thumpy" (Patrick's Parabox).
- [ ] 42. Sound: marimba, ukulele, pizzicato strings. Soft wooden clicks on slides.
- [ ] 43. Buttons: wooden or chalkboard style, big and rounded (Snakebird, Cut the Rope).

Space puzzle notes:
- [ ] 44. Traffic jam: cars have faces; the exit is a sunny gate. Cars hum when they slide.
- [ ] 45. Golf tee: tees on a wooden board; jumped tees pop into a little basket with a "pock" sound.
- [ ] 46. Build-the-square/pyramid: shapes are fruit-colored; completing it makes the shapes hug.
- [ ] 47. Sokoban: the player is a small round character pushing crates (Snowman Is Hard to Build). Redesign idea: crates are snowballs or cakes that change as you push them.
- [ ] 48. Pentomino 5x5: pieces are cookie shapes in warm colors. Placed pieces are fixed with a darker outline.

### Quantity: sleek, minimalist, cool colors
References: Mini Metro, Mini Motorways, Two Dots, Dots, Threes, 2048, Hexcells.
- [ ] 49. Palette: base #F2F6FA, ink #1B2A3A, slate #5B7083, teal #2EC4B6, cyan #4CC9F0, periwinkle #7B8CDE, one alert accent #E5446D (use only for limits).
- [ ] 50. Shapes: circles, squares, thin lines at 45 and 90 degrees. No outlines. Soft shadows only.
- [ ] 51. Type: one clean sans-serif (Inter), thin weight, tabular numbers. Numbers are the main graphics.
- [ ] 52. Camera: flat top-down, orthographic.
- [ ] 53. Motion: smooth, linear glides and quiet fades. Values count up like an odometer.
- [ ] 54. Sound: generative chimes. Pitch rises as the total rises (Dots). Quiet.
- [ ] 55. A dark-navy night mode with the same hues.

Quantity puzzle notes:
- [ ] 56. Bag-draw: tiles are circles in a clear glass bag; the draw odds show as a thin bar above the bag.
- [ ] 57. Knapsack: items are circles with a weight number and a value number; the bag is a thin outlined rectangle that fills like water. Redesign idea: a hot-air balloon that rises as value grows and sinks as weight grows.
- [ ] 58. Resource allocation: coins slide between columns; each column shows a thin return/risk line chart.
- [ ] 59. Balance/scale: a thin-line balance beam; shapes carry numbers; the beam tilts smoothly.
- [ ] 60. Shape-Sudoku: a thin-line grid with six clean shapes (circle, square, triangle, and so on).

### Direction: 3D design
(Your note was cut off after "3D design,". I assume isometric 3D in the style of Monument Valley and Captain Toad dioramas. Edit if wrong.)
References: Monument Valley, Fez, Captain Toad, Donut County, Stephen's Sausage Roll, Manifold Garden.
- [ ] 61. Camera: fixed isometric view; the player can drag to rotate the whole level in 90 degree steps (Fez, Captain Toad).
- [ ] 62. Palette: peach #FFB8A0, turquoise #3FB8AF, dusty pink #E8A0BF, indigo #2B2D5B, mint #A8E6CF. Soft gradients.
- [ ] 63. Shapes: low-poly, flat-shaded blocks and arches. One light source with a soft gradient.
- [ ] 64. Motion: parts of the level rotate and fold on drag (Monument Valley). The player glides along paths.
- [ ] 65. Sound: vibraphone, music-box, soft wind. Each rotation plays a note.
- [ ] 66. Build note: the web game uses a 3D library with an orthographic camera. This is the heaviest class to build. It decides the tech choice for the whole app.

Direction puzzle notes:
- [ ] 67. Mirrors and laser: a beam of warm light crosses a floating isometric room; mirrors are glass cubes you rotate.
- [ ] 68. Monument Valley-type: build our own impossible architecture; a small traveler walks the path. (Use a new look; do not copy the original art.)
- [ ] 69. Network/flow: pipes or light channels on a floating platform; flow is a glowing line.
- [ ] 70. Lemmings-type: little creatures walk a 3D diorama; you give each creature one tool. Redesign if the style does not fit: one creature, many tools, as in Chip's Challenge.

### Sequence: spongey and blueprint
References: Opus Magnum, Poly Bridge, World of Goo, LocoRoco, Kirby's Epic Yarn, Yoshi's Woolly World, Besiege.
- [ ] 71. World: blueprint paper. Background deep blue #0B3C5D, grid lines #1D6FA5, white drafting lines #EAF6FF. Numerals and tick marks only (no words).
- [ ] 72. Pieces: soft jelly or felt shapes in bright colors: jelly pink #FF8FB1, lime #B6E36B, butter #FFE066. Glossy highlight. They wobble.
- [ ] 73. Motion: spring easing with overshoot (squish and settle). The blueprint lines stay crisp while the jelly moves.
- [ ] 74. A "step tape" along the bottom shows the order of steps as small numbered ticks (Opus Magnum's timeline). It doubles as the undo history.
- [ ] 75. Sound: soft clicks, rubbery boings, gentle clockwork. Calm strings underneath.

Sequence puzzle notes:
- [ ] 76. Into the Breach: enemy intents drawn as blueprint arrows; units are jelly figures. Show the next turn in advance.
- [ ] 77. Lights Out: a drafting grid of jelly bulbs; pressing one wobbles its neighbors.
- [ ] 78. Tower of Hanoi: jelly discs on blueprint pegs; the step tape counts moves against the minimum.
- [ ] 79. Tower-fall: waves are drawn on the step tape before you start; towers are jelly blocks you place in time order.
- [ ] 80. Matrix reasoning: grid cells with jelly shapes; the empty cell is a dotted blueprint box.
- [ ] 81. Domino logic: domino halves with dots; the missing half is outlined.

## Part D. Decisions I need before the build

- [ ] 82. Tech: one web app on a phone browser (with a 3D library for Direction). Say yes or change.
