# frozen_string_literal: true

# == Schema Information
#
# Table name: analysis_summaries
#
#  id                   :uuid             not null, primary key
#  analysis_id          :uuid             not null
#  background_task_id   :uuid             not null
#  summary              :text
#  prompt               :text
#  summarization_method :string           not null
#  filters              :jsonb            not null
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  accuracy             :float
#  inputs_ids           :jsonb
#
# Indexes
#
#  index_analysis_summaries_on_analysis_id         (analysis_id)
#  index_analysis_summaries_on_background_task_id  (background_task_id)
#
# Foreign Keys
#
#  fk_rails_...  (analysis_id => analysis_analyses.id)
#  fk_rails_...  (background_task_id => analysis_background_tasks.id)
#
module Analysis
  class Summary < ::ApplicationRecord
    SUMMARIZATION_METHODS = %w[gpt one_pass_llm bogus] # gpt is legacy value
    FILTERS_JSON_SCHEMA_STR = Rails.root.join('engines/commercial/analysis/config/schemas/filters.json_schema').read
    FILTERS_JSON_SCHEMA = JSON.parse(FILTERS_JSON_SCHEMA_STR)

    belongs_to :analysis, class_name: 'Analysis::Analysis'
    belongs_to :background_task, class_name: 'Analysis::SummarizationTask', dependent: :destroy

    validates :summarization_method, inclusion: { in: SUMMARIZATION_METHODS }
    validates :filters, json: { schema: FILTERS_JSON_SCHEMA }
    validates :accuracy, numericality: { in: 0..1 }, allow_blank: true
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
