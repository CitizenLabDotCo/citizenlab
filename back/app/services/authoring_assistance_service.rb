class AuthoringAssistanceService
  CUSTOM_FREE_PROMPT_FIELD_CODES = %w[title_multiloc body_multiloc]

  attr_reader :authoring_assistance_response

  def initialize(authoring_assistance_response)
    @authoring_assistance_response = authoring_assistance_response
  end

  def analyze!
    prompt_response = { # TODO: Run concurrently
      **duplicate_inputs_response,
      **toxicity_response,
      **custom_free_prompt_response
    }
    authoring_assistance_response.update!(prompt_response: prompt_response)
  end

  private

  def duplicate_inputs_response
    service = SimilarIdeasService.new(authoring_assistance_response.idea)
    service.upsert_embedding!
    threshold = 0.5 # TODO: Define good threshold
    ideas = service.similar_ideas(limit: 5, distance_threshold: threshold)
    {
      duplicate_inputs: ideas.ids
    }
  end

  def toxicity_response
    service = FlagInappropriateContent::ToxicityDetectionService.new
    result = service.check_toxicity(authoring_assistance_response.idea)
    result || {}
  end

  def custom_free_prompt_response
    return {} if authoring_assistance_response.custom_free_prompt.blank?

    region = ENV.fetch('AWS_TOXICITY_DETECTION_REGION', nil) # Some clusters (e.g. Canada) are not allowed to send data to the US or Europe.
    return {} if !region

    form = authoring_assistance_response.idea.custom_form
    custom_fields = IdeaCustomFieldsService.new(form).all_fields.select { |field| CUSTOM_FREE_PROMPT_FIELD_CODES.include?(field.code) }
    input2text = Analysis::InputToText.new(custom_fields)
    idea_text = input2text.formatted(authoring_assistance_response.idea)
    phase = TimelineService.new.current_phase(authoring_assistance_response.idea.project)
    phase2text = Analysis::PhaseToText.new
    phase_text = phase2text.formatted(phase)
    llm = Analysis::LLM::ClaudeInstant1.new(region: region)
    prompt = Analysis::LLM::Prompt.new.fetch('custom_free_prompt', idea_text:, phase_text:, custom_free_prompt: authoring_assistance_response.custom_free_prompt)
    response = llm.chat(prompt).strip
    {
      custom_free_prompt_response: response
    }
  end
end
