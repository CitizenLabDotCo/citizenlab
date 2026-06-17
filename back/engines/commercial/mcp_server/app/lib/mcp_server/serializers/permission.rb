# frozen_string_literal: true

class McpServer::Serializers::Permission < McpServer::Serializers::Base
  def attributes(record)
    {
      action: record.action,
      permitted_by: record.permitted_by,
      group_ids: record.groups.pluck(:id),
      demographic_questions: record.permissions_custom_fields.map do |pcf|
        { custom_field_id: pcf.custom_field_id, required: pcf.required }
      end,
      verification_expiry: record.verification_expiry,
      access_denied_explanation_multiloc: record.access_denied_explanation_multiloc
    }
  end
end
