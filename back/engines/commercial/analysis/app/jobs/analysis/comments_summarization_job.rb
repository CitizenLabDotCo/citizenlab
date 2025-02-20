# frozen_string_literal: true

module Analysis
  class CommentsSummarizationJob < ApplicationJob
    self.priority = 45 # Slighltly more important than emails (50)

    def run(comments_summary)
      CommentsSummarizationMethod::OnePassLLM.new(comments_summary).execute
    end
  end
end
