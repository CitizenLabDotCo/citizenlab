# frozen_string_literal: true

module Analysis
  # A fake offline summarization method, used for development and testing
  # purposes, that takes a random word from each inputs and concatenates them.
  # Saves times x100.
  class SummarizationMethod::Bogus < SummarizationMethod::Base
    protected

    # Use `execute` on the parent class to actually use the method
    def run
      total_inputs = filtered_inputs.size
      filtered_inputs.each_with_index.inject('') do |memo, (input, i)|
        # TODO: base on custom_fields in analysis
        random_word = MultilocService.new.t(input.title_multiloc).split.sample
        memo += " #{random_word}"

        update_summary(memo)
        update_progress(i / total_inputs.to_f)

        sleep(2) unless Rails.env.test?
        memo
      end
    rescue StandardError => e
      raise SummarizationFailedError, e
    end
  end
end
