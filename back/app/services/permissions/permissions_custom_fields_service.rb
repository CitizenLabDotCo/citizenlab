# frozen_string_literal: true

module Permissions
  class PermissionsCustomFieldsService
    def fields_for_permission(permission, return_hidden: false)
      # We do not support user fields for 'everyone' unless the participation method supports it and it is turned on
      return [] if permission.permitted_by == 'everyone' && !permission.user_fields_in_form_enabled?

      fields = if permission.global_custom_fields
        default_fields(permission)
      else
        permission.permissions_custom_fields.to_a
      end

      fields = add_related_group_fields(permission, fields)

      fields = add_verification_fields(permission, fields) if return_hidden && permission.verification_enabled?

      fields
    end

    # To create fields for the custom permitted_by - we copy the defaults from the previous value of permitted_by
    def persist_default_fields(permission)
      return unless permission.global_custom_fields && permission.permissions_custom_fields.empty?

      # First update global custom fields to false
      permission.update!(global_custom_fields: false)

      # Now create the default fields
      fields = default_fields(permission)
      return if fields.blank?

      fields.each(&:save!)
    end

    private

    def default_fields(permission)
      return [] unless permission.allow_global_custom_fields?

      platform_custom_fields.each_with_index.map do |field, index|
        PermissionsCustomField.new(id: SecureRandom.uuid, custom_field: field, required: field.required, ordering: index, permission: permission)
      end
    end

    # Add non-persisted locked fields to the permission if they don't exist & ensure they appear at the start of the list
    def add_and_lock_related_fields(permission, permission_custom_fields, custom_field_required_array, lock_type)
      ordering = 0 # Any locked fields to get inserted/moved above any other custom fields
      insert_before = lock_type != 'group' # Group fields should be added at the end
      custom_field_required_array&.each do |field|
        custom_field_id = field[:id]
        required = field[:required]
        existing_permissions_custom_field = permission_custom_fields.find { |f| f[:custom_field_id] == custom_field_id }
        if existing_permissions_custom_field.nil?
          # Insert a new one if it's not already there
          new_field = PermissionsCustomField.new(id: SecureRandom.uuid, custom_field_id: custom_field_id, required: required, permission: permission, lock: lock_type)
          if insert_before
            new_field.ordering = ordering
            permission_custom_fields.insert(ordering, new_field)
          else
            permission_custom_fields << new_field
          end
        else
          # Set the existing one to true and move to the top
          existing_permissions_custom_field.required = required
          existing_permissions_custom_field.lock = lock_type
          if insert_before
            existing_permissions_custom_field.ordering = ordering
            permission_custom_fields.insert(ordering, permission_custom_fields.delete(existing_permissions_custom_field))
          end
        end
        ordering += 1
      end
      permission_custom_fields.each_with_index { |field, index| field.ordering = index }
    end

    def add_related_group_fields(permission, fields)
      return fields unless permission.groups.any?

      # Extract custom field ids and whether they should be required from rules and then remove any that don't exist
      custom_fields_required_array = extract_custom_field_ids_from_rules(permission.groups)
      custom_fields = CustomField.where(id: custom_fields_required_array.pluck(:id)).pluck(:id)
      custom_fields_required_array.each do |field|
        custom_fields_required_array.delete(field) unless custom_fields.include?(field[:id])
      end
      add_and_lock_related_fields(permission, fields, custom_fields_required_array, 'group')
    end

    def extract_custom_field_ids_from_rules(groups)
      custom_field_ids = groups.map { |g| g[:rules].pluck('customFieldId') }.flatten.uniq.compact
      custom_fields_required = custom_field_ids.map { |id| { id: id, required: true } }
      # Set required to false if the rule is is_empty at any point
      custom_fields_required.each do |field|
        groups.each do |g|
          g[:rules].each do |r|
            if field[:id] == r['customFieldId'] && r['predicate'] == 'is_empty'
              field[:required] = false
            end
          end
        end
      end
      custom_fields_required
    end

    def platform_custom_fields
      @platform_custom_fields ||= CustomField.where(resource_type: 'User', enabled: true, hidden: false).order(:ordering)
    end

    def user_confirmation_enabled?
      @user_confirmation_enabled ||= AppConfiguration.instance.feature_activated?('user_confirmation')
    end

    # Add any fields that are locked to verification method
    def add_verification_fields(permission, fields)
      method = Verification::VerificationService.new.first_method_enabled
      return fields unless method.respond_to?(:locked_custom_fields) && method.locked_custom_fields.present?

      # Get the IDs of the custom fields that are locked to the verification method
      custom_field_required_array = CustomField.where(code: method.locked_custom_fields).map do |field|
        { id: field.id, required: true }
      end

      add_and_lock_related_fields(permission, fields, custom_field_required_array, 'verification')
    end
  end
end
