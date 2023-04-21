# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Ideas' do
  explanation 'Proposals from citizens to the city.'

  before { header 'Content-Type', 'application/json' }

  context 'when visitor' do
    describe 'Create' do
      before { IdeaStatus.create_defaults }

      with_options scope: :idea do
        parameter :project_id, 'The identifier of the project that hosts the survey', required: true
        parameter :phase_ids, 'The phases the response is part of, defaults to the current only, only allowed by admins'
        parameter :author_id, 'The ID of the user who submitted the response', required: false
        parameter :custom_field_name1, 'A value for one custom field'
      end

      let(:idea) { build(:idea) }
      let(:project) do
        create(:continuous_native_survey_project, with_permissions: true).tap do |project|
          project.permissions.find_by(action: 'posting_idea').update! permitted_by: 'everyone'
        end
      end
      let(:project_id) { project.id }
      let(:extra_field_name) { 'custom_field_name1' }
      let(:form) { create(:custom_form, participation_context: project) }
      let!(:text_field) { create(:custom_field_extra_custom_form, key: extra_field_name, required: true, resource: form) }
      let(:custom_field_name1) { 'test value' }

      post 'web_api/v1/ideas' do
        example_request 'Create a native survey response without author' do
          assert_status 201
          json_response = json_parse response_body
          idea_from_db = Idea.find(json_response[:data][:id])
          expect(idea_from_db.author_id).to be_nil
          expect(idea_from_db.custom_field_values.to_h).to eq({
            extra_field_name => 'test value'
          })
        end
      end
    end
  end
end
