module NLP
  class TagSuggestionService

    def suggest(ideas, locale)

      @api ||= NLP::API.new ENV.fetch('CL2_NLP_HOST')

      @api.tag_suggestions({
        locale: locale,
        max_number_of_suggestions: 5,
        texts: ideas.map { |idea|
          idea.body_multiloc[locale]
        }
      }.freeze)
    end
  end
end
