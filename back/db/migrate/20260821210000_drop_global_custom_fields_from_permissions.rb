# frozen_string_literal: true

# The last step of replacing `global_custom_fields` with `custom_fields_behavior`
# (see 20260820000000_add_custom_fields_behavior_to_permissions and
# 20260821000000_require_custom_fields_behavior_on_permissions).
#
# Deliberately its own release: dropping the column in the one that stopped using it
# would have broken every permission insert made by instances still running the
# previous release, which list the column in their INSERTs. By now no running code
# knows about it.
#
# NOTE: `down` restores the column but not its values — what a permission asks is
# expressed by `custom_fields_behavior` alone.
class DropGlobalCustomFieldsFromPermissions < ActiveRecord::Migration[7.2]
  def up
    safety_assured { remove_column :permissions, :global_custom_fields }
  end

  def down
    add_column :permissions, :global_custom_fields, :boolean, null: false, default: false
  end
end
