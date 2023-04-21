# frozen_string_literal: true

module Surveys
  class XlsxService
    def generate_survey_results_xlsx(responses)
      columns = [
        { header: 'submitted_at', f: ->(r) { r.submitted_at }, skip_sanitization: true },
        { header: 'started_at',   f: ->(r) { r.started_at },   skip_sanitization: true }
      ]
      questions = responses.map { |r| r.answers.pluck('question_text') }.flatten.uniq
      columns += questions.map do |q|
        {
          header: q,
          f: ->(r) { r.answers.find { |a| a['question_text'] == q }&.dig('value') }
        }
      end
      ::XlsxService.new.generate_xlsx 'Survey results', columns, responses
    end
  end
end
