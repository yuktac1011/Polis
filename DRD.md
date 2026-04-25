This **Design Reference Document (DRD)** shifts Project Polis away from the "Generic SaaS" look (Blue/Purple) and toward a **High-End Editorial / Apple-System** aesthetic. 

The goal is to make a "Government Tool" that feels like a **Premium Swiss Watch**—precise, clean, and extremely legible.

---

### I. Design Philosophy: "The Physical Ledger"
*   **Depth:** Use subtle shadows and layered white-on-white surfaces instead of heavy borders.
*   **Typography:** Priority #1. Use **Geist** (Vercel) or **Inter** with tight letter spacing.
*   **Color Role:** Colors are used *only* for status and data, never for decoration.
*   **Material:** Backdrop blurs (Glassmorphism) for overlays to maintain spatial awareness of the map.

---

### II. The Color Palette (Light Mode - "Paper & Graphite")
We avoid "AI Blue/Purple" in favor of **Organic Earth & Metal** tones.

| Element | Hex Code | Visual Description |
| :--- | :--- | :--- |
| **Canvas Background** | `#FBFBFB` | Off-white "Apple" grey. |
| **Surface (Cards/Modals)** | `#FFFFFF` | Pure white for contrast. |
| **Text (Primary)** | `#1D1D1F` | Apple Graphite black. |
| **Text (Secondary)** | `#6E6E73` | Muted grey for metadata. |
| **Border / Stroke** | `#E5E5E5` | Hairline thin borders. |
| **Accent: New Issue** | `#323232` | Deep Charcoal (Serious, urgent). |
| **Accent: In Progress** | `#D97706` | Rich Amber (Caution, active). |
| **Accent: Resolved** | `#059669` | Emerald Green (Trust, success). |
| **Highlight** | `#F2F2F7` | Soft grey for hover states. |

---

### III. Typography Scale
*   **Display:** 32pt / Semi-Bold / Tracking -0.022em (For the Dashboard Title)
*   **Heading:** 18pt / Medium (For Kanban Columns)
*   **Body:** 14pt / Regular (For Issue Descriptions)
*   **Mono:** 12pt / Medium (For Aadhar Hashes / Coordinates) — *Use JetBrains Mono.*

---

### IV. Component-Specific Design Details

#### 1. The Aadhar Gate (The "System" Entry)
*   **Visual:** A centered card (400px wide).
*   **Style:** No "Login" button. Just a 12-digit input field with large, spaced-out numbers. 
*   **The "Apple" Touch:** When the 12th digit is entered, the card should perform a subtle "System Thud" (slight scale down and up) and fade into the map.

#### 2. The SVG Map (The "Cartographic" View)
*   **Landmass:** Fill with `#F5F5F7`. Strokes for boundaries in `#D1D1D6` (0.5px thickness).
*   **The "Active" Zone:** When hovering over an MLA constituency, the area should fill with a very subtle `#E8E8ED`.
*   **Pins:** Do not use map-marker icons. Use **Circular Dots**.
    *   Outer ring: 2px White.
    *   Inner fill: The Status Color (Charcoal/Amber/Emerald).
    *   Effect: Subtle "Pulse" animation using CSS `@keyframes`.

#### 3. The Kanban Board (The "Accountability" View)
*   **Column Headers:** Sticky top. Use a small badge next to the title `(12)` in a light grey pill.
*   **Cards:** 
    *   `border-radius: 12px`. 
    *   `box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05)`.
    *   No heavy headers. Category (e.g., "SANITATION") should be a tiny uppercase label in the top-left.
    *   Bottom row: "Citizen #A4B2" on the left, Upvote count on the right.

#### 4. The Accountability Leaderboard (The "Leaderboard")
*   **Visual:** A vertical sidebar or a slide-over panel.
*   **Style:** Use a **Progress Ring** (SVG) for the resolution rate.
*   **Contrast:** The #1 ranked MLA should have a subtle "Gold" hairline border or a small "Verified" checkmark next to their name.

---

### V. Motion & Interaction (The "Apple" Feel)
This is what wins hackathons.

1.  **View Toggle:** When switching from Map to Kanban, use a **Cross-Fade + Slide**. The pins on the map should "fly" toward their respective Kanban columns. (Use `layoutId` in Framer Motion).
2.  **Card Drag:** When dragging a Kanban card, increase its shadow and rotate it by 2 degrees to give it "weight."
3.  **Haptic Visuals:** If an MLA tries to move a card they don't own (wrong zone), use a horizontal "Shake" animation (the iOS password-incorrect feel).

---

### VI. Tech Implementation (Tailwind Config)
Add this to your `tailwind.config.js` to keep colors consistent:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        apple: {
          bg: '#FBFBFB',
          surface: '#FFFFFF',
          text: '#1D1D1F',
          secondary: '#6E6E73',
          border: '#E5E5E5',
          new: '#323232',
          progress: '#D97706',
          resolved: '#059669',
        }
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    }
  }
}
```

### The Presentation Pitch Note:
When presenting to the judges, refer to the UI as **"Institutional Minimalist."** Explain that you avoided flashy colors to ensure the data (the issues) remains the focal point, reflecting the serious nature of civic governance.