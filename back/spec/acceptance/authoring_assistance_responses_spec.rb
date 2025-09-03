require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'AuthoringAssistanceResponse' do
  explanation 'Authoring assistance responses are used to store gentle suggestions on how the author could improve their input, often by running LLM prompts in parallel.'
  header 'Content-Type', 'application/json'

  post 'web_api/v1/ideas/:idea_id/authoring_assistance_responses' do
    parameter :regenerate, 'When true, a new response is always created.', required: false
    with_options scope: :authoring_assistance_response do
      parameter :custom_free_prompt, 'The custom free-text prompt that allows super admins to experiment with.', required: false
    end
    ValidationErrorHelper.new.error_fields(self, AuthoringAssistanceResponse)

    before { header_token_for user }

    let(:idea) { create(:idea) }
    let(:idea_id) { idea.id }
    let(:custom_free_prompt) { build(:authoring_assistance_response).custom_free_prompt }

    context 'when super admin' do
      let(:user) { create(:super_admin) }

      example 'Return the latest response when responses already exist' do
        expected_response = create(:authoring_assistance_response, idea: idea, created_at: 1.day.ago)
        expected_response.prompt_response['duplicate_inputs'] = [create(:idea, project: idea.project).id]
        expected_response.save!
        create(:authoring_assistance_response, idea: idea, created_at: 2.days.ago)

        do_request

        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq expected_response.id
        expect(json_response.dig(:data, :attributes, :prompt_response).stringify_keys).to match expected_response.prompt_response
      end
    end

    context 'when not super admin' do
      let(:user) { create(:admin) }

      example_request '[error] Returns not authorized' do
        assert_status 401
      end
    end
  end
end
