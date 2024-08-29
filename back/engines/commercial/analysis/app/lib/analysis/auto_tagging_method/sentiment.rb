# frozen_string_literal: true

module Analysis
  class AutoTaggingMethod::Sentiment < AutoTaggingMethod::Base
    include NLPCloudHelpers

    TAG_TYPE = 'sentiment'
    POSITIVE_THRESHOLD = 0.8
    NEGATIVE_THRESHOLD = 0.95
    POSITIVE_NAME = 'sentiment +'
    NEGATIVE_NAME = 'sentiment -'

    protected

    # Use `execute` on the parent class to actually use the method
    def run
      positive_tag, negative_tag = sentiment_tags

      total_inputs = filtered_inputs.size

      filtered_inputs.includes(:author).each_with_index do |input, i|
        update_progress(i / total_inputs.to_f) if i % 5 == 0

        locale = deduct_locale(input)
        nlp = nlp_cloud_client_for(
          'distilbert-base-uncased-finetuned-sst-2-english',
          locale
        )

        text = input_to_text.execute(input).values.join("\n").truncate(1500)
        next if text.strip.empty?

        # We retry 10 times due to rate limiting
        result = retry_rate_limit(10, 2) do
          nlp.sentiment(text)
        end

        tag = case response_sentiment(result)
        when :positive
          positive_tag
        when :negative
          negative_tag
        end
        find_or_create_tagging!(input_id: input.id, tag_id: tag.id) if tag
      end
    rescue StandardError => e
      raise AutoTaggingFailedError, e
    end

    private

    def response_sentiment(response)
      if response && response['scored_labels'].find do |item|
           item['label'] == 'POSITIVE' && item['score'] >= POSITIVE_THRESHOLD
         end
        return :positive
      end

      if response && response['scored_labels'].find do |item|
           item['label'] == 'NEGATIVE' && item['score'] >= NEGATIVE_THRESHOLD
         end
        :negative
      end
    end

    def sentiment_tags
      [
        Tag.find_or_create_by!(name: POSITIVE_NAME, tag_type: TAG_TYPE, analysis: analysis),
        Tag.find_or_create_by!(name: NEGATIVE_NAME, tag_type: TAG_TYPE, analysis: analysis)
      ]
    end
  end
end
