# frozen_string_literal: true

require 'openai'

module Analysis
  class SummarizationMethod::Gpt4 < SummarizationMethod::Base
    SUMMARY_TYPE = 'gpt4'
    GPT_MODEL = 'gpt-4'

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
      summary.update(prompt: prompt)

      @openai_api.chat(
        parameters: {
          model: GPT_MODEL,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          stream: proc do |chunk, _bytesize|
            new_text = chunk.dig('choices', 0, 'delta', 'content')
            update_summary([summary.summary || '', new_text].join) if new_text.present?
          end
        }
      )
    rescue StandardError => e
      raise SummarizationFailedError, e
    end

    private

    def prompt
      return @prompt if @prompt

      project_title = MultilocService.new.t(analysis.source_project.title_multiloc)
      @prompt = <<~GPT_PROMPT
        At the end of this message is a list of form responses filled out by citizens in the context of an online participation project titled '#{project_title}'. The responses are separated by lines.

        Summarize what citizens have proposed in a few paragraphs. Be as complete as possible and put the most emphasis on things that were mentioned most often.
        The goal is for the reader to get an understanding of what citizens have been talking about, without having to read through it all. Focus more on the trends across the ideas, than on individual ideas.

        You can refer to individual responses within the summary where relevant as example, by adding their ID between square brackets. E.g. [52247442-b9a9-4a74-a6a1-898e9d6e2da7].

        Write the summary in the same language as the majority of the responses.

        #{prompt_inputs_text}

      GPT_PROMPT
    end

    def prompt_inputs_text
      filtered_inputs
        .map { |input| input_to_text.formatted(input, include_id: true) }
        .join('\n-----\n')
    end
  end
end
