# frozen_string_literal: true

class Analysis::WebApi::V1::InsightSerializer < WebApi::V1::BaseSerializer
  attributes :filters, :created_at, :updated_at
  # belongs_to :insightable, serializer: Proc.new do |insight, _params|
  #   if insight.summary?
  #     SummarySerializer
  #   elsif insight.question?
  #     QuestionSerializer
  #   else
  #     raise "Unsupported insightable #{insight.insightable_type} in InsightSerializer"
  #   end
  # end
  belongs_to :insightable, polymorphic: true
end
