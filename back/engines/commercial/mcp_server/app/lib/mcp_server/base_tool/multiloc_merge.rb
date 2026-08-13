# frozen_string_literal: true

# Runtime helper for partial multiloc updates. `*_multiloc` attributes are deep-merged
# per locale with the record's current value (locales the caller didn't pass are kept);
# all other attributes pass through unchanged.
#   {en: 'Hi', fr: 'Bonjour'} + {fr: 'Salut', es: 'Hola'} -> {en: 'Hi', fr: 'Salut', es: 'Hola'}
module McpServer::BaseTool::MultilocMerge
  private

  def merge_multilocs(record, attributes)
    attributes.to_h do |key, value|
      next [key, value] unless multiloc?(key)
      # An explicit `nil` clears the multiloc (only reachable where the schema allows
      # null). Cleared means `{}` as multiloc columns can carry NOT NULL constraints.
      next [key, {}] if value.nil?

      current_value = record[key]
      [key, current_value.blank? ? value : current_value.merge(value)]
    end
  end

  def multiloc?(key) = key.to_s.end_with?('_multiloc')
end
