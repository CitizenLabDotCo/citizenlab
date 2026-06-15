# frozen_string_literal: true

module DecidimImporter
  # Reads a Decidim surveys component's `specific_data` column — a JSON array whose single entry holds
  # the questionnaire (`{ questionnaire: { title, description, questions: [...] } }`). Each question is
  # `{ id, position, question_type, mandatory, body: {<locale>}, description: {<locale>}, answer_options:
  # [{ id, body: {<locale>} }] }`. Used to date the survey phase (title) and to build its form.
  module SurveyParser
    module_function

    def questionnaire(specific_data)
      entry = Array(Parsing.parse_json(specific_data)).first
      entry.is_a?(Hash) ? entry['questionnaire'] : nil
    end

    # The questionnaire title as a (raw, Decidim-locale-keyed) multiloc hash, or nil.
    def title(specific_data)
      questionnaire(specific_data)&.dig('title')
    end

    # Questions sorted by their declared position.
    def questions(specific_data)
      Array(questionnaire(specific_data)&.dig('questions')).sort_by { |question| question['position'].to_i }
    end
  end
end
