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
#  filters             :jsonb
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
  class SummarizationTask < BackgroundTask
    belongs_to :analysis, class_name: 'Analysis::Analysis'
    has_one :summary, class_name: 'Analysis::Summary', foreign_key: :background_task_id
  end
end
