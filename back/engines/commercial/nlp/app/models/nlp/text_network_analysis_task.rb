# frozen_string_literal: true

# == Schema Information
#
# Table name: nlp_text_network_analysis_tasks
#
#  id            :uuid             not null, primary key
#  task_id       :string           not null
#  handler_class :string           not null
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
# Indexes
#
#  index_nlp_text_network_analysis_tasks_on_task_id  (task_id) UNIQUE
#
module NLP
  class TextNetworkAnalysisTask < ::ApplicationRecord
    validates :task_id, presence: true, uniqueness: true
    validates :handler_class, presence: true
    validate :validate_handler

    def validate_handler
      handler_class.constantize
    rescue NameError => e
      errors.add(:handler_class, e.message)
    end
  end
end
