# frozen_string_literal: true

class McpServer::Serializers::Permission < McpServer::Serializers::Base
  def attributes(record)
    {
      action: record.action,
      # Whether the action still follows the global 'visiting' permission, i.e.
      # the platform-wide sign-in flow, rather than settings of its own.
      # See Permissions::PermissionInheritanceService.
      inherited: record.inherited?,
      permitted_by: record.permitted_by,
      group_ids: record.groups.pluck(:id),
      demographic_questions: record.permissions_custom_fields.map do |pcf|
        { custom_field_id: pcf.custom_field_id, required: pcf.required }
      end,
      require_name: record.require_name,
      require_password: record.require_password,
      require_confirmed_email: record.require_confirmed_email,
      confirmed_email_expiry: record.confirmed_email_expiry,
      require_verification: record.require_verification,
      verification_expiry: record.verification_expiry,
      require_confirmed_phone_number: record.require_confirmed_phone_number,
      confirmed_phone_number_expiry: record.confirmed_phone_number_expiry,
      access_denied_explanation_multiloc: record.access_denied_explanation_multiloc
    }
  end
end
