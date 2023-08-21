# frozen_string_literal: true

module Analysis
  class Insight < ::ApplicationRecord
    FILTERS_JSON_SCHEMA_STR = Rails.root.join('engines/commercial/analysis/config/schemas/filters.json_schema').read
    FILTERS_JSON_SCHEMA = JSON.parse(FILTERS_JSON_SCHEMA_STR)

    belongs_to :analysis, class_name: 'Analysis::Analysis'
    delegated_type :insightable, types: %w[Analysis::Summary Analysis::Question], dependent: :destroy

    validates :filters, json: { schema: FILTERS_JSON_SCHEMA }
    validate :inputs_ids_unique

    scope :filters_with_tag_id, ->(tag_id) { where("filters->'tag_ids' ? :tag_id", tag_id: tag_id) }
    scope :filters_with_custom_field_id, lambda { |custom_field_id|
      where("(
        filters ? 'author_custom_#{custom_field_id}' OR
        filters ? 'author_custom_#{custom_field_id}_from' OR
        filters ? 'author_custom_#{custom_field_id}_to'
        )")
    }

    def self.delete_tag_references!(tag_id)
      filters_with_tag_id(tag_id).each do |summary|
        summary.filters['tag_ids'].delete(tag_id)
        summary.save!
      end
    end

    def self.delete_custom_field_references!(custom_field_id)
      filters_with_custom_field_id(custom_field_id).each do |summary|
        summary.filters.reject! { |k, _v| k.match?(/^author_custom_#{custom_field_id}.*$/) }
        summary.save!
      end
    end

    def inputs_ids_unique
      return if inputs_ids.blank?

      if inputs_ids.uniq != inputs_ids
        errors.add(:inputs_ids, :should_have_unique_ids, message: 'The log of inputs_ids associated with the summary contains duplicate ids')
      end
    end
  end
end
