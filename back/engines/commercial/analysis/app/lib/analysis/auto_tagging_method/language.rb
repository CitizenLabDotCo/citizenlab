# frozen_string_literal: true

module Analysis
  class AutoTaggingMethod::Language < AutoTaggingMethod::Base
    include NLPCloudHelpers

    TAG_TYPE = 'language'
    DETECTION_THRESHOLD = 0.8

    protected

    # Use `execute` on the parent class to actually use the method
    def run
      total_inputs = filtered_inputs.size

      filtered_inputs.includes(:author).each_with_index do |input, i|
        update_progress(i / total_inputs.to_f) if i % 5 == 0

        nlp = nlp_cloud_client_for(
          'python-langdetect'
        )

        text = input_to_text.execute(input).values.join("\n")
        next if text.strip.empty?

        # We retry 10 times due to rate limiting
        result = retry_rate_limit(10, 2) do
          nlp.langdetection(text)
        end

        result['languages'].map(&:first).each do |(language, score)|
          if score > DETECTION_THRESHOLD
            tag = find_or_create_tag(language)
            find_or_create_tagging!(input_id: input.id, tag_id: tag.id)
          end
        end
      end
    rescue StandardError => e
      raise AutoTaggingFailedError, e
    end

    private

    def find_or_create_tag(language)
      tags_by_name[language] ||= Tag.find_or_create_by!(name: language, tag_type: TAG_TYPE, analysis: analysis)
    end

    def tags_by_name
      @tags_by_name ||= analysis.tags.where(tag_type: TAG_TYPE).all.index_by(&:name)
    end
  end
end
