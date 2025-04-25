class AuthoringAssistanceService
  def initialize(authoring_assistance_response)
    @authoring_assistance_response = authoring_assistance_response
  end

  def analyze!
    toxicity_thread = start_thread { toxicity_response(_1) }
    custom_free_prompt_thread = start_thread { custom_free_prompt_response(_1) }
    [toxicity_thread, custom_free_prompt_thread].each(&:join)
    prompt_response = {
      **duplicate_inputs_response(@authoring_assistance_response),
      **toxicity_thread[:response],
      **custom_free_prompt_thread[:response]
    }
    @authoring_assistance_response.update!(prompt_response: prompt_response)
  end

  private

  def duplicate_inputs_response(authoring_assistance_response)
    service = SimilarIdeasService.new(authoring_assistance_response.idea)
    limit = 5
    title_threshold = phase_for_input(authoring_assistance_response.idea).similarity_threshold_title
    body_threshold = phase_for_input(authoring_assistance_response.idea).similarity_threshold_body
    scope = authoring_assistance_response.idea.project.ideas
    if authoring_assistance_response.idea.author_id
      scope = scope.where.not(author_id: authoring_assistance_response.idea.author_id)
    end
    ideas = service.similar_ideas(scope:, limit:, title_threshold:, body_threshold:)
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

  def phase_for_input(input)
    @phase_for_input ||= TimelineService.new.current_phase_not_archived(input.project) || input.creation_phase || input.phases.last
  end
end
