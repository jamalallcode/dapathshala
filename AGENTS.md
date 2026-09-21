# Project Rules & System Guidelines

## 1. Zero Horizontal Overflow Mandate (জিরো হরাইজন্টাল ওভারফ্লো নিয়ম)
- **কখনোই কোনো অপশন, বাটন, কার্ড, টুলবার, গ্রিড বা টেক্সট মূল কনটেইনার বা স্ক্রিন ডিজাইনের বাইরে যাবে না।**
- **Strict Viewport Containment**: All UI elements, toolbars, question sheets, option blocks, button groups, and grids MUST be fully contained within their parent container without any horizontal overflow on any viewport size (especially mobile screens: 320px–420px).
- **Responsive Classes Requirement**:
  - Always use `w-full max-w-full overflow-hidden` or `min-w-0` on parent cards, toolbars, and containers.
  - Button groups, switchers, and toolbars must wrap responsively (`flex-wrap` or adaptive grids like `grid-cols-2 sm:grid-cols-4`) rather than forcing single-line horizontal overspill.
  - Never use fixed rigid widths (e.g., `min-w-[500px]` or non-wrapping flex) that exceed mobile viewports.
  - Mobile padding must be proportional: use `p-3 sm:p-6 md:p-8` for sheet cards rather than large rigid padding (like `p-6` or `p-10`) on narrow mobile screens.

## 2. Bengali Typographic & Layout Space Guidelines
- Bengali fonts and phrases require more horizontal line space. Button labels and option markers must have adequate wrapping (`break-words`, `min-w-0`), comfortable tap targets (minimum 44px on touch devices), and responsive column wrapping to guarantee zero clipping or border penetration.
