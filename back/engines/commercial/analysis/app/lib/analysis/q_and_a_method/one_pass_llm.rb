# frozen_string_literal: true

module Analysis
  # The OnePassLLM Q and A method sends a single request to the LLM , which
  # includes all the inputs and the user's question
  class QAndAMethod::OnePassLLM < QAndAMethod::Base
    Q_AND_A_METHOD = 'one_pass_llm'

    # The number of tokens we reserve for the LLM response containing the answer
    TOKENS_FOR_RESPONSE = 600

    def generate_plan
      plan = nil
      include_comments = true
      # We try whether OnePassLLM can process the complete prompt, with
      # descending amounts of information
      [
        { include_id: true, shorten_labels: false, include_comments: },
        { include_id: true, shorten_labels: true, include_comments: },
        { include_id: false, shorten_labels: true, include_comments: },
        { include_id: true, shorten_labels: true, truncate_values: 512, include_comments: },
        { include_id: true, shorten_labels: true, truncate_values: 256, include_comments: },
        { include_id: false, shorten_labels: true, truncate_values: 128, include_comments: },
        { include_id: false, shorten_labels: true, truncate_values: 128, include_comments: false }
      ].each do |input_to_text_options|
        # Calculate the prompt size
        inputs_text = input_to_text.format_all(filtered_inputs.includes(:comments), **input_to_text_options)
        prompt = prompt(@analysis.source_project, inputs_text, input_to_text_options[:include_comments])

        # As a rule of thumb, 1 token corresponds to ~4 characters in English.
        # Since calculating the token_count is slow, as an optimization, we
        # don't even bother calculating the token count for a safe worst case of
        # 6 characters/token
        next if prompt.size > (max_context_window * 6)

        # Is there an LLM that can handle the prompt size?
        selected_llm = enabled_llms
          .sort_by { |llm| -llm.accuracy }
          .find { |llm| llm.usable_context_window >= llm.token_count(prompt) + TOKENS_FOR_RESPONSE }

        # If yes, let's define the plan
        if selected_llm
          plan = QAndAPlan.new(
            q_and_a_method_class: self.class,
            llm: selected_llm,
            accuracy: selected_llm.accuracy,
            **input_to_text_options
          )
          break
        end
      end

      plan
    end

    protected

    # Use `execute` on the parent class to actually use the method
    # @param plan [Analysis::QAndAPlan]
    def run(plan)
      inputs_text = input_to_text.format_all(
        filtered_inputs,
        truncate_values: plan.truncate_values,
        include_id: plan.include_id,
        shorten_labels: plan.shorten_labels,
        include_comments: plan.include_comments
      )

      prompt = prompt(analysis.source_project, inputs_text, plan.include_comments)
      question.update!(prompt:)

      messages = if file_ai_analysis_enabled?
        [
          LLM::Message.new(prompt.to_s, role: 'system'),
          LLM::Message.new(question.question, *analysis.attached_files)
        ]
      else
        LLM::Message.new(prompt.to_s)
      end

      plan.llm.chat_async(messages, retries: 0) do |new_text|
        update_answer([question.answer || '', new_text].join)
      end
    end

    def prompt(project, inputs_text, include_comments)
      project_title = MultilocService.new.t(project.title_multiloc)

      custom_template = if file_ai_analysis_enabled?
        AppConfiguration.instance.settings('data_repository_ai_analysis', 'prompt_template').presence
      end

      params = {
        question: question.question,
        language: response_language,
        project_title:, inputs_text:, include_comments:
      }

      if custom_template
        ERB.new(custom_template).result_with_hash(params)
      else
        filename = file_ai_analysis_enabled? ? 'q_and_a.v2' : 'q_and_a'
        LLM::Prompt.new.fetch(filename, **params)
      end
    end

    def response_language
      locale = Locale.monolingual&.to_s ||
               question.activities.where(action: 'created').order(created_at: :desc).first&.user&.locale ||
               AppConfiguration.instance.settings('core', 'locales').first ||
               I18n.default_locale

      Locale.new(locale).language_copy
    end

    private

    def file_ai_analysis_enabled?
      @file_ai_analysis_enabled ||= AppConfiguration.instance.feature_activated?('data_repository_ai_analysis')
    end
  end
end
