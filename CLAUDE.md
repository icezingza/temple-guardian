1. Project Overview
Temple Guardian is a tablet-friendly web application for managing temple kuti (monk residences) using an interactive map interface.
Primary users are temple administrators who use a tablet to view the temple layout, see which kutis are occupied, and update resident names and statuses directly from the map.
The system is optimized for:
fast interaction on tablet devices
clear spatial recognition (map must match real temple layout)
simple data entry and status tracking
minimal navigation (map-first interface)
The map layout must match the real temple layout exactly. Spatial accuracy is more important than visual design or animations.
Avoid over-engineering. Prefer simple, maintainable solutions.
2. Tech Stack
Frontend:
React
TypeScript
Tailwind CSS
Backend:
Supabase (database + realtime)
Data:
Supabase Postgres
Table: kutis
Do not introduce:
Redux
MobX
Material UI
Ant Design
styled-components
Complex state management libraries
Map libraries (Leaflet, Google Maps, etc.)
This project uses a static image map with absolute-positioned markers, not a GIS system.
3. Architecture
Project structure guideline:
src/pages/ → main pages
src/components/ → UI components
src/components/map/ → map-related components
src/lib/ → utilities and shared logic
src/lib/kutiPositions.ts → map coordinates for each kuti
src/integrations/supabase/ → Supabase client
public/ → static assets like temple-map.jpg
Rules:
Map logic must stay inside map-related components
Database access should be centralized (Supabase client)
Do not mix UI logic with database logic
New features should be added as new components, not inside Index.tsx unless necessary
Prefer editing existing components over creating duplicates
Data flow: Supabase → fetch kutis → map lights → click light → edit panel → update Supabase → refresh lights
4. Coding Conventions
Use TypeScript, avoid any
Use functional React components only
Use async/await instead of .then()
Keep components under ~200 lines when possible
Use descriptive variable names (residentName, kutiStatus)
No commented-out code
No unused imports
Extract repeated logic into helper functions
Map coordinates must be stored in kutiPositions.ts
Do not hardcode coordinates inside components
Naming:
Components: PascalCase (TempleMap.tsx)
Functions: camelCase
Constants: UPPER_CASE
Database fields: snake_case
5. UI & Design System
UI rules:
Tablet-first design
Large touch targets (minimum 44px tap area)
Simple, clean layout
Tailwind CSS only
Avoid custom CSS files if possible
Map rules (very important):
Use the temple map image as background
Use absolute positioning for kuti lights
Use percentage-based coordinates (left %, top %)
Do NOT use grid layout for map
Do NOT auto-arrange kutis
Lights must match real-world positions exactly
Each light must have a small number label
Lights must use color based on status
Status colors:
Green = Available
Red = Occupied
Yellow = Reserved
Gray = Maintenance
6. Content & Copy Guidance
Text in the app should be:
short
clear
functional
no marketing language
no hype words
Use simple labels like:
Available
Occupied
Reserved
Maintenance
Save
Clear
Resident Name
Kuti Number
Error messages should tell the user what to do.
Example: Bad: "Something went wrong" Good: "Unable to save. Please try again."
7. Testing & Quality Bar
Before marking any task complete:
App runs without errors
No TypeScript errors
Map loads correctly
Lights appear in correct positions
Clicking a light opens the detail panel
Saving updates the database
Refresh keeps data
Works on tablet screen size
For data-driven UI: Always verify:
loading state
empty state
error state
Map positioning must be visually verified, not just code-verified.
8. File Placement Rules
Where new things go:
Map components → src/components/map/
General UI components → src/components/
Utilities → src/lib/
Map coordinates → src/lib/kutiPositions.ts
Supabase logic → src/integrations/supabase/
Images → public/
Rules:
Do not duplicate components
Edit existing components when possible
One component per file
Component filename must match component name
9. Safe-Change Rules
Very important rules:
Do NOT change Supabase table structure without explicit instruction
Do NOT rename database columns
Do NOT change kuti IDs or kuti numbers
Do NOT change map image without recalculating coordinates
Do NOT switch positioning system from absolute to grid
Do NOT auto-arrange kutis
Do NOT restructure the entire project without approval
Flag major architecture changes before implementing
Map positioning system is critical and must not be rewritten without approval.
10. Commands
Common commands (adjust depending on project):
Install: npm install
Dev: npm run dev
Build: npm run build
Preview: npm run preview
Lint: npm run lint
If using Supabase:
Supabase start
Supabase migrate
Supabase seed
The dev server usually runs on:
http://localhost:5173⁠� or
http://localhost:3000⁠�
11. Security Rules
Security rules:
Never commit .env files
Never hardcode API keys
Supabase service role key must never be exposed to client
Only public anon key allowed in frontend
Do not log sensitive data
Validate user input before saving to database
Use Supabase RLS (Row Level Security)
Do not disable RLS without reason
Do not expose database structure in public APIs