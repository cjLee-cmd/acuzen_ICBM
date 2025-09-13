# Drug Surveillance System Design Guidelines

## Design Approach
**System-Based Approach**: Following Material Design principles for this healthcare/regulatory application, emphasizing clarity, accessibility, and professional credibility. The design prioritizes data readability and workflow efficiency over visual flair.

## Core Design Elements

### A. Color Palette
**Primary Colors:**
- Light Mode: 25 85% 45% (professional blue)
- Dark Mode: 220 15% 20% (dark slate background)

**Supporting Colors:**
- Success: 140 65% 45% (for approved cases)
- Warning: 45 90% 55% (for pending reviews)
- Error: 0 70% 50% (for critical alerts)
- Neutral: 210 10% 50% (for secondary text)

### B. Typography
**Font Stack:** Inter via Google Fonts CDN
- Headers: 600 weight, sizes 24px-32px
- Body text: 400 weight, 16px base size
- Data labels: 500 weight, 14px
- Code/IDs: 'JetBrains Mono', monospace

### C. Layout System
**Spacing Units:** Tailwind classes using 2, 4, 6, and 8 units
- Component padding: p-4, p-6
- Section margins: m-4, m-8
- Element gaps: gap-2, gap-4
- Grid layouts: 12-column system with responsive breakpoints

### D. Component Library

**Navigation:**
- Top navigation bar with role-based menu items
- Breadcrumb navigation for deep workflows
- Sidebar for admin/power user functions

**Data Display:**
- Clean table designs with alternating row colors
- Card-based case summaries with status indicators
- Dashboard widgets with clear metrics visualization
- Progressive disclosure for complex case details

**Forms:**
- Multi-step forms for case entry
- Inline validation with clear error states
- File upload areas with drag-and-drop
- Auto-save indicators for long forms

**Overlays:**
- Modal dialogs for case details and confirmations
- Toast notifications for system feedback
- Loading states for AI processing operations

### E. Key Functional Areas

**Dashboard:**
- Grid layout with metric cards showing case volumes, AI accuracy, pending reviews
- Chart area for trend visualization
- Quick action buttons for common tasks

**Case Management:**
- List view with sortable columns and status filters
- Detailed case view with tabbed sections (Details, Timeline, Attachments, AI Analysis)
- Bulk action capabilities for reviewers

**AI Processing Interface:**
- Confidence score displays with visual indicators
- Side-by-side comparison views for AI suggestions vs. human review
- Clear workflow states (Pending → Processing → Review → Approved)

**Audit & Compliance:**
- Searchable activity logs with timestamp precision
- Export functionality for regulatory reporting
- User access tracking with clear permission indicators

## No Hero Images
This is a utility-focused healthcare application with no marketing elements. All imagery should be functional: charts, data visualizations, status icons, and document previews only.

## Accessibility & Compliance
- WCAG 2.1 AA compliance throughout
- High contrast ratios for medical data readability
- Keyboard navigation for all workflows
- Screen reader optimization for audit logs
- Consistent dark mode implementation across all components