class AuthoringAssistanceService
  def initialize(authoring_assistance_response)
    @authoring_assistance_response = authoring_assistance_response
  end

  def analyze!
    duplicate_inputs_thread = start_thread { |aaresponse| duplicate_inputs_response(aaresponse) }
    toxicity_thread = start_thread { |aaresponse| toxicity_response(aaresponse) }
    custom_free_prompt_thread = start_thread { |aaresponse| custom_free_prompt_response(aaresponse) }
    [duplicate_inputs_thread, toxicity_thread, custom_free_prompt_thread].each(&:join)
    prompt_response = {
      **duplicate_inputs_thread[:response],
      **toxicity_thread[:response],
      **custom_free_prompt_thread[:response]
    }
    @authoring_assistance_response.update!(prompt_response: prompt_response)
  end

  private

  def duplicate_inputs_response(authoring_assistance_response)
    service = SimilarIdeasService.new(authoring_assistance_response.idea)
    service.upsert_embedding!
    threshold = 0.4 # TODO: Define good threshold
    ideas = service.similar_ideas(limit: 5, distance_threshold: threshold)
    {
      duplicate_inputs: ideas.ids
    }
  end

  def toxicity_response(authoring_assistance_response)
    service = FlagInappropriateContent::ToxicityDetectionService.new
    result = service.check_toxicity(authoring_assistance_response.idea)
    result || {}
  end

  def custom_free_prompt_response(authoring_assistance_response)
    response = CustomFreePromptService.new(authoring_assistance_response).response
    response ? { custom_free_prompt_response: response } : {}
  end

  def start_thread
    Thread.new(Tenant.current, @authoring_assistance_response) do |local_tenant, local_authoring_assistance_response|
      local_tenant.switch do
        Thread.current[:response] = yield(local_authoring_assistance_response)
      end
    end
  end
end
