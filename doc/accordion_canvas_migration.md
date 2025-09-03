# Accordion Canvas Migration

## Overview

This document describes the migration of accordion components from the old `text` property structure to the new canvas-based structure using `linkedNodes` and Container components.

## Problem Statement

The original accordion components stored text content directly in a `text` property on the accordion node. This approach had limitations:

- Text content was not properly separated from the accordion structure
- Limited flexibility for future enhancements
- Inconsistent with the canvas-based architecture

## Migration Strategy

The migration involves:

1. **Creating Container components** to hold accordion content
2. **Moving text content** from `text` property to TextMultiloc components within Containers
3. **Updating accordion nodes** to use `linkedNodes` pointing to Container components
4. **Preserving existing working accordions** that already use the canvas structure

## What We Learned

### The Real Issue

The problem wasn't just the backend migration - it was that **the migration didn't properly populate the TextMultiloc components** with the actual text content.

**Original accordions had rich text content:**

- "Advanced Security Features": Detailed security measures description
- "What is the return policy?": Complete return policy information

**During migration:**

1. ✅ We created Container + TextMultiloc structure correctly
2. ✅ We moved text content to TextMultiloc nodes
3. ❌ We left empty `"text": {}` objects instead of removing them completely
4. ❌ The TextMultiloc components didn't have the actual text content

### Frontend Component Issues

The `AccordionMultiloc` component needed to:

1. **Render canvas structure** for accordion content
2. **Display Text components** inside the accordion canvas
3. **Maintain proper architecture** without relying on the old `text` property

## Solution Implementation

### Backend Migration

- **Multi-tenant support**: Migration works across all tenants (development, staging, production)
- **Selective migration**: Only migrate accordions with actual text content
- **Create proper Container + TextMultiloc hierarchy** with actual text content
- **Remove text property completely** from migrated accordions
- **Preserve working accordions**: Skip accordions already using canvas structure

### Frontend Updates

- **Canvas-based rendering**: Accordions render as canvas with Text components inside
- **No text property dependency**: Component works purely with canvas structure
- **Proper Text component display**: Text content shows inside accordion canvas

## Migration Results

### Successfully Migrated (project_description layout)

- `LnrYb3BFQJ`: "Fresh Test Accordion 1" - migrated to canvas structure
- `OrzrCAXZaa`: "Fresh Test Accordion 2" - migrated to canvas structure

### Successfully Migrated (homepage layout)

- `-p3LlfHo2h`: "Manual accordion" - kept original working structure
- `3nTXZpe_mz`: "Advanced Security Features" - migrated to canvas structure with Text component
- `yc0SVgWBkc`: "What is the return policy?" - migrated to canvas structure with Text component

## Key Takeaways

1. **Migration must be selective** - only migrate accordions that actually need it
2. **Text content must be properly moved** to TextMultiloc components, not just containers
3. **Remove text property completely** from migrated accordions
4. **Canvas structure must be properly populated** with actual content
5. **Multi-tenant support is essential** for production deployments

## Available Scripts

### Essential Migration Scripts

1. **`single_use:backup_test_data`** - Backup current data before migration
2. **`single_use:dry_run_accordion_migration`** - Analyze what will be migrated
3. **`single_use:migrate_accordion_to_canvas`** - Execute the migration
4. **`single_use:rollback_accordion_migration`** - Rollback if needed

### Migration Process

1. **Backup**: Run `single_use:backup_test_data` to create a backup
2. **Analyze**: Run `single_use:dry_run_accordion_migration` to see what will be migrated
3. **Migrate**: Run `single_use:migrate_accordion_to_canvas` to execute the migration
4. **Verify**: Check that accordions now display text content in Text components inside canvas

## Production Deployment

### Multi-Tenant Support

- **All scripts support multi-tenant environments** (development, staging, production)
- **Tenant switching** is handled automatically during migration
- **Safe for production use** with proper backup procedures

### Deployment Checklist

- [ ] **Backup production data** before migration
- [ ] **Test on staging** environment first
- [ ] **Run dry run** to analyze migration scope
- [ ] **Execute migration** during maintenance window
- [ ] **Verify results** on production environment
- [ ] **Monitor for issues** after deployment

### Rollback Plan

- **Immediate rollback**: Use `single_use:rollback_accordion_migration` if issues arise
- **Data integrity**: All original text content is preserved in TextMultiloc components
- **No data loss**: Migration is reversible without content loss

## Future Steps

1. **Complete frontend migration** to fully utilize canvas structure
2. **Add rich text editing** capabilities to canvas-based accordions
3. **Implement content validation** to prevent empty accordions
4. **Add drag-and-drop** functionality for new content types
