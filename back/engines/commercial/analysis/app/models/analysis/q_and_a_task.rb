# frozen_string_literal: true

module Analysis
  class QAndATask < BackgroundTask
    belongs_to :analysis, class_name: 'Analysis::Analysis'
    has_one :question, class_name: 'Analysis::Question', foreign_key: :background_task_id
  end
end
