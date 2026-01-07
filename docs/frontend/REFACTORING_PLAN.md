# Frontend Refactoring Plan

**Date:** 2026-01-07  
**Status:** IN PROGRESS

## Phase 1: Critical Fixes (Priority 0)

### Step 1: Remove Duplicate Components ✅ IN PROGRESS

#### Files to Delete:
- [ ] `/src/lib/api.ts` (axios version - conflicts with services/api.ts)
- [ ] `/src/lib/utils.ts` (if it exists and conflicts)
- [ ] `/src/components/ui/BookCard.tsx` (duplicate)
- [ ] `/src/components/ui/LoadingSpinner.tsx` (move to components/)
- [ ] `/src/components/ui/index.ts`
- [ ] `/src/components/layout/Navbar.tsx` (duplicate)
- [ ] `/src/components/layout/Footer.tsx` (keep, no duplicate)
- [ ] `/src/components/layout/Layout.tsx` (keep, no duplicate)
- [ ] `/src/contexts/AuthContext.tsx` (duplicate)
- [ ] `/src/contexts/ThemeContext.tsx` (duplicate)

#### Files to Keep:
- ✅ `/src/services/api.ts` (comprehensive fetch-based API)
- ✅ `/src/components/BookCard.tsx` (main implementation)
- ✅ `/src/components/Navbar.tsx` (main implementation)
- ✅ `/src/context/AuthContext.tsx` (main implementation)
- ✅ `/src/context/ThemeContext.tsx` (main implementation)

#### Files to Update (remove @/ imports):
- [ ] `/src/components/layout/Footer.tsx`
- [ ] `/src/components/layout/Layout.tsx`

### Step 2: Consolidate API Services
- [x] Identified: Keep `/src/services/api.ts`
- [ ] Remove `/src/lib/api.ts`
- [ ] Update all imports

### Step 3: Standardize Import Patterns
- [ ] Remove all `@/` imports
- [ ] Use relative imports consistently
- [ ] Update tsconfig if needed

## Backup Strategy
All changes will be tracked. Original files can be restored from git if needed.

## Testing Checklist
After each change:
- [ ] App compiles without errors
- [ ] Dev server runs
- [ ] Login/Register works
- [ ] Book browsing works
- [ ] Book upload works
