# frozen_string_literal: true

module Insights
  class CreateTnaTasksJob < ::ApplicationJob
    queue_as :default

    # @param [Insights::View] view
    def run(view)
      TextNetworkAnalysisService.new.analyse(view)
    end
  end
end
