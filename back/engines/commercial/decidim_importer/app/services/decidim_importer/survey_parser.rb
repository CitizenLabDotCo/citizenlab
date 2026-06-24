# frozen_string_literal: true

module DecidimImporter
  # Reads a Decidim surveys component's `specific_data` column. Two export shapes are supported:
  #
  #   * older: `[{ questionnaire: { title, description, questions: [...] } }]`
  #   * newer:  `[[ <question>, ... ]]` — the questionnaire wrapper is gone, the questions array is the
  #     single top-level entry, and references (`id`, `answer_options[].id`, `matrix_rows[].id`) are
  #     full UIDs (`decidim--forms--question--46`) rather than bare numeric ids.
  #
  # Each question is `{ id, position, question_type, mandatory, body: {<locale>}, description: {<locale>},
  # answer_options: [{ id, body }], matrix_rows: [{ id, position, body }] }`. Used to date the survey
  # phase (title), build its form, and (for the newer export) read responses.
  module SurveyParser
    module_function

    # Questions sorted by their declared position, for either export shape.
    def questions(specific_data)
      Array(extract_questions(specific_data)).sort_by { |question| question['position'].to_i }
    end

    # The questionnaire title as a (raw, Decidim-locale-keyed) multiloc hash, or nil. Only the older
    # wrapped shape carries a title; the newer shape has none (the phase falls back to the component
    # name).
    def title(specific_data)
      first = top_entry(specific_data)
      first.is_a?(Hash) ? first.dig('questionnaire', 'title') : nil
    end

    def top_entry(specific_data)
      Array(Parsing.parse_json(specific_data)).first
    end

    # The questions array, unwrapped from whichever shape the export uses.
    def extract_questions(specific_data)
      first = top_entry(specific_data)
      return first if first.is_a?(Array) # newer: [[ <question>, ... ]]

      first.is_a?(Hash) ? first.dig('questionnaire', 'questions') : nil # older: [{ questionnaire: {...} }]
    end
  end
end
