class CustomFreePromptService
  CUSTOM_FREE_PROMPT_FIELD_CODES = %w[title_multiloc body_multiloc]

  attr_reader :authoring_assistance_response

  def initialize(authoring_assistance_response)
    @authoring_assistance_response = authoring_assistance_response
  end

  def response
    return {} if authoring_assistance_response.custom_free_prompt.blank?

    region = ENV.fetch('AWS_TOXICITY_DETECTION_REGION', nil) # Some clusters (e.g. Canada) are not allowed to send data to the US or Europe.
    return {} if !region

    # TODO: Add description of description field
    llm = Analysis::LLM::ClaudeInstant1.new(region: region)
    prompt = Analysis::LLM::Prompt.new.fetch('custom_free_prompt', input_text:, phase_text:, custom_free_prompt: authoring_assistance_response.custom_free_prompt)
    llm.chat(prompt).strip
  end

  private

  def input
    authoring_assistance_response.idea
  end

  def input_text
    form = input.custom_form
    custom_fields = IdeaCustomFieldsService.new(form).all_fields.select { |field| CUSTOM_FREE_PROMPT_FIELD_CODES.include?(field.code) }
    input2text = Analysis::InputToText.new(custom_fields)
    input2text.formatted(input)
  end

  def phase_text
    phase2text = Analysis::PhaseToText.new
    phase2text.formatted(input.creation_phase_with_fallback)
  end
end
