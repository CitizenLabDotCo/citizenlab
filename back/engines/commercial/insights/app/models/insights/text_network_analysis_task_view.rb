# frozen_string_literal: true

module Insights
  class TextNetworkAnalysisTaskView < ::ApplicationRecord
    self.table_name = 'insights_text_network_analysis_tasks_views'

    belongs_to :task, class_name: 'NLP::TextNetworkAnalysisTask'
    belongs_to :view, class_name: 'Insights::View'

    validates :task, presence: true
    validates :view, presence: true
    validates :language, presence: true
  end
end
