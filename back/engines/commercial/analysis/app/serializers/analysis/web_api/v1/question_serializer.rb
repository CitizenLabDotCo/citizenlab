# frozen_string_literal: true

class Analysis::WebApi::V1::QuestionSerializer < WebApi::V1::BaseSerializer
  set_type :analysis_question

  attributes :filters, :question, :answer, :accuracy, :created_at, :updated_at
  belongs_to :background_task, class_name: 'Analysis::BackgroundTask'
end
