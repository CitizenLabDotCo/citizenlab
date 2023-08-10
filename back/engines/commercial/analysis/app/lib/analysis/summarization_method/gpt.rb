# frozen_string_literal: true

module Analysis
  class SummarizationMethod::Gpt < SummarizationMethod::Base
    SUMMARY_TYPE = 'gpt'
    GPT4_32K_SUPPORT = false
    TOKENS_FOR_RESPONSE = 600
    TOKENS_FOR_STATIC_PROMPT = 200

    def initialize(*args, **kwargs)
      super
      @openai_api = kwargs[:openai_api] || OpenaiApi.new(
        access_token: ENV.fetch('OPENAI_API_KEY'),
        request_timeout: 480
      )
    end

    protected

    # Use `execute` on the parent class to actually use the method
    def run
      model, truncation_point = gpt_model
      prompt = prompt(truncate_values: truncation_point)

      summary.update!(prompt: prompt)

      @openai_api.chat(
        parameters: {
          model: model,
          messages: [{ role: 'user', content: prompt(truncate_values: truncation_point) }],
          temperature: 0.1,
          stream: proc do |chunk, _bytesize|
            new_text = chunk.dig('choices', 0, 'delta', 'content')
            update_summary([summary.summary || '', new_text].join)
          end
        }
      )
    rescue StandardError => e
      raise SummarizationFailedError, e
    end

    def pre_check
      gpt_model
      true
    rescue TooManyInputs
      :too_many_inputs
    end

    private

    def prompt(truncate_values: nil)
      project_title = MultilocService.new.t(analysis.source_project.title_multiloc)
      @prompt = <<~GPT_PROMPT
        At the end of this message is a list of form responses filled out by citizens in the context of an online participation project titled '#{project_title}'. The responses are separated by lines.

        Summarize what citizens have proposed in a few paragraphs. Be as complete as possible and put the most emphasis on things that were mentioned most often.
        The goal is for the reader to get an understanding of what citizens have been talking about, without having to read through it all. Focus more on the trends across the ideas, than on individual ideas.

        You can refer to individual responses within the summary where relevant as example, by adding their ID between square brackets. E.g. [52247442-b9a9-4a74-a6a1-898e9d6e2da7].

        Write the summary in the same language as the majority of the responses.

        #{prompt_inputs_text(truncate_values: truncate_values)}

      GPT_PROMPT
    end

    def prompt_inputs_text(truncate_values: nil)
      input_to_text.format_all(filtered_inputs, include_id: true, shorten_labels: true, truncate_values: truncate_values)
    end

    # Returns which model to use and how many characters to truncate
    def gpt_model
      token_count_wo_trunc = @openai_api.token_count(prompt)

      if token_count_wo_trunc <= (8192 - TOKENS_FOR_RESPONSE)
        ['gpt-4', nil]
      elsif GPT4_32K_SUPPORT && token_count_wo_trunc <= (32_768 - TOKENS_FOR_RESPONSE)
        ['gpt-4-32k', nil]
      elsif token_count_wo_trunc <= (16_384 - TOKENS_FOR_RESPONSE)
        ['gpt-3.5-turbo-16k', nil]
      elsif GPT4_32K_SUPPORT
        truncation_point = find_truncation_point(filtered_inputs, 32_768 - TOKENS_FOR_RESPONSE - TOKENS_FOR_STATIC_PROMPT)
        ['gpt-4-32k', truncation_point]
      else
        truncation_point = find_truncation_point(filtered_inputs, 16_384 - TOKENS_FOR_RESPONSE - TOKENS_FOR_STATIC_PROMPT)
        ['gpt-3.5-turbo-16k', truncation_point]
      end
    end

    def find_truncation_point(inputs, token_target, truncation_point: 512, search_depth: 0)
      raise TooManyInputs, 'The prompt exceeds the maximum token count' if truncation_point <= 64 || search_depth > 3

      text = prompt_inputs_text(truncate_values: truncation_point)
      token_count = @openai_api.token_count(text)

      if token_count < token_target
        truncation_point
      else
        find_truncation_point(
          inputs,
          token_target,
          truncation_point: truncation_point / 2,
          search_depth: search_depth + 1
        )
      end
    end
  end
end
