# frozen_string_literal: true

# == Schema Information
#
# Table name: analysis_summaries
#
#  id                   :uuid             not null, primary key
#  background_task_id   :uuid             not null
#  summary              :text
#  prompt               :text
#  summarization_method :string           not null
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  accuracy             :float
#
# Indexes
#
#  index_analysis_summaries_on_background_task_id  (background_task_id)
#
# Foreign Keys
#
#  fk_rails_...  (background_task_id => analysis_background_tasks.id)
#
module Analysis
  class Summary < ::ApplicationRecord
    include Insightable
    SUMMARIZATION_METHODS = %w[gpt one_pass_llm bogus] # gpt is legacy value

    belongs_to :background_task, class_name: 'Analysis::SummarizationTask', dependent: :destroy

    validates :summarization_method, inclusion: { in: SUMMARIZATION_METHODS }
    validates :accuracy, numericality: { in: 0..1 }, allow_blank: true
  end
end
