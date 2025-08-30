# Accordion Canvas Migration

This document describes the migration of accordion components from text-based to canvas-based, allowing users to drag multiple components into accordion bodies.

## Overview

The accordion component has been enhanced to support multiple child components (images, text, buttons, etc.) instead of just text content. This migration converts existing accordion components that contain text into canvas-based accordions with TextMultiloc child components.

## Changes Made

### Frontend Changes

1. **Updated AccordionMultiloc Component** (`front/app/components/admin/ContentBuilder/Widgets/AccordionMultiloc/index.tsx`)

   - Added `isCanvas` property to support canvas mode
   - Maintained backward compatibility with existing text-based accordions
   - Updated settings panel to conditionally show text editor or canvas mode
   - Added support for child components via `{children}` rendering

2. **Updated Toolboxes**

   - Homepage Builder Toolbox: Updated accordion component to use canvas mode
   - Project Description Builder Toolbox: Updated accordion component to use canvas mode

3. **Updated Widget Configuration**
   - Added `AccordionMultiloc` to `WIDGETS_WITH_CHILDREN` set for proper visual feedback
   - Added `hasChildren: true` to accordion craft configuration
   - Added `canMoveIn` rules to allow components to be dragged into accordion

### Backend Changes

1. **Migration Script** (`back/lib/tasks/single_use/20241220_migrate_accordion_to_canvas.rake`)

   - Converts existing accordion components with text content to canvas-based accordions
   - Creates TextMultiloc child components for existing text content
   - Handles all tenants and layouts safely

2. **Rollback Script** (`back/lib/tasks/single_use/20241220_rollback_accordion_migration.rake`)

   - Reverts canvas-based accordions back to text-based
   - Extracts TextMultiloc content back to accordion text property

3. **Test Script** (`back/lib/tasks/single_use/20241220_test_accordion_migration.rake`)

   - Analyzes what would be migrated without making changes
   - Provides statistics on migration coverage

4. **Test Data Script** (`back/lib/tasks/single_use/20241220_create_test_accordions.rake`)
   - Creates test layouts with accordions to demonstrate migration

## Migration Process

### Pre-Migration Testing

1. **Test the migration on a staging environment:**

   ```bash
   # Create test data
   docker compose run web bundle exec rake single_use:create_test_accordions

   # Test what would be migrated
   docker compose run web bundle exec rake single_use:test_accordion_migration
   ```

2. **Review the test results** to understand the scope of the migration

### Migration Execution

1. **Run the migration:**

   ```bash
   docker compose run web bundle exec rake single_use:migrate_accordion_to_canvas
   ```

2. **Verify the migration** by checking that:
   - Accordion components now have `isCanvas: true`
   - Text content has been moved to TextMultiloc child components
   - Accordions can accept dragged components

### Rollback (if needed)

1. **Run the rollback:**

   ```bash
   docker compose run web bundle exec rake single_use:rollback_accordion_migration
   ```

2. **Verify the rollback** by checking that:
   - Accordion components have `isCanvas: false`
   - Text content has been restored to the accordion text property
   - TextMultiloc child components have been removed

## Technical Details

### Canvas Mode vs Text Mode

- **Text Mode** (`isCanvas: false`): Renders `QuillEditedContent` with text from the `text` prop
- **Canvas Mode** (`isCanvas: true`): Renders `{children}` allowing other components to be dragged in

### Migration Strategy

The migration follows "Option A" from the original requirements:

- Convert existing text content to a TextMultiloc component inside the accordion
- Set `isCanvas: true` on the accordion
- Remove the `text` property from the accordion
- Add the TextMultiloc as a child node

### Craft.js Configuration

The accordion component now includes:

- `hasChildren: true` for visual feedback
- `canMoveIn: () => true` to allow any component to be dragged in
- Dynamic rendering based on `isCanvas` property

## Testing

### Manual Testing

1. **Drag and Drop**: Verify that components can be dragged from the toolbox into accordion bodies
2. **Content Preservation**: Verify that existing text content is preserved after migration
3. **Settings Panel**: Verify that the settings panel shows appropriate options for canvas vs text mode
4. **Backward Compatibility**: Verify that legacy accordions still work correctly

### Automated Testing

Run the test scripts to verify migration behavior:

```bash
# Test migration analysis
docker compose run web bundle exec rake single_use:test_accordion_migration

# Create and test with sample data
docker compose run web bundle exec rake single_use:create_test_accordions
docker compose run web bundle exec rake single_use:migrate_accordion_to_canvas
```

## Rollback Plan

If issues are discovered after migration:

1. **Immediate Rollback**: Use the rollback script to revert all changes
2. **Investigation**: Identify and fix the root cause
3. **Re-migration**: Run the migration again after fixes are applied

## Support

For questions or issues related to this migration, please refer to:

- The migration scripts for technical implementation details
- The test scripts for verification procedures
- This documentation for process overview
