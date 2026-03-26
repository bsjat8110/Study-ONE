# Option C — Mutations & Forms Design Spec

**Goal:** सभी dead CRUD buttons को functional बनाना — Institute side (Students/Courses/Tests) और Student side (Profile/Enrollment/Test Attempt) — inline expand pattern, React Hook Form, existing API routes।

**Architecture:** Server Component fetches initial data → passes to Client Component → inline form expands on button click → react-hook-form validates → fetch hits API route → optimistic list update or router.refresh()

**Tech Stack:** React Hook Form, useTransition, fetch, REST API routes (some already in Option B, some extended/new here)

---

## Institute Side

### Students CRUD
- "Add Student" button → inline form expand at top of list (name, email, password, phone)
- Per-student: Edit inline (name, phone, isActive toggle), Delete (soft: isActive=false)
- Validation: name required, email valid, password min 6 chars
- Uses: `POST /api/students` (extend to accept phone), `PATCH /api/students/[id]` (extend to accept name/phone), `DELETE /api/students/[id]`

### Courses CRUD
- Page converts to CoursesClient.tsx (Server page passes initial data)
- "Create New Course" → inline form at top (title, subject, description, totalChapters, isActive)
- Per-course "Manage" → card expands into edit form
- Delete with typed confirmation ("type course name")
- Uses: `POST /api/courses`, `PATCH /api/courses/[id]`, `DELETE /api/courses/[id]`

### Tests CRUD
- Page converts to TestsClient.tsx
- "Create Mock Test" → inline form (title, subject, duration, totalMarks, passingMarks, scheduledAt)
- Per-test Edit + Delete
- scheduledAt: native datetime-local input, validation: future date only, totalMarks > passingMarks
- Uses: `POST /api/tests`, `PATCH /api/tests/[id]` (extend to accept scheduledAt), `DELETE /api/tests/[id]`

---

## Student Side

### Profile Edit
- `app/student/settings/page.tsx` → Server Component wrapper, passes session user to `SettingsClient.tsx`
- Edit: name, phone fields inline via `PATCH /api/profile` (new student-specific route, uses requireSession not requireInstituteAdmin)

### Course Enrollment
- Student courses page: "Enroll" button on available courses
- Inline confirm row expands before enrolling
- Uses: `POST /api/enrollments` (new POST handler added to existing enrollments route)
- Unenroll: `DELETE /api/enrollments/[id]` (new file)

### Test Attempt
- New page: `app/student/tests/[id]/page.tsx`
- Countdown timer (duration from test), score input (simplified — no questions model in schema)
- Submit → `POST /api/test-results` (new POST handler added to existing route)

---

## API Extensions Required

The following existing routes need new/extended handlers (not yet present from Option B):

| Route | Change |
|-------|--------|
| `POST /api/students` | Accept `phone` field |
| `PATCH /api/students/[id]` | Accept `name`, `phone` in allowlist (currently only `isActive`) |
| `PATCH /api/tests/[id]` | Accept `scheduledAt` in allowlist (currently omitted) |
| `POST /api/enrollments` | New handler (only GET exists) |
| `POST /api/test-results` | New handler (only GET exists) |
| `PATCH /api/profile` | New route — student self-edit (requireSession, not admin) |
| `DELETE /api/enrollments/[id]` | New file |

---

## Shared Patterns

### Inline Expand Pattern
```tsx
// isExpanded state → Tailwind max-h-0 overflow-hidden → max-h-[600px] transition-all duration-300
// Form always mounted, just hidden — avoids flash on open
```

### Error Handling
- API error → red banner inside form
- Success → form collapses, parent list state updated optimistically (no full page reload)

### Validation (react-hook-form rules)
```
Student: name required, email pattern, password minLength:6
Course: title required, subject required, totalChapters min:1
Test: title required, scheduledAt min:now, totalMarks > passingMarks (custom validate)
```

---

## Files to Create

```
components/forms/StudentForm.tsx           # Add + Edit student inline form
components/forms/CourseForm.tsx            # Create + Edit course inline form
components/forms/TestForm.tsx              # Create + Edit test inline form
app/institute/courses/CoursesClient.tsx    # Client wrapper for courses page
app/institute/tests/TestsClient.tsx        # Client wrapper for tests page
app/student/settings/SettingsClient.tsx    # Profile edit form (client)
app/student/tests/[id]/page.tsx            # Test attempt page with timer
app/api/profile/route.ts                   # PATCH — student self-edit
app/api/enrollments/[id]/route.ts          # DELETE — unenroll
```

## Files to Modify

```
app/api/students/route.ts                  # POST: add phone field
app/api/students/[id]/route.ts             # PATCH: add name, phone to allowlist
app/api/tests/[id]/route.ts                # PATCH: add scheduledAt to allowlist
app/api/enrollments/route.ts               # Add POST handler
app/api/test-results/route.ts              # Add POST handler
app/institute/courses/page.tsx             # Pass data to CoursesClient
app/institute/tests/page.tsx               # Pass data to TestsClient
app/institute/students/StudentsClient.tsx  # Add inline add/edit/delete forms
app/student/settings/page.tsx              # Thin server wrapper → SettingsClient
app/student/courses/page.tsx               # Add enroll/unenroll inline UI
```
