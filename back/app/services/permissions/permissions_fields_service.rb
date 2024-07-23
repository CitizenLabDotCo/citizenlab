# frozen_string_literal: true

module Permissions
  class PermissionsFieldsService
    def fields_for_permission(permission)
      return permission.permissions_fields unless permission.global_custom_fields


      default_fields(permission)
    end

    # To create fields for the custom permitted_by - we copy the defaults from the previous value of permitted_by
    def persist_default_fields(permission)
      return unless permission.permissions_fields.empty?

      fields = default_fields(permission)
      return unless fields.present?

      fields.each(&:save!)
    end

    def default_fields(permission)
      return [] unless permission.allow_global_custom_fields?

      # TODO: Apply custom fields related to groups and verification here too
      custom_fields = CustomField.where(resource_type: 'User', enabled: true, hidden: false).order(:ordering)
      custom_fields.each_with_index.map do |field, index|
        PermissionsField.new(id: SecureRandom.uuid, custom_field: field, required: field.required, ordering: index, permission: permission)
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

Permissions::PermissionsFieldsService.prepend(Verification::Patches::Permissions::PermissionsFieldsService)
