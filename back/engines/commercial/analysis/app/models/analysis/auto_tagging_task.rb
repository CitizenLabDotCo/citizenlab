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
    AUTO_TAGGING_METHODS = %w[language platform_topic nlp_topic sentiment controversial label_classification]

    validates :auto_tagging_method, inclusion: { in: AUTO_TAGGING_METHODS }
    validates :tags_ids, presence: true, if: :method_with_tags_ids?
    validate :validate_tags_ids, if: :method_with_tags_ids?

    def execute
      atm = AutoTaggingMethod::Base.for_auto_tagging_method(auto_tagging_method, self)
      atm.execute
    end

    private

    def method_with_tags_ids?
      %w[label_classification].include?(auto_tagging_method)
    end

    def validate_tags_ids
      unless tags_ids.is_a?(Array)
        errors.add(:tags_ids, :not_an_array, "tags_ids must be an array for autotagging_method #{autotagging_method}")
        return
      end

      if tags_ids.size > 10
        errors.add(:tags_ids, :too_long, 'tags_ids can not be longer than 10')
      end
    end
  end
end
