# frozen_string_literal: true

module Insights
  class DetectCategoriesJob < ::ApplicationJob
    queue_as :default

    # @param [Insights::View] view
    def run(view)
      category_detection_service ||= CategoryDetectionService.new
      category_detection_service.detect_categories(view)
    end
  end
end
