# frozen_string_literal: true

module NLP
  class TaggingSuggestionService
    def initialize(api = nil)
      @api = api || NLP::API.new(ENV.fetch('CL2_NLP_HOST'))
    end

    def suggest(ideas, tags, locale)
      documents = parse_ideas ideas, locale
      candidate_labels = parse_tags tags, locale

      documents.any? ? @api.zeroshot_classification({
        candidate_labels: candidate_labels,
        documents: documents,
        tenant_id: Tenant.current.id,
        locale: locale
      }.freeze) : []
    end

    private

    def parse_ideas(ideas, locale)
      ideas.map do |idea|
        {
          text: ActionView::Base.full_sanitizer.sanitize(idea.body_multiloc[locale]),
          doc_id: idea.id
        }
      end.reject { |doc| doc[:text].blank? }
    end

    def parse_tags(tags, locale)
      tags.map do |tag|
        {
          text: tag[:title_multiloc][locale],
          label_id: tag[:id].to_s
        }
      end.reject { |doc| doc[:text].blank? }
    end
  end
end
