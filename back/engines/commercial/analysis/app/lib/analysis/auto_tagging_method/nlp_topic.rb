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
      # Prompt method
      inputs_text = input_to_text.format_all(inputs)
      prompt = LLM::Prompt.new.fetch('fully_automated_classifier', inputs_text: inputs_text, topics: topics)
      puts prompt ### Debugging
      response = llm.chat(prompt).strip
      puts response ### Debugging

      # Parse method
      inputs.zip(response.lines.map(&:strip))
    end

    protected

    # Use `execute` on the parent class to actually use the method
    def run
      project_title = analysis.participation_context.project.title_multiloc.values.first
      topics = topic_modeling(project_title, filtered_inputs)
      filtered_inputs.each_slice(BATCH_SIZE) do |inputs_group|
        classify(inputs_group, topics).each do |input, topic|
          puts "#{input.title_multiloc.values.first} => #{topic}" ### Debugging
          tag = Tag.find_or_create_by!(name: topic, tag_type: TAG_TYPE, analysis: analysis)
          find_or_create_tagging!(input_id: input.id, tag_id: tag.id)
        end
      end
    end

    private

    def llm
      @llm ||= LLM::GPT4Turbo.new
    end

    def parse_topic_modeling_response(response)
      response.split("\n").map do |line|
        # After https://stackoverflow.com/a/3166005/3585671
        chars = Regexp.escape(' -')
        line.gsub(/\A[#{chars}]+|[#{chars}]+\z/, '')
      end
    end

    def run_topic_modeling_prompt(project_title, inputs)
      inputs_text = input_to_text.format_all(inputs)
      prompt = LLM::Prompt.new.fetch('topic_modeling', project_title: project_title, inputs_text: inputs_text, max_topics: max_topics(inputs.size))
      llm.chat(prompt).strip
    end

    def max_topics(inputs_count)
      [inputs_count, (Math.log(inputs_count, 5) * 6).ceil].min
    end
  end
end
