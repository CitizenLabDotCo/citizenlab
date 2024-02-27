# frozen_string_literal: true

module Analysis
  class AutoTaggingMethod::NLPTopic < AutoTaggingMethod::Base
    TAG_TYPE = 'nlp_topic'
    BATCH_SIZE = 10

    def topic_modeling(project_title, inputs)
      response = run_topic_modeling_prompt(project_title, inputs)
      parse_topic_modeling_response(response)
    end

    def classify(inputs, topics)
      response = run_classification_prompt(inputs, topics)
      inputs.zip(parse_classification_response(response))
    end

    protected

    # Use `execute` on the parent class to actually use the method
    def run
      update_progress(0.0)

      project_title = analysis.participation_context.project.title_multiloc.values.first
      topics = topic_modeling(project_title, filtered_inputs)
      update_progress(10 / (filtered_inputs.size + 10).to_f)

      filtered_inputs.each_slice(BATCH_SIZE).with_index do |inputs_group, i|
        classify(inputs_group, topics).each do |input, topic|
          assign_topic!(input, topic)
        end
        update_progress(((i * 10) + 10) / (filtered_inputs.size + 10).to_f)
      end

      update_progress(1.0)
    end

    private

    def llm
      @llm ||= LLM::GPT4Turbo.new
    end

    def run_topic_modeling_prompt(project_title, inputs)
      inputs_text = input_to_text.format_all(inputs)
      prompt = LLM::Prompt.new.fetch('topic_modeling', project_title: project_title, inputs_text: inputs_text, max_topics: max_topics(inputs.size))
      llm.chat(prompt)
    end

    def parse_topic_modeling_response(response)
      response.lines.map do |line|
        # After https://stackoverflow.com/a/3166005/3585671
        chars = Regexp.escape(' -')
        line.gsub(/\A[#{chars}]+|[#{chars}]+\z/, '')
      end
    end

    def max_topics(inputs_count)
      [inputs_count, (Math.log(inputs_count, 5) * 6).ceil].min
    end

    def run_classification_prompt(inputs, topics)
      inputs_text = input_to_text.format_all(inputs)
      prompt = LLM::Prompt.new.fetch('fully_automated_classifier', inputs_text: inputs_text, topics: topics)
      llm.chat(prompt)
    end

    def parse_classification_response(response)
      response.lines.map(&:strip)
    end

    def assign_topic!(input, topic)
      return if topic == 'other'

      tag = Tag.find_or_create_by!(name: topic, tag_type: TAG_TYPE, analysis: analysis)
      find_or_create_tagging!(input_id: input.id, tag_id: tag.id)
    end
  end
end
