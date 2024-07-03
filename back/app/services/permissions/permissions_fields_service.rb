# frozen_string_literal: true

module Permissions
  class PermissionsFieldsService
    def initialize(permission)
      @permission = permission
    end

    def fields
      if custom_permitted_by_enabled?
        fields = @permission.permitted_by == 'custom' ? @permission.permissions_fields : default_fields
        lock_fields(fields)
      else
        # To support the old permitted_by values and screens
        @permission.permissions_fields.where(field_type: 'custom_field')
      end
    end

    # Insert default fields for new permissions
    # Called only when changing a permitted_by to 'custom' + in tests
    def insert_default_fields(fields: default_fields)
      return unless custom_permitted_by_enabled? && @permission.permitted_by == 'custom'

      fields.each(&:save!)
    end

    # Update permissions and insert the correct default fields for EXISTING permitted_by values
    # This is feature flagged at the moment - called only from the permissions controller
    # TODO: JS - When enabled for all users this will need to be need called from a rake task instead
    def convert_permission_to_custom_permitted_by
      if custom_permitted_by_enabled?
        if @permission.permitted_by == 'everyone_confirmed_email'
          @permission.update!(permitted_by: 'custom')
          # Remove the password from defaults
          fields = default_fields.reject { |f| f[:field_type] == 'password' }

          # Remove custom fields if using global custom fields
          fields = fields.reject { |f| f[:field_type] == 'custom_field' } if @permission.global_custom_fields

          insert_default_fields(fields: fields)
        elsif %w[users groups].include?(@permission.permitted_by) && !@permission.global_custom_fields
          @permission.update!(permitted_by: 'custom')
          # Insert default fields without custom fields
          fields = default_fields.reject { |f| f[:field_type] == 'custom_field' }
          insert_default_fields(fields: fields)
        elsif @permission.permitted_by == 'groups'
          @permission.update!(permitted_by: 'custom')
          # Insert default fields
          insert_default_fields
        end
      end
    end

    private

    def lock_fields(permissions_fields)
      # TODO: JS - Hide the correct fields

      # LOCKED_TYPES = {
      #   'posting_idea' => %w[email]
      # }.freeze
      #
      # def locked
      #   LOCKED_TYPES[permission.action]&.include?(field_type)
      # end
      # Email is locked + required if password is added

      permissions_fields.map do |permissions_field|
        # permissions_field.locked = true
        permissions_field
      end
    end

    def default_fields
      # Built in fields
      name_field = PermissionsField.new(field_type: 'name', required: true, verified: false, enabled: true, permission: @permission)
      email_field = PermissionsField.new(field_type: 'email', required: true, verified: true, enabled: true, locked: true, permission: @permission)
      password_field = PermissionsField.new(field_type: 'password', required: true, verified: false, enabled: true, permission: @permission)

      # Global custom fields
      custom_fields = CustomField.where(resource_type: 'User', enabled: true, hidden: false).order(:ordering)
      custom_permissions_fields = custom_fields.map do |field|
        PermissionsField.new(field_type: 'custom_field', custom_field: field, required: field.required, verified: false, enabled: true, permission: @permission)
      end

      [email_field, password_field, name_field] + custom_permissions_fields
    end

    def custom_permitted_by_enabled?
      @custom_permitted_by_enabled ||= AppConfiguration.instance.feature_activated?('custom_permitted_by')
    end
  end
end
