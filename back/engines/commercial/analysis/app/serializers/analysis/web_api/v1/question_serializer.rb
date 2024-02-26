# frozen_string_literal: true

class Analysis::WebApi::V1::QuestionSerializer < WebApi::V1::BaseSerializer
  set_type :analysis_question

  attributes :filters, :custom_field_ids, :question, :answer, :accuracy, :created_at, :updated_at, :missing_inputs_count, :generated_at
  attribute :inputs_count do |question|
    question.inputs_ids.size
  end
  
  belongs_to :background_task, class_name: 'Analysis::BackgroundTask'
end
