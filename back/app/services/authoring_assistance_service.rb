class AuthoringAssistanceService
  DEFAULT_NUM_SIMILAR_IDEAS = 10
  DEFAULT_EMBEDDED_ATTRIBUTES = 'title_body'

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
    result = FlagInappropriateContent::ToxicityDetectionService.new.check_toxicity(
      authoring_assistance_response.idea,
      attributes: %i[title_multiloc body_multiloc location_description] # TODO: Extract helper methods for supported attributes
    )
    result || {}
  end

  def custom_free_prompt_response
    {
      custom_free_prompt_response: nil
    }
  end
end
