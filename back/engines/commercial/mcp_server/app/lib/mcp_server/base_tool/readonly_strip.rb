# frozen_string_literal: true

module McpServer::BaseTool::ReadonlyStrip
  module_function

  # JSON Schema marks server-owned keys with `readOnly: true` (declared so tool output
  # can be echoed back as input). Enforce the "ignored on input" semantics: drop them
  # from the data, walking nested object properties and array items.
  def strip_readonly(data, schema)
    case data
    when Hash
      # Open objects (no declared properties, e.g. multilocs) pass through untouched.
      properties = schema[:properties]
      return data unless properties

      # data.class: preserve HWIA vs plain Hash.
      data.each_with_object(data.class.new) do |(key, value), result|
        # Data keys arrive as strings or symbols; schema keys are symbols.
        property = properties[key.to_sym] || {}
        next if property[:readOnly]

        result[key] = strip_readonly(value, property)
      end
    when Array
      item_schema = schema[:items]
      return data unless item_schema

      data.map { |item| strip_readonly(item, item_schema) }
    else
      data
    end
  end
end
