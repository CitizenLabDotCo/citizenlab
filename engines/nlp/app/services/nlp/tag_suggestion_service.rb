module NLP
  class TagSuggestionService

    def suggest(ideas, locale)

      @api ||= NLP::API.new ENV.fetch('CL2_NLP_HOST')
      @texts = ideas.map { |idea|
        ActionView::Base.full_sanitizer.sanitize(idea.body_multiloc[locale])
      }.reject(&:blank?)
      @texts.any? ? @api.tag_suggestions({
        locale: locale,
        max_number_of_suggestions: 5,
        texts: @texts
      }.freeze) : []
    end
  end
end
