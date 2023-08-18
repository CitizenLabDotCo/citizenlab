# frozen_string_literal: true

module Analysis
  class Question < ::ApplicationRecord
    include Insightable
    Q_AND_A_METHODS = %w[one_pass_llm bogus]

    belongs_to :background_task, class_name: 'Analysis::QAndATask', dependent: :destroy

    validates :q_and_a_method, inclusion: { in: Q_AND_A_METHODS }
    validates :accuracy, numericality: { in: 0..1 }, allow_blank: true
  end
end
