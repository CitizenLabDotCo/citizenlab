# frozen_string_literal: true

module Insights
  class CategoryDetectionService
    attr_reader :nlp_client

    def initialize(nlp_client = nil)
      @nlp_client = nlp_client || NLP::Api.new
    end

    # @return[Array<Insights::ZeroshotClassificationTask>]
    def detect_categories(view)
      inputs = view.scope.ideas

      return [] unless inputs.any?

      detected_categories_attributes = @nlp_client
        .project_tag_suggestions(
          top_locale(inputs),
          AppConfiguration.instance.id,
          view.scope.id,
          25
        )
        &.map { |tag_suggestion| new_detected_category_attrs(tag_suggestion, view) }

      return [] unless detected_categories_attributes&.any?

      clear_detected_categories(view)

      DetectedCategory.insert_all(detected_categories_attributes)
    end

    # @param [Enumerable<Ideas>] inputs
    # @return [String] The most occurent locale in the inputs
    def top_locale(inputs)
      # [TODO] This is prettly lightly taking the locale that has the most
      # occurences, which will nlp-side ignore the rest of the input if the project
      # truly is multilingual. Doesn't happen a lot.
      # [TODO] We are not taking the title into account at the moment.
      inputs.map { |input| input.body_multiloc.compact.keys }.flatten
        .group_by(&:itself).max_by { |key, value| value.size }[0]
    end

    private

    def new_detected_category_attrs tag_suggestion, view
      {
        name: tag_suggestion["text"],
        view_id: view.id,
        created_at: Time.zone.now,
        updated_at: Time.zone.now
      }
    end

    def clear_detected_categories view
      detacted_categories = DetectedCategory.where(view: view)
      detacted_categories.delete_all
    end
  end
end
