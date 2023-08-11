# frozen_string_literal: true

class Analysis::WebApi::V1::SummaryPreCheckSerializer < WebApi::V1::BaseSerializer
  set_type :summary_pre_check

  attributes(:accuracy, :impossible_reason)
end
