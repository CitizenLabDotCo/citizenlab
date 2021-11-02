# frozen_string_literal: true

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
