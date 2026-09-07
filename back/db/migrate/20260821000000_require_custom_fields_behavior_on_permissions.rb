# frozen_string_literal: true

# `custom_fields_behavior` replaced `global_custom_fields` (see
# 20260820000000_add_custom_fields_behavior_to_permissions and
# single_use:populate_custom_fields_behavior). This makes the new attribute required.
#
# `global_custom_fields` is deliberately left in place even though nothing reads or
# writes it any more: dropping it while instances running the previous release are
# still serving would break every permission insert they make, since they still list
# the column. A follow-up drops it once no running code knows about it.
class RequireCustomFieldsBehaviorOnPermissions < ActiveRecord::Migration[7.2]
  # `permissions` holds one row per action per phase, so the backfill and the NOT NULL
  # scan are cheap here.
  def up
    safety_assured do
      # Safety net for any row the single-use task did not reach: without it a tenant
      # it missed would fail this migration outright. Mirrors the task's mapping minus
      # the "persisted fields are exactly the platform's" refinement, since a row
      # landing on 'custom' asks the same questions 'global' would have resolved to.
      execute <<~SQL.squish
        UPDATE permissions SET custom_fields_behavior = CASE
          WHEN global_custom_fields AND permitted_by = 'everyone' THEN 'disabled'
          WHEN global_custom_fields THEN 'global'
          WHEN EXISTS (SELECT 1 FROM permissions_custom_fields WHERE permission_id = permissions.id) THEN 'custom'
          ELSE 'disabled'
        END
        WHERE custom_fields_behavior IS NULL
      SQL

      change_column_default :permissions, :custom_fields_behavior, 'global'
      change_column_null :permissions, :custom_fields_behavior, false
    end
  end

  def down
    safety_assured do
      change_column_null :permissions, :custom_fields_behavior, true
      change_column_default :permissions, :custom_fields_behavior, nil
    end
  end
end
