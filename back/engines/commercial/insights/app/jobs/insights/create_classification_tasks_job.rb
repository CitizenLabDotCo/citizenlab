# frozen_string_literal: true

module Insights
  class CreateClassificationTasksJob < ::ApplicationJob
    queue_as :insights

    # +view+ must be provided if +inputs+ or +categories+ is not specified.
    #
    # @param [Enumerable<Insights::Category>, nil] categories
    # @param [Insights::View, nil] view
    def run(inputs: nil, categories: nil, view: nil, suggestion_service: nil)
      inputs ||= view.scope.ideas
      categories ||= view.categories
      suggestion_service ||= CategorySuggestionsService.new

      return if inputs.blank? || categories.blank?

      suggestion_service.classify(inputs, categories)
    end
  end
end
