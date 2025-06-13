# frozen_string_literal: true

module Analysis
  class AutoTaggingMethod::NLPTopic < AutoTaggingMethod::Base
    TAG_TYPE = 'nlp_topic'
    TOKENS_PER_TOPIC = 11 # Token size of "Efficiënte afvalverwerking en recycling"

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
      topic_modeling_progress_weight = filtered_inputs.size / 3 # The first phase represents roughly one quarter of the total progress
      update_progress(topic_modeling_progress_weight / (filtered_inputs.size + topic_modeling_progress_weight).to_f)

      # Classification
      processed_inputs = 0
      classify_many!(filtered_inputs, topics, TAG_TYPE) do |_input_id|
        processed_inputs += 1
        update_progress([(processed_inputs + topic_modeling_progress_weight) / (filtered_inputs.size + topic_modeling_progress_weight).to_f, 0.99].min)
      end
    rescue StandardError => e
      raise AutoTaggingFailedError, e
    end

    private

    def run_topic_modeling_prompt(project_title, inputs)
      inputs = fit_inputs_in_context_window(inputs, project_title)
      gpt4.chat(inputs_prompt(inputs, project_title))
    end

    def inputs_prompt(inputs, project_title)
      inputs_text = input_to_text.format_all(inputs)
      LLM::Prompt.new.fetch('topic_modeling', project_title: project_title, inputs_text: inputs_text, max_topics: max_topics(inputs.size), language: response_language)
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

    def fit_inputs_in_context_window(inputs, project_title)
      prompt = inputs_prompt(inputs, project_title)
      tokens_for_response = TOKENS_PER_TOPIC * max_topics(inputs.size)
      tokens = LLM::AzureOpenAI.token_count(prompt) + tokens_for_response # The context window is an upper limit on the number of tokens in the prompt + response (the returned topics)
      exceeded_tokens = tokens - gpt4.context_window
      return inputs if exceeded_tokens < 0

      tokens_per_input = (LLM::AzureOpenAI.token_count(input_to_text.format_all(inputs)) / inputs.size.to_f).ceil
      inputs_excess = (exceeded_tokens / tokens_per_input.to_f).ceil
      inputs_excess = [inputs_excess, 1].max # Avoid infinite loop
      fit_inputs_in_context_window(inputs.shuffle.drop(inputs_excess), project_title)
    end

    def response_language
      locale = Locale.monolingual&.to_s ||
               task.activities.where(action: 'created').order(created_at: :desc).first&.user&.locale ||
               AppConfiguration.instance.settings('core', 'locales').first ||
               I18n.default_locale

      Locale.new(locale).language_copy
    end
  end
end
