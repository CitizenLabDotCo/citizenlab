# frozen_string_literal: true

module Analysis
  # A fake offline summarization method, used for development and testing
  # purposes, that takes a random word from each input and concatenates them.
  # Revolutionary method that saves times x100.
  class QAndAMethod::Bogus < QAndAMethod::Base
    Q_AND_A_METHOD = 'bogus'

    def generate_plan
      QAndAPlan.new(
        accuracy: 0.1
      )
    end

    protected

    # Use `execute` on the parent class to actually use the method
    def run(_plan)
      total_inputs = filtered_inputs.size
      filtered_inputs.each_with_index.inject('') do |memo, (input, i)|
        random_word = input_to_text.execute(input).values.join.split.sample
        memo += " #{random_word}"
        update_answer(memo)
        update_progress(i / total_inputs.to_f)

        sleep(0.25) unless Rails.env.test?
        memo
      end
    end
  end
end
