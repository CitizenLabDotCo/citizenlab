# frozen_string_literal: true

module Analysis
  class AutoTaggingMethod::Sentiment < AutoTaggingMethod::Base
    TAG_TYPE = 'sentiment'
    POSITIVE_NAME = 'sentiment +'
    NEGATIVE_NAME = 'sentiment -'

    protected

    # Use `execute` on the parent class to actually use the method
    def run
      positive_tag, negative_tag = sentiment_tags

      total_inputs = filtered_inputs.size

      filtered_inputs.includes(:author).each_with_index do |input, i|
        update_progress(i / total_inputs.to_f) if i % 5 == 0

        text = input_to_text.execute(input).values.join("\n").truncate(1500)
        next if text.strip.empty?

        tag = case sentiment_for_text(text)
        when 'POSITIVE'
          positive_tag
        when 'NEGATIVE'
          negative_tag
        end
        find_or_create_tagging!(input_id: input.id, tag_id: tag.id) if tag
      end
    rescue StandardError => e
      raise AutoTaggingFailedError, e
    end

    private

    def sentiment_for_text(input_text)
      prompt = LLM::Prompt.new.fetch('sentiment_analysis', input_text:)
      gpt4mini.chat(prompt).strip
    end

    def sentiment_tags
      [
        Tag.find_or_create_by!(name: POSITIVE_NAME, tag_type: TAG_TYPE, analysis: analysis),
        Tag.find_or_create_by!(name: NEGATIVE_NAME, tag_type: TAG_TYPE, analysis: analysis)
      ]
    end
  end
end
