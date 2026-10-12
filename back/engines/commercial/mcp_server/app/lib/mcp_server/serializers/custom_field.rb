# frozen_string_literal: true

class McpServer::Serializers::CustomField < McpServer::Serializers::Base
  wraps ::WebApi::V1::CustomFieldSerializer

  inline :options, :matrix_statements

  # Serialized fields must remain valid input for the form-update tools, so drop what
  # their schema does not accept: `constraints` is a params-derived value rather than
  # a CustomField attribute (it is reported at the form level instead), and
  # `answers_visible_to` is not exposed through MCP until the feature is released.
  def attributes(record)
    super.except(:constraints, :answers_visible_to)
  end
end
