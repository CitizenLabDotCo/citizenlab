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

        # As a rule of thumb, 1 token corresponds to ~4 charachters in English.
        # Since calculating the token_count is slow, as an optimization, we
        # don't even bother calculating the token count for a safe worst case of
        # 6 charachters/token
        next if prompt.size > (max_context_window * 6)

        complete_token_count = token_count(prompt) + TOKENS_FOR_RESPONSE

        # Is there an LLM that can handle the prompt size?
        selected_llm = enabled_llms
          .sort_by { |llm| -llm.accuracy }
          .find { |llm| llm.context_window >= complete_token_count }

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

      plan.llm.chat_async(prompt) do |new_text|
        update_answer([question.answer || '', new_text].join)
      end
    rescue StandardError => e
      raise QAndAFailedError, e
    end

    def prompt(project, inputs_text, include_comments)
      project_title = MultilocService.new.t(project.title_multiloc)
      LLM::Prompt.new.fetch('q_and_a', project_title:, question: question.question, inputs_text:, language: response_language, include_comments:)
    end

    def response_language
      locale = Locale.monolingual&.to_s ||
               question.activities.where(action: 'created').order(created_at: :desc).first&.user&.locale ||
               AppConfiguration.instance.settings('core', 'locales').first ||
               I18n.default_locale

      Locale.new(locale).language_copy
    end
  end
end
