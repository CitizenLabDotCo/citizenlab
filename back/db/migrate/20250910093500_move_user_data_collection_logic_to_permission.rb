# frozen_string_literal: true

class MoveUserDataCollectionLogicToPermission < ActiveRecord::Migration[7.1]
  def change
    reversible do |dir|
      add_column :permissions, :user_fields_in_form, :boolean, default: false, null: false
      add_column :permissions, :user_data_collection, :string, default: 'all_data', null: false

      dir.up do
        Permission.reset_column_information

        # STEP 1: move user_fields_in_form from phases to permissions
        Permission
          .where(permission_scope_type: 'Phase')
          .joins('LEFT JOIN phases ON phases.id = permissions.permission_scope_id')
          .where(phases: { user_fields_in_form: true })
          .update_all(user_fields_in_form: true)

        # STEP 2: set new user_data_collection column

        # Native survey phases that had allow_anonymous_participation = true,
        # and user_fields_in_form = false, were effectively working as fully anonymous surveys.
        # So we set user_data_collection to 'anonymous' for their permissions.
        Permission
          .where(permission_scope_type: 'Phase')
          .joins('LEFT JOIN phases ON phases.id = permissions.permission_scope_id')
          .where(phases: {
            participation_method: 'native_survey',
            allow_anonymous_participation: true,
            user_fields_in_form: false
          })
          .update_all(user_data_collection: 'anonymous')

        # While native survey phases that had allow_anonymous_participation = true,
        # and user_fields_in_form = true, were still collecting demographic data.
        # So we set user_data_collection to 'demographics_only' for their permissions.
        Permission
          .where(permission_scope_type: 'Phase')
          .joins('LEFT JOIN phases ON phases.id = permissions.permission_scope_id')
          .where(phases: {
            participation_method: 'native_survey',
            allow_anonymous_participation: true,
            user_fields_in_form: true
          })
          .update_all(user_data_collection: 'demographics_only')
      end

      remove_column :phases, :user_fields_in_form
    end
  end
end
