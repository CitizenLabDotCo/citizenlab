# frozen_string_literal: true

# Flat per-field projection of a form CustomField.
#
# Wraps WebApi::V1::CustomFieldSerializer so conditional attributes (page_layout when
# the field is a page, linear_scale_label_*_multiloc when the input type supports it,
# etc.) flow through automatically. Options and matrix statements are inlined; other
# relationships (resource, map_config) surface as IDs by default.
#
# Per-field `constraints` is stripped — the form-fields tools surface the form-wide
# constraints map at the envelope level (constraints come from the participation
# method, not from individual fields). Callers should pass `params: { constraints: nil }`
# to suppress the upstream's per-field constraints computation.
class McpServer::Serializers::CustomField < McpServer::Serializers::Base
  wraps ::WebApi::V1::CustomFieldSerializer

  inline :options, :matrix_statements

  # def attributes(record)
  #   # super.except(:constraints)
  #   super
  # end
end
