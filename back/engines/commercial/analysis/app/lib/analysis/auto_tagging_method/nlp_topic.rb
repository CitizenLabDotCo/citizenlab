# frozen_string_literal: true

module Analysis
  class AutoTaggingMethod::NLPTopic < AutoTaggingMethod::Base
    include NLPCloudHelpers

    TAG_TYPE = 'nlp_topic'
    DETECTION_THRESHOLD = 0.8

    protected

    # Use `execute` on the parent class to actually use the method
    def run
      total_inputs = filtered_inputs.size

      filtered_inputs.includes(:author).each_with_index do |input, i|
        update_progress(i / total_inputs.to_f)

        nlp = nlp_cloud_client_for(
          'fast-gpt-j',
          deduct_locale(input),
          gpu: true
        )

        text = input_to_text.execute(input).values.join("\n")
        next if text.strip.empty?

        # We retry 10 times due to rate limiting
        result = retry_rate_limit(10, 2) do
          nlp.classification(text, multi_class: true)
        end

        result['labels']
          .zip(result['scores'])
          .reject { |(_label, score)| !score || score < DETECTION_THRESHOLD }
          .each do |(label, _score)|
          tag = Tag.find_or_create_by!(name: label, tag_type: TAG_TYPE, analysis: analysis)
          find_or_create_tagging!(input_id: input.id, tag_id: tag.id)
        end
      end
    rescue StandardError => e
      raise AutoTaggingFailedError, e
    end
  end
end
