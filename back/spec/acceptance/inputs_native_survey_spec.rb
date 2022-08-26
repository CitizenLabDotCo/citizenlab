# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Ideas' do
  explanation 'Inputs posted by citizens: ideas or native surveys.'

  before do
    header 'Content-Type', 'application/json'
    token = Knock::AuthToken.new(payload: current_user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"

    SettingsService.new.activate_feature! 'idea_custom_fields'
    SettingsService.new.activate_feature! 'dynamic_idea_form'
  end

  # TODO: Native surveys
  # Posting input in continuous native survey
  # Posting input in timeline with two survey phases (post in the one that is not active)
  # Posting input in timeline with idea and survey phases (none is active)
  # Does not create upvote
  # Does not auto-assign phase
  # [error] Posting input without phase
  # [error] Posting input in survey and other phase
  # [error] Normal users can only post in current phase
  # [error] Posting as normal user when posting is disabled

  # TODO: Ideas
  # Posting idea when there is native survey phase
  # Posting idea when there are no phases

  context 'when normal user' do
    let(:current_user) { create :user }

    post 'web_api/v1/ideas' do
      with_options scope: :idea do
        parameter :project_id, 'The identifier of the project that hosts the idea', required: true
        parameter :custom_field_values, 'The values for the custom question fields asked when submitting the input'
      end
      ValidationErrorHelper.new.error_fields self, Idea

      describe 'in a continuous native survey' do
        let(:project) { create :continuous_native_survey_project }
        let(:project_id) { project.id }

        example_request 'Create an input' do
          assert_status 201
          json_response = json_parse response_body
          expect(json_response.dig(:data, :relationships, :project, :data, :id)).to eq project_id
          expect(project.reload.ideas_count).to eq 1
        end
      end
    end
  end
end
