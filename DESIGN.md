# ExuHealth Hospital - Design System

This document outlines the UI schema and Design System based on the "Rhythm Admin" dark navy premium reference dashboard. Use this document as the source of truth for the React + Tailwind implementation.

## Colors
The color palette focuses on deep navy tones with vibrant accents for highlighting data.

- **Background:** `#0d1117` (Very dark navy)
- **Sidebar & Header Surface:** `#0f172a` (Slate-900 equivalent)
- **Card Surface:** `#1a2235` (Slightly lighter navy with subtle borders)
- **Text Primary:** `#ffffff` (White for strong contrast)
- **Text Secondary:** `#94a3b8` (Slate-400 equivalent for subtitles and labels)
- **Primary Accent:** `#0ea5e9` (Sky blue, used for active states and primary buttons)
- **Secondary Accent:** `#14b8a6` (Teal)
- **Highlight:** `#6366f1` (Indigo/Purple, used for abstract cards or charts)
- **Emergency / Danger:** `#f43f5e` (Rose/Red)
- **Warning / Pending:** `#f59e0b` (Amber)
- **Success:** `#10b981` (Emerald green for available statuses and paid bills)

## Typography
Use modern sans-serif. Use `Inter` if available via Google Fonts. Text should maintain high readability against the dark background.

## UI Elements

### Structural
- Use rounded corners for Cards and Modals `rounded-xl`.
- Cards should have a subtle, translucent border: `border border-slate-700/50`.
- The sidebar should contain the main navigation with a prominent active state indication (e.g., a thick blue left border).

### Tables
- Data tables should span full width inside a card container.
- Row hover effects: `hover:bg-slate-800/50`.
- Use user avatar bubbles natively integrated inside rows connecting data to users.

### Badges & Pills
- Use dense padding on badges (e.g., `px-2 py-0.5 rounded-full`).
- Warning badges feature amber tint, Success badges feature emerald tint, Danger badges feature rose tint (both text color and a washed background tint, matching dark mode styling).

### Cards 
- Stat Cards: Simple, displaying numbers prominently with a relevant rounded icon.
- Room Cards: Have color-coded glowing left-borders depending on availability (Green=Available, Red=Occupied).

## Iconography
Use `react-icons/lu` (Lucide React) for all iconography to ensure crisp, standardized dashboard semantics.

## Charting
Implement charts using `recharts`. Charts should adopt the primary accent colors (`#0ea5e9`, `#6366f1`, `#14b8a6`) omitting default colors to align with our dark navy theme perfectly.
