# frozen_string_literal: true

module Insights
  # Creates classification tasks to suggest categories for some inputs.
  class CreateClassificationTasksJob < ::ApplicationJob
    queue_as :default
    
    # If +categories+ or +inputs+ are not specified, all the categories and 
    # all the inputs (in the scope) of the the view are used respectively. (So
    # +view+ must be provided if +inputs+ or +categories+ is not specified.)
    #
    # @param [Enumerable<Insights::Category>, nil] categories
    # @param [Insights::View, nil] view
    def run(inputs: nil, categories: nil, view: nil, suggestion_service: nil)
      inputs ||= view.scope.ideas
      categories ||= view.categories

      return if inputs.blank? || categories.blank?

      suggestion_service ||= CategorySuggestionsService.new
      suggestion_service.classify(inputs, categories)
    end
  end
end
