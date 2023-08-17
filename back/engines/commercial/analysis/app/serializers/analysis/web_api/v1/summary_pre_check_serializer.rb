# frozen_string_literal: true

class Analysis::WebApi::V1::SummaryPreCheckSerializer < WebApi::V1::BaseSerializer
  attributes(:accuracy, :impossible_reason)
end
