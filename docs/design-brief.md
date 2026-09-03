# AsciiEye design brief

Original landing-page prompt. This is the product spec, not runtime code.
Visual concept: [`ASCIIEYE-DESIGN.png`](./ASCIIEYE-DESIGN.png).

---

FRONTEND BUILD PROMPT — REACTIVE TERMINAL EYE LANDING PAGE

Build a complete responsive landing page for a personal website.

The page should feel like a forgotten early-2000s console interface crossed with a terminal, Y2K digital-punk design, Lain-esque cyberspace, and subtle cyber-occult imagery.

Do not make it look like a normal portfolio homepage.

The centerpiece should feel like an uncaring digital entity that has become aware of the visitor.

The implementation should prioritize:

atmosphere
responsiveness
lightweight rendering
accessibility
graceful degradation
clean maintainable HTML/CSS/JavaScript

Avoid large frameworks unless genuinely necessary. Plain HTML/CSS/JS is preferred.

1. LANDING PAGE STRUCTURE

The page fills the entire viewport.

There is:

no visible site title
no tagline
no instructions
no ambient SYSTEM ONLINE, USER: GUEST, etc. text yet
no sound

The primary visual element is a large ASCII/pseudo-ASCII eye positioned approximately:

X: 50%
Y: 43–45%

It should therefore sit slightly above the exact vertical center.

Around the eye is a semi-structured radial navigation containing:

ABOUT
PROJECTS
BLOG
MUSIC
GREETINGS
PHOTOGRAPHY

Use real semantic <a> elements.

Suggested destinations:

/about/
/projects/
/blog/
/music/
/greetings/
/photography/

Create simple placeholder pages for each destination containing only something similar to:

THIS IS LIVE
2. VISUAL DIRECTION

The overall page should feel:

cold
watchful
ominous
minimal
digital
unfriendly
slightly mischievous

It should NOT feel:

cute
playful
neon-gamer
generic cyberpunk
Matrix-themed
heavy CRT
retro arcade
overly noisy

Use a nearly black background.

Prefer extremely subtle background texture/noise rather than obvious CRT scanlines.

The interface should be visually sparse when nothing is happening.

Instability should primarily appear during:

interaction
gaze changes
idle events
transitions

Think:

minimal structure + brief moments where the machine appears unstable.

3. TERMINAL EYE

Use the supplied visual concept as inspiration.

The eye should look like it was assembled from:

.
:
|
-
+
<
>
0
1
letters
small glyph fragments

It should resemble ASCII art without necessarily being a literal fixed-width ASCII drawing.

The eye can contain:

changing glyph density
broken rows
hanging digital fragments
tiny desynchronization
slight asymmetry
corrupted characters

Avoid making it anatomically realistic.

It should look more like a signal that happens to resemble an eye.

4. EYE COLOR

When nothing is selected, the eye should use a neutral muted off-gold.

Start around:

--eye-default: #C9B77A;

Experiment within this family if necessary.

It should look:

aged
dry
slightly sickly
subdued

Do NOT make it bright metallic gold.

5. SECTION ACCENT COLORS

Each navigation item has an associated accent.

Suggested starting palette:

ABOUT        #00F7FF
PROJECTS     #39FF94
BLOG         #CFFF4D
MUSIC        #FF48FF
GREETINGS    #A259FF
PHOTOGRAPHY  #4DA2FF

These colors should only affect selected/highlighted portions of the interface.

Do not recolor the entire screen.

When an item becomes active:

menu text changes accent
portions of the eye adopt the accent
subtle surrounding glyphs may inherit the accent
glow may shift slightly

The default off-gold should remain visible somewhere in the eye if visually appropriate.

6. RADIAL NAVIGATION

Do NOT use a perfectly symmetrical six-spoke wheel.

Use a semi-structured radial arrangement.

Suggested approximate composition:

                 ABOUT

     GREETINGS            PROJECTS


             [ EYE ]             BLOG


     PHOTOGRAPHY          MUSIC

This is conceptual, not a strict grid.

The placement should feel balanced but slightly irregular.

Menu items can shift slightly vertically/horizontally to make the layout feel composed rather than mathematically generated.

7. MENU VISUAL STYLE

Navigation labels are always visible.

Use:

ALL CAPS

Possible visual treatment:

> ABOUT
> PROJECTS
> BLOG

Keep framing minimal.

Avoid giant boxes or glossy buttons.

A menu item can contain:

label
tiny terminal marker
faint underline
small bracket
subtle glitch fragments

But readability comes first.

8. TYPOGRAPHY

Use a monospace terminal-style font.

Prioritize compatibility across:

Chromium
Firefox
Safari
Android
iOS

A sensible primary choice is:

IBM Plex Mono

with a robust fallback stack similar to:

font-family:
    "IBM Plex Mono",
    "Cascadia Mono",
    "SFMono-Regular",
    "Roboto Mono",
    "Menlo",
    "Monaco",
    monospace;

Typography can be manipulated using:

uppercase
tracking
line height
subtle glow
occasional corruption

rather than relying on an unreadable novelty font.

9. DESKTOP INTERACTION

Desktop interaction uses:

HOVER -> PREVIEW
CLICK -> ENTER

When the pointer enters a navigation item:

determine the selected menu node
immediately change its accent color
make the eye snap its gaze toward that node
trigger a very brief glitch/distortion event
settle into the new gaze position

The eye MUST NOT continuously follow the mouse.

Do not track raw cursor position.

The eye only cares about discrete menu targets.

This is important.

The behavior should feel like:

idle
...
PROJECTS hovered
SNAP
eye watches PROJECTS

rather than:

eye constantly chases cursor
10. GAZE MOTION

Eye movement should be sharp.

Potential sequence:

0ms     target changes
0–70ms  rapid pupil/glyph displacement
70ms    tiny overshoot
100ms   correction
140ms   still

Exact timings can be tuned.

Small one-frame/two-frame glitches are encouraged.

Do not make it excessively smooth.

The movement should communicate:

It noticed you.

Not:

Look at this fun interactive eye!

11. MOBILE INTERACTION

Mobile has no hover.

Use:

FIRST TAP  -> SELECT
SECOND TAP -> NAVIGATE

Example:

User taps MUSIC.

The page should:

prevent navigation
activate MUSIC
change its color
snap the eye toward MUSIC
visually indicate that MUSIC is selected

If the user taps MUSIC again:

trigger the page transition
navigate to /music/

If the user instead taps PROJECTS:

MUSIC is deselected
PROJECTS becomes selected
eye snaps toward PROJECTS
12. MOBILE LAYOUT

Do not rigidly preserve desktop coordinates.

On narrower screens, convert the radial menu into a looser orbital/ring arrangement around the eye.

Prioritize:

readable labels
sufficiently large touch targets
no overlapping items
eye remains visually dominant
overall radial/orbital identity remains recognizable

It is acceptable for the mobile layout to become less symmetrical.

Do not simply scale the entire desktop UI down.

13. KEYBOARD NAVIGATION

The menu must remain keyboard-accessible.

Tab should move naturally between menu links.

When a link receives keyboard focus:

treat it like desktop hover
eye snaps toward the focused item
section color activates

Enter should navigate using the same visual transition.

Use proper :focus-visible states.

Do not remove focus indicators.

Stylize them to match the interface.

14. INITIAL PAGE OPENING

On initial page load, create a short awakening animation.

Sequence:

BLACK
  ↓
very faint horizontal line
  ↓
line becomes visible
  ↓
line separates / opens
  ↓
ASCII fragments appear
  ↓
eye reconstructs itself
  ↓
menu fades into visibility
  ↓
IDLE STATE

The opening should resemble an eye opening from a void.

Target total duration:

~1 second

Maximum roughly:

1.5 seconds

Do not make users wait through a cinematic.

The menu links should already exist structurally even while this animation occurs.

15. IDLE BEHAVIOR

The eye should never behave like an obvious repeating GIF.

Use randomized, weighted idle events with long quiet gaps.

Possible events:

CHARACTER CHURN

Several glyphs replace themselves briefly.

MICRO-SACCADE

The pupil shifts a tiny amount and immediately stops.

COMPRESSION

Eye briefly compresses horizontally.

GLYPH FLICKER

Several characters disappear/reappear.

HORIZONTAL DESYNC

One or two rows move sideways for approximately 50–100ms.

PARTIAL SIGNAL LOSS

Small sections of the eye disappear momentarily.

CLOSED-SLIT REST

Eye partially closes.

WAKE / REFORM

Eye redraws/reconstructs small regions.

DIRECT STARE

Very rare.

The eye suddenly centers its pupil and appears to stare directly forward.

This event should happen infrequently enough that users may wonder whether they actually saw it.

16. IDLE EVENT FREQUENCY

Avoid constant movement.

A reasonable conceptual model:

minor event:
every ~3–8 seconds

medium event:
every ~10–25 seconds

major event:
rare

Randomize timing.

Do not run several simultaneously.

The eye should spend significant periods doing essentially nothing.

17. NAVIGATION TRANSITION

Use the COLLAPSE INTO PUPIL transition.

When the user commits to a section:

Stage 1 — LOCK

Selected node becomes fixed.

Ignore new hover/touch input.

Stage 2 — REMOVE DISTRACTIONS

All other navigation items fade rapidly.

Stage 3 — GAZE SNAP

Eye sharply locks onto selected item.

Stage 4 — PUPIL DILATION

The pupil expands aggressively.

Stage 5 — COLLAPSE

The surrounding eye, glyphs, menu, and interface appear to be pulled inward toward the pupil.

Think:

interface -> singularity

rather than a normal CSS fade.

Stage 6 — BLACK

Screen becomes fully black.

Stage 7 — NAVIGATE

Navigate to the destination page.

Target total transition:

~600–900ms

Do not make navigation feel delayed.

18. TRANSITION VISUAL CHARACTER

The collapse should feel:

violent but controlled
predatory
cinematic
fast

It should NOT resemble:

a PowerPoint zoom
a normal scale(0)
a spinning loading animation

Possible effects:

radial glyph movement
scale compression
blur
opacity falloff
pupil expansion
streaks converging toward center
brief color intensification
rapid darkness encroaching from edges

Keep GPU cost reasonable.

19. IMPLEMENTATION ARCHITECTURE

Prefer:

HTML
CSS
vanilla JavaScript
SVG where useful

Do not require:

React
Three.js
WebGL
large animation frameworks
large particle libraries

unless there is a compelling reason.

The effect should remain relatively lightweight.

20. EYE RENDERING

Preferred approach:

SVG + CSS + lightweight JS

Use SVG for:

scalable eye geometry
pupil positioning
masks
clipping
deformation if useful

Use text/glyph layers or patterns to preserve the ASCII appearance.

CSS should handle:

glow
opacity
transforms
section colors
transitions

JavaScript should primarily handle:

state
input
timing
target selection
idle scheduling

Avoid doing unnecessary continuous computation.

21. STATE MACHINE

Implement a simple UI state model.

Possible states:

BOOTING
IDLE
FOCUSED
ARMED
TRANSITIONING
BOOTING

Opening animation.

IDLE

Nothing selected.

FOCUSED

Desktop hover or keyboard focus.

ARMED

First mobile tap occurred.

TRANSITIONING

Destination navigation has been committed.

Prevent conflicting events between states.

22. SECTION DATA

Keep section-specific settings centralized.

For example:

const sections = {
    about: {
        color: "#00F7FF"
    },

    projects: {
        color: "#39FF94"
    },

    blog: {
        color: "#CFFF4D"
    },

    music: {
        color: "#FF48FF"
    },

    greetings: {
        color: "#A259FF"
    },

    photography: {
        color: "#4DA2FF"
    }
};

Eye target position can also be stored here if useful.

23. CSS CUSTOM PROPERTIES

Expose important visual state through CSS variables.

For example:

--background
--eye-base
--active-accent
--eye-x
--eye-y
--eye-open
--glitch-strength
--glow-strength
--transition-progress

This should allow design tuning without rewriting JavaScript.

24. ACCESSIBILITY

The site must work as actual navigation rather than an animation pretending to be navigation.

Requirements:

semantic <nav>
semantic <a href>
usable without JavaScript
keyboard support
screen-reader-compatible link labels
reasonable contrast
large mobile touch targets
no navigation dependent solely on color
respect prefers-reduced-motion
25. REDUCED MOTION

If:

@media (prefers-reduced-motion: reduce)

is active:

Remove or greatly reduce:

boot animation
gaze overshoot
idle glitches
collapse animation
large movement

Keep:

menu highlighting
eye target state
section colors
functional navigation

Navigation should occur almost immediately.

26. JAVASCRIPT FAILURE

If JavaScript fails:

The page should still show:

dark background
static eye
visible menu
working navigation links

Desktop/mobile double-select behavior is enhancement only.

The user must never become trapped because JS failed.

27. PERFORMANCE

Avoid constant animation where possible.

Prefer:

event-driven animation
CSS transitions
short timers
occasional idle events

instead of a permanent 60 FPS animation loop.

Use requestAnimationFrame only where genuinely beneficial.

Avoid excessive blur filters on large fullscreen layers.

28. PLACEHOLDER DESTINATION PAGES

Create:

about
projects
blog
music
greetings
photography

Each can initially be nearly blank:

<body>
    <main>
        THIS IS LIVE
    </main>
</body>

No need to propagate the landing page aesthetic into these pages yet.

29. V1 EXCLUSIONS

Do NOT implement these yet:

UI sounds
music
ambient system status text
username display
hidden lore
fake console diagnostics
elaborate loading screens
section-page styling
cursor-following eye behavior

Keep the focus tightly on the landing page.

30. SUCCESS CRITERIA

The finished landing page succeeds if:

The eye is immediately the visual focus.
The page feels unsettling without being difficult to use.
Hovering navigation causes a satisfying sharp gaze snap.
Mobile selection feels deliberate rather than compromised.
The eye feels alive during inactivity without constantly moving.
Section colors are noticeable but restrained.
The collapse transition feels like the interface is being swallowed.
Navigation remains normal semantic web navigation underneath.
It feels more like a strange console interface/entity than a portfolio template.
Performance remains smooth on modern phones and ordinary laptops.
Creative rule to keep in mind throughout development

When choosing between two implementations, prefer the one that makes the interface feel like:

a machine observing the visitor

rather than:

a website showing the visitor an eye animation.

That distinction is the core of the design.
