# frozen_string_literal: true

class Analysis::WebApi::V1::QuestionPreCheckSerializer < WebApi::V1::BaseSerializer
  attributes(:accuracy, :impossible_reason)
end
