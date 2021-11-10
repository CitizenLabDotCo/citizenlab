# frozen_string_literal: true

# == Schema Information
#
# Table name: insights_text_network_analysis_tasks_views
#
#  id         :uuid             not null, primary key
#  task_id    :uuid             not null
#  view_id    :uuid             not null
#  language   :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_insights_text_network_analysis_tasks_views_on_task_id  (task_id)
#  index_insights_text_network_analysis_tasks_views_on_view_id  (view_id)
#
# Foreign Keys
#
#  fk_rails_...  (task_id => nlp_text_network_analysis_tasks.id)
#  fk_rails_...  (view_id => insights_views.id)
#
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
