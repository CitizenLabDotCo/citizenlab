
  module NLP
    class SentimentAnalysisService
  
      def run_sentiment_analysis(ideas, locale)
        @api ||= NLP::Api.new
        @ideas = parse_ideas ideas, locale
        @texts.any? ? @api.run_sentiment_analysis(@ideas) : []
      end
  
      private
  
      def parse_ideas(ideas, locale)
        ideas.map { |idea|
         { doc_id: idea.id, text: ActionView::Base.full_sanitizer.sanitize(idea.body_multiloc[locale])}
        }.reject(&:blank?)
      end
    end
  end
  