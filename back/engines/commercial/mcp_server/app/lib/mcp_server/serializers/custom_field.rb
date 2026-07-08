# frozen_string_literal: true

class McpServer::Serializers::CustomField < McpServer::Serializers::Base
  wraps ::WebApi::V1::CustomFieldSerializer

  inline :options, :matrix_statements

  # The web serializer emits `constraints`, a params-derived value that is not a
  # CustomField attribute. Drop it: serialized fields must remain valid input for
  # the form-update tools (constraints are reported at the form level instead).
  def attributes(record)
    super.except(:constraints)
  end
end
