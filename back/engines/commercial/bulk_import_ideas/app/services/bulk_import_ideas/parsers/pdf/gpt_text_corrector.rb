class BulkImportIdeas::Parsers::Pdf::GPTTextCorrector
  # @param [Array<Hash>] idea_rows - comes from IdeaBaseFileParser#ideas_to_idea_rows
  def initialize(phase, idea_rows)
    @phase = phase
    @idea_rows = idea_rows
  end

  def correct
    return @idea_rows if @idea_rows.blank?

    gpt_response = llm.chat(prompt(correctable_idea_fields))
    idea_rows_with_corrected_texts(gpt_response)
  end

  private

  def correctable_idea_fields
    types = BulkImportIdeas::Exporters::IdeaPdfFormExporter::JUMBLING_FIELD_TYPES
    multiline_fields = @phase.project.custom_form.custom_fields.select { |f| f.input_type.in?(types) }
    core_fields = multiline_fields.filter_map { _1.code&.to_sym }
    custom_fields = multiline_fields.reject(&:code?).map { _1.key&.to_sym }

    @idea_rows.map do |idea_row|
      idea_to_correct = idea_row.slice(:id, *core_fields)
      idea_to_correct[:custom_field_values] = idea_row[:custom_field_values].slice(*custom_fields)
      idea_to_correct
    end
  end

  def prompt(ideas_to_correct)
    <<~GPT_PROMPT
      At the end of this message is a JSON array of objects. The fields within these objects are strings that have been extracted through the recognition of handwritten text. But in many cases the texts are recognized innacurately. The lines and some words could be mixed up.

      Correct it to ensure it makes sense. The beginning of each text is likely correct, but the likelihood of errors increases towards the end. Don't remove anything from the original text, don't change the meaning at all, just minimally correct it.

      Return JSON array with the same objects in the same order, but with corrected strings. Return only JSON without any other text or markers.

      #{ideas_to_correct.to_json}
    GPT_PROMPT
  end

  def idea_rows_with_corrected_texts(gpt_response)
    corrected_ideas_json = gpt_response.match(/\[.+\]/)&.try(:[], 0) # to be sure it can always be parsed

    if corrected_ideas_json.present? && corrected_ideas_json.length > 2
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
    ErrorReporter.report_msg("GPT didn't return a proper array", extra: {
      project_id: @phase.project.id, phase_id: @phase.id, gpt_response:
    })
    @idea_rows
  end

  def llm
    @llm ||= Analysis::LLM::GPT4Turbo.new
  end
end
