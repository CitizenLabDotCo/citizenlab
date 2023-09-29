# frozen_string_literal: true

module Analysis
  module HasFilters
    extend ActiveSupport::Concern

    FILTERS_JSON_SCHEMA_STR = Rails.root.join('engines/commercial/analysis/config/schemas/filters.json_schema').read
    FILTERS_JSON_SCHEMA = JSON.parse(FILTERS_JSON_SCHEMA_STR)
    included do
      validates :filters, json: { schema: FILTERS_JSON_SCHEMA }

      scope :filters_with_tag_id, ->(tag_id) { where("filters->'tag_ids' ? :tag_id", tag_id: tag_id) }
      scope :filters_with_custom_field_id, lambda { |custom_field_id|
        where("(
          filters ? 'author_custom_#{custom_field_id}' OR
          filters ? 'author_custom_#{custom_field_id}_from' OR
          filters ? 'author_custom_#{custom_field_id}_to' OR
          filters ? 'input_custom_#{custom_field_id}' OR
          filters ? 'input_custom_#{custom_field_id}_from' OR
          filters ? 'input_custom_#{custom_field_id}_to'
          )")
      }

      def self.delete_tag_references!(tag_id)
        filters_with_tag_id(tag_id).each do |object|
          object.filters['tag_ids'].delete(tag_id)
          object.save!
        end
      end

      def self.delete_custom_field_references!(custom_field_id)
        filters_with_custom_field_id(custom_field_id).each do |object|
          object.filters.reject! { |k, _v| k.match?(/^(author|input)_custom_#{custom_field_id}.*$/) }
          object.save!
        end
      end
    end
  end
end
