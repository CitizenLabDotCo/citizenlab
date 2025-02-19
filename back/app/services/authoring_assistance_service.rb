class AuthoringAssistanceService
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
    threshold = 0.4 # TODO: Define good threshold
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
    response = CustomFreePromptService.new(authoring_assistance_response).response
    response ? { custom_free_prompt_response: response } : {}
  end
end
