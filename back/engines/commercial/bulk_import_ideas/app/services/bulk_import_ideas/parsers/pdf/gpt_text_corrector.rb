class BulkImportIdeas::Parsers::Pdf::GPTTextCorrector
  JUMBLING_FIELD_TYPES = %w[multiline_text html_multiloc text text_multiloc]

  # @param [Array<Hash>] idea_rows - comes from IdeaBaseFileParser#ideas_to_idea_rows
  def initialize(phase, idea_rows)
    @phase = phase
    @form_fields = IdeaCustomFieldsService.new(@phase.pmethod.custom_form).printable_fields
    @idea_rows = idea_rows
  end

  def correct
    return @idea_rows if @idea_rows.blank?

    idea_fields = correctable_idea_fields
    return @idea_rows if idea_fields.blank?

    gpt_response = llm.chat(prompt(idea_fields))
    idea_rows_with_corrected_texts(gpt_response)
  end

  private

  def correctable_idea_fields
    text_fields = @form_fields.select { |f| f.input_type.in?(JUMBLING_FIELD_TYPES) }
    core_fields = text_fields.filter_map { _1.code&.to_sym }
    custom_fields = text_fields.reject(&:code?).map { _1.key&.to_sym }

    return [] if core_fields.blank? && custom_fields.blank?

    # Make sure each row has a unique ID
    @idea_rows = @idea_rows.map.with_index do |row, index|
      row[:id] = index + 1
      row
    end

    @idea_rows.filter_map do |idea_row|
      idea_to_correct = idea_row.slice(*core_fields).transform_values(&:presence).compact
      values = idea_row[:custom_field_values]&.slice(*custom_fields)&.transform_values(&:presence)&.compact
      idea_to_correct[:custom_field_values] = values if values.present?
      next if idea_to_correct.blank?

      idea_to_correct[:id] = idea_row[:id]
      idea_to_correct
    end
  end

  def prompt(ideas_to_correct)
    <<~GPT_PROMPT
      At the end of this message, you’ll find a JSON array of objects. The fields within these objects contain texts that have been extracted through the recognition of handwritten text. However, in many cases, inaccuracies may occur. Lines and some words could be mixed up.


      Your task is to correct the texts to ensure that each one makes sense. Follow these rules:
      - Do not remove anything from the original text.
      - Don't skip words that make sense in the context. Consider rather fixing a typo in a word than removing it.
      - Maintain the meaning without altering it.
      - Leave numbers unchanged. E.g., "3" should remain "3", not "three". The same applies to all other digits from 0 to 9.
      - If a text already makes sense, leave it unchanged.


      Return the JSON array with the same objects in the same order, but with corrected texts. Provide only the JSON without any additional text or markers.


      JSON array:
      #{ideas_to_correct.to_json}
    GPT_PROMPT
  end

  def idea_rows_with_corrected_texts(gpt_response)
    corrected_ideas_json = gpt_response.match(/\[.+\]/m)&.try(:[], 0) # to be sure it can always be parsed

    if corrected_ideas_json.present? && corrected_ideas_json.length > 2 # JSON array with some values
      corrected_ideas = JSON.parse(corrected_ideas_json, symbolize_names: true).index_by { _1[:id] }

      @idea_rows.map do |idea_row|
        idea_row.deep_merge(corrected_ideas[idea_row[:id]] || {})
      end
    else
      handle_gpt_error(gpt_response)
    end
  rescue JSON::ParserError
    handle_gpt_error(gpt_response)
  end

  # To track regression
  def handle_gpt_error(gpt_response)
    ErrorReporter.report_msg("GPT didn't return a proper response", extra: {
      project_id: @phase.project.id, phase_id: @phase.id, gpt_response:
    })
    @idea_rows
  end

  def llm
    @llm ||= Analysis::LLM::GPT41.new
  end
end
