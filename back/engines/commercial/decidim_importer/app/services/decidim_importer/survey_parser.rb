# frozen_string_literal: true

module DecidimImporter
  # Reads a Decidim surveys component's `specific_data` column. Two export shapes are supported:
  #
  #   * older: `[{ questionnaire: { title, description, questions: [...] } }]`
  #   * newer: `[[ <question>, ... ]]` — no questionnaire wrapper, and references (`id`,
  #     `answer_options[].id`, `matrix_rows[].id`) are full UIDs (`decidim--forms--question--46`)
  #     rather than bare numeric ids.
  #
  # Each question: `{ id, position, question_type, mandatory, body, description, answer_options: [{ id,
  # body }], matrix_rows: [{ id, position, body }] }`. Used to title the survey phase, build its form,
  # and (newer export) read responses.
  module SurveyParser
    module_function

    # Questions sorted by their declared position, for either export shape.
    def questions(specific_data)
      Array(extract_questions(specific_data)).sort_by { |question| question['position'].to_i }
    end

    # The questionnaire title as a raw (Decidim-locale-keyed) multiloc, or nil. Only the older wrapped
    # shape carries one; the newer falls back to the component name.
    def title(specific_data)
      first = top_entry(specific_data)
      first.is_a?(Hash) ? first.dig('questionnaire', 'title') : nil
    end

    # The questionnaire description as a raw (Decidim-locale-keyed) HTML multiloc, or nil. Only the
    # older wrapped shape carries it; rendered into the survey phase's description.
    def description(specific_data)
      first = top_entry(specific_data)
      first.is_a?(Hash) ? first.dig('questionnaire', 'description') : nil
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
