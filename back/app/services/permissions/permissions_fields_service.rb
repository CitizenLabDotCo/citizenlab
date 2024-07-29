# frozen_string_literal: true

module Permissions
  class PermissionsFieldsService
    def fields_for_permission(permission, return_hidden: false)
      fields = if permission.global_custom_fields
        default_fields(permission)
      else
        permission.permissions_fields.to_a
      end
      add_related_group_fields(permission, fields)
    end

    # To create fields for the custom permitted_by - we copy the defaults from the previous value of permitted_by
    def persist_default_fields(permission)
      return unless permission.global_custom_fields && permission.permissions_fields.empty?

      # First update global custom fields to false
      permission.update!(global_custom_fields: false)

      # Now create the default fields
      fields = default_fields(permission)
      return if fields.blank?

      fields.each(&:save!)
    end

    def default_fields(permission)
      return [] unless permission.allow_global_custom_fields?

      custom_fields = CustomField.where(resource_type: 'User', enabled: true, hidden: false).order(:ordering)
      custom_fields.each_with_index.map do |field, index|
        PermissionsField.new(id: SecureRandom.uuid, custom_field: field, required: field.required, ordering: index, permission: permission)
      end
    end

    def verified_actions_enabled?
      @verified_actions_enabled ||= AppConfiguration.instance.feature_activated?('verified_actions')
    end

    private

    # Add non-persisted locked fields to the permission
    def add_and_lock_related_fields(permission, fields, custom_field_ids, lock_type)
      ordering = 0 # Any locked fields to get inserted/moved above any other custom fields
      custom_field_ids&.each do |custom_field_id|
        existing_permission_field = fields.find { |field| field[:custom_field_id] == custom_field_id }
        if existing_permission_field.nil?
          # Insert a new one if it's not already there
          new_field = PermissionsField.new(custom_field_id: custom_field_id, required: true, ordering: ordering, permission: permission, lock: lock_type)
          fields.insert(ordering, new_field)
        else
          # Set the existing one to true and move to the top
          existing_permission_field.ordering = ordering
          existing_permission_field.required = true
          existing_permission_field.lock = lock_type
          fields.insert(ordering, fields.delete(existing_permission_field))
        end
        ordering += 1
      end
      fields.each_with_index { |field, index| field.ordering = index }
    end

    def add_related_group_fields(permission, fields)
      return fields unless permission.groups.any?

      custom_field_ids = permission.groups.map { |g| g[:rules].pluck('customFieldId') }.flatten.uniq.compact
      add_and_lock_related_fields(permission, fields, custom_field_ids, 'group')
    end

    def user_confirmation_enabled?
      @user_confirmation_enabled ||= AppConfiguration.instance.feature_activated?('user_confirmation')
    end
  end
end

Permissions::PermissionsFieldsService.prepend(Verification::Patches::Permissions::PermissionsFieldsService)
