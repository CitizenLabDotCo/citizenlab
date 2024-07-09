# frozen_string_literal: true

module Permissions
  class PermissionsFieldsService
    # To be called from rake task when enabling custom_permitted_by feature flag or on tenant creation
    def change_permissions_to_custom
      if custom_permitted_by_enabled?
        permissions = Permission.all
        permissions.each do |permission|
          if !permission.global_custom_fields
            if permission.permitted_by == 'everyone_confirmed_email'
              # Set to 'custom' & insert 'everyone_confirmed_email' default fields
              permission.update!(permitted_by: 'custom')
              fields = default_fields(permitted_by: 'everyone_confirmed_email', permission: permission)
            elsif permission.permitted_by == 'users' || permission.permitted_by == 'groups'
              # Set to 'custom' & insert 'users' default fields without custom fields
              permission.update!(permitted_by: 'custom')
              fields = default_fields(permitted_by: 'users', permission: permission).reject { |f| f[:field_type] == 'custom_field' }
            end
          elsif permission.permitted_by == 'groups'
            # Set to 'custom' & insert 'users' default fields
            permission.update!(permitted_by: 'custom')
            fields = default_fields(permitted_by: 'users', permission: permission)
          end

          # Save the default fields
          fields.each(&:save!) if fields.present?
        end
      end
    end

    # TODO: JS - Call this from the user custom fields controller as well as the rake task - after save
    def create_or_update_default_fields
      %w[users everyone everyone_confirmed_email].each do |permitted_by|
        permission = Permission.find_or_create_by!(action: 'visiting', permitted_by: permitted_by)
        fields = default_fields(permitted_by: permitted_by, permission: permission)

        # Save or update the default fields for the 'visiting' permissions
        fields.each do |field|
          existing_field = PermissionsField.find_by(permission: permission, field_type: field.field_type, custom_field: field.custom_field)
          if existing_field
            existing_field.update!(field.attributes.except('id', 'created_at', 'updated_at', 'locked'))
          else
            field.save!
          end
        end

        # Remove custom_fields that have been disabled/removed
        custom_field_ids = fields.select { |f| f.field_type == 'custom_field' }.map(&:custom_field_id)
        all_fields = permission.permissions_fields
        all_fields.each do |field|
          if field.custom_field_id.present? && custom_field_ids.exclude?(field.custom_field_id)
            field.destroy!
          end
        end
      end
    end

    # To create fields for the custom permitted_by - we copy the defaults from the previous value of permitted_by
    def create_default_fields_for_custom_permitted_by(permission: nil, previous_permitted_by: 'users')
      return unless permission&.permitted_by == 'custom' && permission&.permissions_fields&.empty?

      fields = default_fields(permitted_by: previous_permitted_by, permission: permission)
      fields.each(&:save!)
    end

    def custom_permitted_by_enabled?
      @custom_permitted_by_enabled ||= AppConfiguration.instance.feature_activated?('custom_permitted_by')
    end

    private

    def default_fields(permitted_by: 'users', permission: nil)
      # Built in fields
      name_field = PermissionsField.new(field_type: 'name', required: true, enabled: true, permission: permission)
      email_field = PermissionsField.new(field_type: 'email', required: true, enabled: true, locked: true, permission: permission, config: { password: true, confirmed: true })

      # Global custom fields
      custom_fields = CustomField.where(resource_type: 'User', enabled: true, hidden: false).order(:ordering)
      custom_permissions_fields = custom_fields.map do |field|
        PermissionsField.new(field_type: 'custom_field', custom_field: field, required: field.required, enabled: true, permission: permission)
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
  end
end
