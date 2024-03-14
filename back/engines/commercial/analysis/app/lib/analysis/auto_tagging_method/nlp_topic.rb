# frozen_string_literal: true

module Analysis
  class AutoTaggingMethod::NLPTopic < AutoTaggingMethod::Base
    TAG_TYPE = 'nlp_topic'
    SHORT_INPUTS_TEXTS_THRESHOLD = 1000

    def topic_modeling(project_title, inputs)
      response = run_topic_modeling_prompt(project_title, inputs)
      parse_topic_modeling_response(response)
    end

    protected

    # Use `execute` on the parent class to actually use the method
    def run
      update_progress(0.0)

      # Topic modeling
      project_title = analysis.participation_context.project.title_multiloc.values.first
      topics = topic_modeling(project_title, filtered_inputs)
      update_progress(10 / (filtered_inputs.size + 10).to_f)

      # Classification
      processed_inputs = 0
      classify_many!(filtered_inputs, topics, TAG_TYPE) do |_input_id|
        processed_inputs += 1
        update_progress([(processed_inputs + 10) / (filtered_inputs.size + 10).to_f, 0.99].min)
      end
    rescue StandardError => e
      raise AutoTaggingFailedError, e
    end

    private

    def run_topic_modeling_prompt(project_title, inputs)
      # short_inputs = inputs.size * analysis.associated_custom_fields.size > SHORT_INPUTS_TEXTS_THRESHOLD
      inputs_text = input_to_text.format_all(inputs) # , short_inputs: short_inputs)
      prompt = LLM::Prompt.new.fetch('topic_modeling', project_title: project_title, inputs_text: inputs_text, max_topics: max_topics(inputs.size))
      gpt4.chat(prompt)
    end

    def parse_topic_modeling_response(response)
      response.lines.map(&:strip).map do |line|
        # After https://stackoverflow.com/a/3166005/3585671
        chars = Regexp.escape(' -')
        line.gsub(/\A[#{chars}]+|[#{chars}]+\z/, '')
      end
    end

    def max_topics(inputs_count)
      [inputs_count, (Math.log(inputs_count, 5) * 6).ceil].min
    end
  end
end
