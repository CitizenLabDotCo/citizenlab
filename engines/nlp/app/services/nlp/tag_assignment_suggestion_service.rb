module NLP
  class TagAssignmentSuggestionService

    def suggest(ideas, tags, locale)
      @api ||= NLP::API.new ENV.fetch('CL2_NLP_HOST')
      @documents = ideas.map { |idea|
        {
          text: ActionView::Base.full_sanitizer.sanitize(idea.body_multiloc[locale]),
          doc_id: idea.id
        }
      }.reject{ |doc| doc[:text].blank?}
      @candidate_labels = tags.map{ |tag|
        {
          text: tag.title_multiloc[locale],
          label_id: tag.id
        }
      }.reject{ |doc| doc[:text].blank?}
      @documents.any? ? @api.zeroshot_classification({
        candidate_labels: @candidate_labels,
        min_confidence_treshold: 0.5,
        documents: @documents
      }.freeze) : []
    end
  end
end
