class WebApi::V1::AuthoringAssistanceResponseSerializer < WebApi::V1::BaseSerializer
  attributes :custom_free_prompt, :prompt_response, :created_at, :updated_at

  belongs_to :idea
end
