# frozen_string_literal: true

# == Schema Information
#
# Table name: analysis_background_tasks
#
#  id                  :uuid             not null, primary key
#  analysis_id         :uuid             not null
#  type                :string           not null
#  state               :string           not null
#  progress            :float
#  started_at          :datetime
#  ended_at            :datetime
#  auto_tagging_method :string
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#  tags_ids            :jsonb
#  filters             :jsonb            not null
#  last_error_class    :string
#
# Indexes
#
#  index_analysis_background_tasks_on_analysis_id  (analysis_id)
#
# Foreign Keys
#
#  fk_rails_...  (analysis_id => analysis_analyses.id)
#
module Analysis
  class AutoTaggingTask < BackgroundTask
    include HasFilters

    AUTO_TAGGING_METHODS = %w[language platform_topic nlp_topic sentiment controversial label_classification few_shot_classification]

    # We do dependent: nil because even if the reference is broken, the fact
    # that the tagging has a value still gives us the information that is was
    # not created manually
    has_many :taggings, foreign_key: 'background_task_id', dependent: nil

    validates :auto_tagging_method, inclusion: { in: AUTO_TAGGING_METHODS }
    validates :tags_ids, presence: true, if: :method_with_tags_ids?

    validate :validate_tags_ids, if: :method_with_tags_ids?

    def execute
      atm = AutoTaggingMethod::Base.for_auto_tagging_method(auto_tagging_method, self)
      atm.execute
    end

    def self.delete_custom_field_references!(custom_field_id)
      delete_custom_field_references_in_filters!(custom_field_id)
    end

    private

    def method_with_tags_ids?
      %w[label_classification few_shot_classification].include?(auto_tagging_method)
    end

    def validate_tags_ids
      unless tags_ids.is_a?(Array)
        errors.add(:tags_ids, :not_an_array, "tags_ids must be an array for autotagging_method #{auto_tagging_method}")
      end
    end
  end
end
