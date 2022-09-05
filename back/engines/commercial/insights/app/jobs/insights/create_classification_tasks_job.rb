# frozen_string_literal: true

module Insights
  # Creates classification tasks to suggest categories for some inputs.
  class CreateClassificationTasksJob < ::ApplicationJob
    queue_as :default

    # If +categories+ are not specified, all the categories of the view are used.
    # If +input_filter+ is not specified, all the inputs in the view scope are used.
    # Otherwise, the filter is applied to determine the subset of inputs to classify.
    #
    # @param [Insights::View] view
    # @param [Enumerable<Insights::Category>,NilClass] categories
    # @param [Hash] input_filter
    # @param [Insights::CategorySuggestionsService,NilClass] suggestion_service
    def run(view, categories: nil, input_filter: {}, suggestion_service: nil)
      categories ||= view.categories
      inputs = InputsFinder.new(view, input_filter).execute
      return if inputs.blank? || categories.blank?

      suggestion_service ||= CategorySuggestionsService.new
      suggestion_service.classify(inputs, categories)
    end
  end
end
