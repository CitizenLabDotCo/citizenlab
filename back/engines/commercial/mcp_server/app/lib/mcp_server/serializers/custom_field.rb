# frozen_string_literal: true

class McpServer::Serializers::CustomField < McpServer::Serializers::Base
  wraps ::WebApi::V1::CustomFieldSerializer

  inline :options, :matrix_statements

  # Drop the per-field `constraints` emitted by the web serializer: get_form_fields
  # reports constraints at the top level, and `constraints` is not a CustomField
  # attribute, so echoing it back would crash replace_form_fields' round-trip.
  def attributes(record)
    super.except(:constraints)
  end
end
