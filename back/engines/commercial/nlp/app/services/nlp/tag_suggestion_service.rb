module NLP
  class TagSuggestionService

    def suggest(ideas, locale)

      @api ||= NLP::API.new ENV.fetch('CL2_NLP_HOST')
      @texts = parse_ideas ideas, locale
      @texts.any? ? @api.tag_suggestions({
        locale: locale,
        max_number_of_suggestions: 20,
        texts: @texts
      }.freeze) : []
    end

    private

    def parse_ideas(ideas, locale)
      ideas.map { |idea|
        {
          body: ActionView::Base.full_sanitizer.sanitize(idea.body_multiloc[locale]),
          id: idea.id,
          title: ActionView::Base.full_sanitizer.sanitize(idea.body_multiloc[locale])
        }
      }.reject { |item| item[:body].blank? }
    end
  end
end
