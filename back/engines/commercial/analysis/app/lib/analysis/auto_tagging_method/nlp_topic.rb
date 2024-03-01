# frozen_string_literal: true

module Analysis
  class AutoTaggingMethod::NLPTopic < AutoTaggingMethod::Base
    TAG_TYPE = 'nlp_topic'
    POOL_SIZE = 8

    def topic_modeling(project_title, inputs)
      response = run_topic_modeling_prompt(project_title, inputs)
      parse_topic_modeling_response(response)
    end

    def classify(input, topics)
      # response = run_classification_prompt(input, topics)
      # parse_classification_response(response)

      run_classification_prompt(input, topics)
    end

    protected

    # Use `execute` on the parent class to actually use the method
    def run
      update_progress(0.0)

      project_title = analysis.participation_context.project.title_multiloc.values.first
      topics = topic_modeling(project_title, filtered_inputs)
      update_progress(10 / (filtered_inputs.size + 10).to_f)

      pool = Concurrent::FixedThreadPool.new(POOL_SIZE)
      results = Concurrent::Hash.new

      filtered_inputs.each do |input|
        pool.post do
          ErrorReporter.handle do
            results[input.id] = classify(input, topics)
          end
        end
      end
      processed_inputs = []
      do_while_pool_is_running(pool) do
        (results.keys - processed_inputs).each do |input_id|
          topic = results[input_id]
          assign_topic!(input_id, topic)
          processed_inputs << input_id
          update_progress([(processed_inputs.size + 10) / (filtered_inputs.size + 10).to_f, 0.99].min)
          puts "#{processed_inputs.size} / #{filtered_inputs.size}" ### DEBUG
        end
      end
    rescue StandardError => e
      raise AutoTaggingFailedError, e
    end

    private

    def gpt4
      @gpt4 ||= LLM::GPT4Turbo.new
    end

    def gpt3
      @gpt3 ||= LLM::GPT35Turbo.new
    end

    def run_topic_modeling_prompt(project_title, inputs)
      inputs_text = input_to_text.format_all(inputs)
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

    def run_classification_prompt(input, topics)
      inputs_text = input_to_text.format_all([input])
      prompt = LLM::Prompt.new.fetch('fully_automated_classifier', inputs_text: inputs_text, topics: topics)
      gpt3.chat(prompt)
    end

    # def parse_classification_response(response)
    #   # response.lines.map(&:strip)
    #   response.strip
    # end

    def assign_topic!(input_id, topic)
      return if topic == 'other'

      tag = Tag.find_or_create_by!(name: topic, tag_type: TAG_TYPE, analysis: analysis)
      find_or_create_tagging!(input_id: input_id, tag_id: tag.id)
    end

    def do_while_pool_is_running(pool, &block)
      while pool.running?
        pool.wait_for_termination(0.1)
        block.call
        pool.shutdown if pool.running? && pool.queue_length.zero?
      end
      block.call
    end
  end
end
