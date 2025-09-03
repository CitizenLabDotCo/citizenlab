# frozen_string_literal: true

module Analysis
  # A fake offline summarization method, used for development and testing
  # purposes, that takes a random word from each comment and concatenates them.
  class CommentsSummarizationMethod::Bogus < CommentsSummarizationMethod::Base
    protected

    # Use `execute` on the parent class to actually use the method
    def run
      total_comments = comments.size
      comments.each_with_index.inject('') do |memo, (comment, i)|
        random_word = comment.body_multiloc.values.first.split.sample
        memo += " #{random_word}"
        update_summary(memo)
        update_progress(i / total_comments.to_f)

        sleep(0.25) unless Rails.env.test?
        memo
      end
    rescue StandardError => e
      raise SummarizationFailedError, e
    end
  end
end
