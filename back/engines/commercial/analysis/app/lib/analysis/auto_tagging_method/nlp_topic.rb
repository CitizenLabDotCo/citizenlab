# frozen_string_literal: true

module Analysis
  class AutoTaggingMethod::NLPTopic < AutoTaggingMethod::Base
    include NLPCloudHelpers

    TAG_TYPE = 'nlp_topic'
    DETECTION_THRESHOLD = 0.8

    def topic_modeling(project_title, inputs)
      response = run_topic_modeling_prompt(project_title, inputs)
      parse_topic_modeling_response(response)
    end

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

    private

    def llm
      @llm ||= LLM::GPT4Turbo.new
    end

    def parse_topic_modeling_response(response)
      response.split("\n").map do |line|
        # After https://stackoverflow.com/a/3166005/3585671
        chars = Regexp.escape(' -')
        line.gsub(/\A[#{chars}]+|[#{chars}]+\z/, "")
      end
    end

    def run_topic_modeling_prompt(project_title, inputs)
      inputs_texts = input_to_text.format_all(inputs)
      prompt = LLM::Prompt.new.fetch('topic_modeling', project_title: project_title, inputs_texts: inputs_texts, max_topics: max_topics(inputs.size))
      puts prompt
      llm.chat(prompt).strip
    end

    def max_topics(inputs_count)
      [inputs_count, (Math::log(inputs_count, 5) * 6).ceil].min
    end
  end
end




