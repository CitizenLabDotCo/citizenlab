# frozen_string_literal: true

module Analysis
  class CommentsSummarizationMethod::OnePassLLM < CommentsSummarizationMethod::Base
    protected

    # Use `execute` on the parent class to actually use the method
    def run
      input = comments_summary.idea
      input_text = InputToText.new(analysis.associated_custom_fields).formatted(input)
      comments_text = CommentsToText.new.execute(input)

      prompt = prompt(analysis.source_project, input, input_text, comments_text)
      comments_summary.update!(prompt:)

      llm.chat_async(prompt) do |new_text|
        update_summary([comments_summary.summary || '', new_text].join)
      end
    rescue StandardError => e
      raise SummarizationFailedError, e
    end

    private

    def prompt(project, input, input_text, comments_text)
      project_title = MultilocService.new.t(project.title_multiloc)
      language = Locale.monolingual&.language_copy
      LLM::Prompt.new.fetch(
        'comments_summarization',
        project_title:,
        input:,
        input_text:,
        comments_text:,
        language:
      )
    end
  end
end
