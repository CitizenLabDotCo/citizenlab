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
    AUTO_TAGGING_METHODS = %w[language platform_topic nlp_topic sentiment controversial]

    validates :auto_tagging_method, inclusion: { in: AUTO_TAGGING_METHODS }

    def execute
      atm = AutoTaggingMethod::Base.for_auto_tagging_method(auto_tagging_method, analysis, self)
      atm.execute
    end
  end
end
