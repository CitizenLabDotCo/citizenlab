# frozen_string_literal: true

# == Schema Information
#
# Table name: analysis_questions
#
#  id                 :uuid             not null, primary key
#  background_task_id :uuid             not null
#  question           :text
#  answer             :text
#  prompt             :text
#  q_and_a_method     :string           not null
#  accuracy           :float
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  generated_at       :datetime
#
# Indexes
#
#  index_analysis_questions_on_background_task_id  (background_task_id)
#
# Foreign Keys
#
#  fk_rails_...  (background_task_id => analysis_background_tasks.id)
#
module Analysis
  class Question < ::ApplicationRecord
    include Insightable
    include Files::FileAttachable

    Q_AND_A_METHODS = %w[one_pass_llm bogus]

    belongs_to :background_task, class_name: 'Analysis::QAndATask', dependent: :destroy
    has_many :activities, as: :item

    validates :q_and_a_method, inclusion: { in: Q_AND_A_METHODS }
    validates :accuracy, numericality: { in: 0..1 }, allow_blank: true

    def source_project
      insight.analysis.project
    end
  end
end
