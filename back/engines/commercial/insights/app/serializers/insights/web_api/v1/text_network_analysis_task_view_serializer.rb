# frozen_string_literal: true

module Insights
  module WebApi
    module V1
      class TextNetworkAnalysisTaskViewSerializer < ::WebApi::V1::BaseSerializer
        set_type :text_network_analysis_task

        attributes :language, :created_at
      end
    end
  end
end
