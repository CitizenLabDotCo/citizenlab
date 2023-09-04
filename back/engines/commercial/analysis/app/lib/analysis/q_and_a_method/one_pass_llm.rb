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
      # We try whether OnePassLLM can process the complete prompt, with
      # descending amounts of information
      [
        { include_id: true, shorten_labels: false },
        { include_id: true, shorten_labels: true },
        { include_id: false, shorten_labels: true },
        { include_id: true, shorten_labels: true, truncate_values: 512 },
        { include_id: true, shorten_labels: true, truncate_values: 256 },
        { include_id: false, shorten_labels: true, truncate_values: 128 }
      ].each do |input_to_text_options|
        # Calculate the prompt size
        inputs_text = input_to_text.format_all(filtered_inputs, **input_to_text_options)
        prompt = prompt(@analysis.source_project, inputs_text)
        complete_token_count = token_count(prompt) + TOKENS_FOR_RESPONSE

        # As a rule of thumb, 1 token corresponds to ~4 charachters in English.
        # Since calculating the token_count is slow, as an optimization, we
        # don't even bother calculating the token count for a safe worst case of
        # 6 charachters/token
        next if prompt.size > (max_context_window * 6)

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
        shorten_labels: plan.shorten_labels
      )
      prompt = prompt(analysis.source_project, inputs_text)

      question.update!(prompt: prompt)

      plan.llm.chat_async(prompt) do |new_text|
        update_answer([question.answer || '', new_text].join)
      end
    rescue StandardError => e
      raise QAndAFailedError, e
    end

    def prompt(project, inputs_text)
      project_title = MultilocService.new.t(project.title_multiloc)
      @prompt = <<~GPT_PROMPT
        At the end of this message is a list of form responses filled out by citizens in the context of an online participation project titled '#{project_title}'. The responses are separated by lines.
        
        Your only goal is to answer the following question about these ideas, as accurately and as quantified as possible:"#{question.question}"
        
        You can refer to individual responses within the question where relevant as example, by adding their ID between square brackets. E.g. [52247442-b9a9-4a74-a6a1-898e9d6e2da7].
        
        Write your answer to the question in the same language as the question itself.
        
        #{inputs_text}

      GPT_PROMPT
    end
  end
end
