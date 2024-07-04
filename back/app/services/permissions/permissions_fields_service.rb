# frozen_string_literal: true

module Permissions
  class PermissionsFieldsService
    def initialize(permission)
      @permission = permission
    end

    def fields
      if custom_permitted_by_enabled?
        fields = @permission.permitted_by == 'custom' ? @permission.permissions_fields : default_fields(permitted_by: @permission.permitted_by)
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

    def insert_default_fields_for_permitted_by(permitted_by)
      insert_default_fields(fields: default_fields(permitted_by: permitted_by))
    end

    # Update permissions and insert the correct default fields for EXISTING permitted_by values
    # This is feature flagged at the moment - called only from the permissions controller
    # TODO: JS - When enabled for all users this will need to be need called from a rake task instead
    def convert_permission_to_custom_permitted_by
      if custom_permitted_by_enabled?
        if !@permission.global_custom_fields && @permission.permitted_by == 'everyone_confirmed_email'
          # Set to custom & insert fields without custom fields from 'everyone_confirmed_email' defaults
          @permission.update!(permitted_by: 'custom')
          fields = default_fields(permitted_by: 'everyone_confirmed_email').reject { |f| f[:field_type] == 'custom_field' }
          insert_default_fields(fields: fields)
        elsif %w[users groups].include?(@permission.permitted_by) && !@permission.global_custom_fields
          # Set to 'custom' & insert default fields without custom fields
          @permission.update!(permitted_by: 'custom')
          fields = default_fields.reject { |f| f[:field_type] == 'custom_field' }
          insert_default_fields(fields: fields)
        elsif @permission.permitted_by == 'groups'
          # Set to 'custom' & insert default fields
          @permission.update!(permitted_by: 'custom')
          insert_default_fields
        end
      end
    end

    private

    def lock_fields(permissions_fields)
      # TODO: JS - Hide the correct fields - do in later PR
      # TODO: JS - Add in ordering?
      # TODO: JS - Add in the groups here too as they will influence whether a field is locked - indeed a field may need to be added
      # We can create the group relationship in the model, but populate it on the fly here
      # LOCKED_TYPES = {
      #   'posting_idea' => %w[email]
      # }.freeze
      #
      # def locked
      #   LOCKED_TYPES[permission.action]&.include?(field_type)
      # end
      # Email is locked + required if password is added
      permissions_fields
    end

    def default_fields(permitted_by: 'users')
      # Built in fields
      name_field = PermissionsField.new(field_type: 'name', required: true, enabled: true, permission: @permission)
      email_field = PermissionsField.new(field_type: 'email', required: true, enabled: true, locked: true, permission: @permission, config: { password: true, confirmed: true })

      # Global custom fields
      custom_fields = CustomField.where(resource_type: 'User', enabled: true, hidden: false).order(:ordering)
      custom_permissions_fields = custom_fields.map do |field|
        PermissionsField.new(field_type: 'custom_field', custom_field: field, required: field.required, enabled: true, permission: @permission)
      end

      default_fields = [email_field, name_field] + custom_permissions_fields

      case permitted_by
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
    end

    def custom_permitted_by_enabled?
      @custom_permitted_by_enabled ||= AppConfiguration.instance.feature_activated?('custom_permitted_by')
    end
  end
end
