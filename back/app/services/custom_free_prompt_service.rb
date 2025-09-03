class CustomFreePromptService
  CUSTOM_FREE_PROMPT_FIELD_CODES = %w[title_multiloc body_multiloc]

  attr_reader :authoring_assistance_response, :multiloc_service

  def initialize(authoring_assistance_response)
    @authoring_assistance_response = authoring_assistance_response
    @multiloc_service = MultilocService.new
  end

  def response
    return {} if authoring_assistance_response.custom_free_prompt.blank?

    llm = Analysis::LLM::GPT41.new
    prompt = Analysis::LLM::Prompt.new.fetch('custom_free_prompt', input_text:, phase_text:, body_field_text:, custom_free_prompt: authoring_assistance_response.custom_free_prompt)
    llm.chat(prompt).strip
  end

  private

  def input
    authoring_assistance_response.idea
  end

  def custom_fields
    @custom_fields ||= IdeaCustomFieldsService.new(input.custom_form).all_fields.select { |field| CUSTOM_FREE_PROMPT_FIELD_CODES.include?(field.code) }
  end

  def input_text
    input2text = Analysis::InputToText.new(custom_fields)
    input2text.formatted(input)
  end

  def phase_text
    phase2text = Analysis::PhaseToText.new
    phase2text.formatted(input.creation_phase_with_fallback)
  end

  def body_field_text
    body_field = custom_fields.find { |field| field.code == 'body_multiloc' }
    body_description = body_field&.description_multiloc
    return false if body_description.blank?

    html = multiloc_service.t(body_description)
    Nokogiri::HTML(html).text
  end
end
