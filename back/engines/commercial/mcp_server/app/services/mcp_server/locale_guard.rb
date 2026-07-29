# frozen_string_literal: true

# Call-time replacement for the per-tenant locale enum that multiloc schemas used to
# carry (dropped to keep tool definitions tenant-agnostic, see BaseTool::Multiloc).
# Scans tool arguments recursively for `*_multiloc` hashes and rejects locales that
# are not active on the platform, with an error message the LLM can self-correct from.
#
# Recursion means nested multilocs are covered too (update_resource's free-form
# `attributes` hash, replace_form_fields' field list) — places the schema enum never
# reached.
module McpServer::LocaleGuard
  def self.error_message(arguments)
    active = AppConfiguration.instance.settings.dig('core', 'locales') || []
    invalid = invalid_locales(arguments, active).uniq
    return if invalid.empty?

    "Invalid locale(s) #{invalid.join(', ')} in *_multiloc fields. " \
      "The platform's active locales are: #{active.join(', ')}."
  end

  def self.invalid_locales(node, active)
    case node
    when Hash
      node.flat_map do |key, value|
        if key.to_s.end_with?('_multiloc') && value.is_a?(Hash)
          value.keys.map(&:to_s) - active
        else
          invalid_locales(value, active)
        end
      end
    when Array
      node.flat_map { |item| invalid_locales(item, active) }
    else
      []
    end
  end
end
