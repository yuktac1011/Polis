This research and PRD are designed to help you dominate the **Horizon'26 Hackathon** by satisfying the "Technical Ceiling" (manual math, zero-backend, state-sync) while implementing your high-impact USPs.

---

### Phase 1: Research & Data Resources

#### 1. The Map (Geography & Boundaries)
To fulfill the "hand-authored SVG" requirement, avoid Google Maps/Leaflet libraries. Use raw geographic data converted to a single `<svg>` component.
*   **Source Data:** Download the **Mumbai Assembly Constituencies GeoJSON** from [DataMeet's Community Maps](https://datameet.org/) or [OpenCity Mumbai](https://opencity.in/).
*   **Processing Tool:** Use [Mapshaper.org](https://mapshaper.org/).
    1.  Upload the GeoJSON.
    2.  Use the `simplify` command to reduce the file size (crucial for a 6-hour hackathon).
    3.  Export as **SVG**.
    4.  **Important:** Open the SVG and ensure each `<path>` has an `id` matching the constituency name (e.g., `id="Dharavi"`). This allows you to link the map to your MLA data.

#### 2. MLA & Area Mapping (The Data List)
Since you are at SVKM (Mumbai), use the **2024 Maharashtra Assembly Election** results for Mumbai.
*   **Key Source:** [MyNeta.info (Mumbai City)](https://myneta.info/Maharashtra2024/index.php?action=show_constituencies&district_id=25).
*   **The List (Sample for your mock data):**
    *   **Colaba:** Rahul Narwekar (BJP)
    *   **Worli:** Aditya Thackeray (SS-UBT)
    *   **Dharavi:** Jyoti Eknath Gaikwad (INC)
    *   **Vandre East:** Zeeshan Siddique (NCP)

#### 3. Identity Verification (Aadhar logic)
*   **Aadhar Checksum:** Real Aadhar cards use the **Verhoeff Algorithm**.
*   **Logic:** You can implement a `validateAadhar(id: string)` function using a pre-defined multiplication table. This allows "Offline Auth" without a backend.

---

### Phase 2: Tech Stack (Vite + React + TS)

*   **State Management:** `Zustand` (Fastest to set up for a single-page app "State Atom").
*   **Styling:** `Tailwind CSS` + `Lucide React` (Icons).
*   **Animation:** `Framer Motion` (For the "physics-approximated" CSS transitions mentioned in PS-03).
*   **Persistence:** `LocalStorage` (Required by the prompt for "single source of truth").

---

### Phase 3: Detailed PRD (Project Polis)

#### 1. Objective
A dual-mode civic transparency platform where citizens report issues anonymously via a zoomable SVG map, and assigned MLAs manage those issues through a Kanban board.

#### 2. User Personas
*   **Citizen:** Validates with Aadhar. Anonymous reporter. Can only see issues.
*   **MLA:** Identified by Aadhar suffix. Can move issues through status columns (New → In Progress → Resolved).

#### 3. Functional Requirements
*   **Verification Gate:** A modal that accepts a 12-digit Aadhar. 
    *   Logic: Ends in `00`? Role = MLA. Else? Role = Citizen.
*   **The Interactive Map (SVG):**
    *   Manual **Pan & Zoom** using `transform: matrix()` math.
    *   **Coordinate Unprojection:** Converting a click on the screen pixels to the SVG's internal coordinate system to place a `Circle` (Pin).
    *   **Zone Identification:** Hovering over a path highlights the MLA's name for that area.
*   **Issue Reporting:** Clicking a spot on the map opens a slide-in form. 
    *   Inputs: Category (Infra, Safety, etc.), Title, Description.
*   **The Synchronized Kanban:**
    *   A 3-column layout.
    *   Cards contain issue details and an "Upvote" button.
    *   **Sync Logic:** Moving a card to "Resolved" must immediately change the corresponding Pin's color on the Map to Green.
*   **Accountability Leaderboard (USP):**
    *   A ranking of MLAs based on "Resolution Rate" (Resolved / Total Issues).

---

### Phase 4: Technical Implementation Guide

#### 1. Manual Affine Transform (Pan/Zoom)
Do not use `transform: scale()`. Instead, manipulate the SVG `viewBox`.
```typescript
const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 1000, h: 800 });

// Handle Zoom
const handleWheel = (e: React.WheelEvent) => {
  const scale = e.deltaY > 0 ? 1.1 : 0.9;
  setViewBox(prev => ({
    ...prev,
    w: prev.w * scale,
    h: prev.h * scale
  }));
};
```

#### 2. Coordinate Unprojection (Dropping Pins)
To ensure the pin stays on the map during zoom, you must calculate its position relative to the SVG `CTM` (Coordinate Transformation Matrix).
```typescript
const getSVGCoords = (e: React.MouseEvent, svgRef: RefObject<SVGSVGElement>) => {
  const pt = svgRef.current!.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  const transformed = pt.matrixTransform(svgRef.current!.getScreenCTM()!.inverse());
  return { x: transformed.x, y: transformed.y };
};
```

#### 3. Verhoeff Algorithm (Offline Aadhar)
Include a constant matrix for `d`, `p`, and `inv` tables. A simple 20-line utility function will make your "Auth" feel professional to the judges.

#### 4. Project Structure
```text
/src
  /components
    /Map
      MapContainer.tsx (SVG logic)
      Pin.tsx
    /Kanban
      Board.tsx
      IssueCard.tsx
    /Auth
      AadharModal.tsx
  /store
    useStore.ts (Zustand state: issues[], currentUser)
  /utils
    verhoeff.ts
    mlaMapping.ts (JSON of Mumbai constituencies)
```

### Pro-Hackathon Strategy:
Since the prompt emphasizes **"Interaction-design mastery,"** ensure your Kanban cards use `framer-motion` for `layout` transitions. When an issue is added on the map, make the pin "pop" into existence with a spring animation. This "polish" is exactly what the Nexus Tech Committee is looking for.