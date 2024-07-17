# frozen_string_literal: true

module Permissions
  class PermissionsFieldsService
    def fields_for_permission(permission)
      return permission.permissions_fields.where(field_type: 'custom_field') unless custom_permitted_by_enabled?
      return permission.permissions_fields if permission.permitted_by == 'custom'

      default_fields(permitted_by: permission.permitted_by, permission: permission)
    end

    # To create fields for the custom permitted_by - we copy the defaults from the previous value of permitted_by
    def create_default_fields_for_custom_permitted_by(permission: nil, previous_permitted_by: 'users')
      return unless permission&.permitted_by == 'custom' && permission&.permissions_fields&.empty?

      # We cannot currently configure a 'custom' permitted_by with 'everyone' settings
      previous_permitted_by = 'everyone_confirmed_email' if previous_permitted_by == 'everyone'

      fields = default_fields(permitted_by: previous_permitted_by, permission: permission)
      fields.each(&:save!)
    end

    def default_fields(permitted_by: 'users', permission: nil)
      # Built in fields
      name_field = PermissionsField.new(field_type: 'name', required: true, enabled: true, permission: permission)
      email_field = PermissionsField.new(field_type: 'email', required: true, enabled: true, locked: true, permission: permission, config: { password: true, confirmed: user_confirmation_enabled? })

      # Global custom fields
      custom_fields = CustomField.where(resource_type: 'User', enabled: true, hidden: false).order(:ordering)
      custom_permissions_fields = custom_fields.map do |field|
        PermissionsField.new(field_type: 'custom_field', custom_field: field, required: field.required, enabled: true, permission: permission)
      end

      default_fields = [name_field, email_field] + custom_permissions_fields

      fields = case permitted_by
      when 'everyone'
        # Remove custom fields and disable all fields
        fields = default_fields.reject { |f| f[:field_type] == 'custom_field' }
        fields.map do |field|
          field.required = false
          field.enabled = false
          field
        end
      when 'everyone_confirmed_email'
        # Turn off custom_fields, name & password
        fields = default_fields.reject { |f| f[:field_type] == 'custom_field' }
        fields.find { |f| f.field_type == 'name' }.enabled = false
        fields.find { |f| f.field_type == 'name' }.required = false
        fields.find { |f| f.field_type == 'email' }.config['password'] = false
        fields
      else
        default_fields
      end

      # Return with ordering & an ID
      fields.map.with_index do |field, index|
        field.id = SecureRandom.uuid
        field.ordering = index
        field
      end
    end

    # Called on update of individual fields to change values in others that are dependent
    def enforce_restrictions(field)
      permission = field.permission
      if field.field_type == 'email'
        if field.config['password'] == false
          # When password is disabled, name should also be automatically disabled
          permission.permissions_fields.find_by(field_type: 'name').update!(enabled: false, required: false)
        else
          # When password is enabled, name should also be automatically enabled
          permission.permissions_fields.find_by(field_type: 'name').update!(enabled: true, required: true)
        end

        # Confirmation should currently always match platform default
        if field.config['confirmed'] != user_confirmation_enabled?
          field.config['confirmed'] = user_confirmation_enabled?
          field.save!
        end
      end
    end

    def custom_permitted_by_enabled?
      @custom_permitted_by_enabled ||= AppConfiguration.instance.feature_activated?('custom_permitted_by')
    end

    private

    def user_confirmation_enabled?
      @user_confirmation_enabled ||= AppConfiguration.instance.feature_activated?('user_confirmation')
    end
  end
end
