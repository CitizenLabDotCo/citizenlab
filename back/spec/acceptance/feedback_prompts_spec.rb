# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Feedback prompts' do
  explanation 'Short in-product survey questions asked to admins and project managers.'
  header 'Content-Type', 'application/json'

  let(:user) { create(:admin) }

  before { header_token_for(user) }

  post 'web_api/v1/feedback_prompts/show_next' do
    parameter :trigger, "The moment the check happens: 'save' or 'project_exit'", required: true
    parameter :ui_version, 'The back office version the user is in', required: true
    parameter :admin_area, 'The route pattern of the back office page the user is on (or just left)'

    let(:trigger) { 'save' }
    let(:ui_version) { 'project_backoffice_v1' }
    let(:admin_area) { '/:locale/admin/projects/:projectId/general' }

    example 'Show the next due prompt' do
      prompt = create(:feedback_prompt, user: user)
      do_request
      assert_status 200
      expect(response_data).to include(id: prompt.id, attributes: { key: 'return_findability', status: 'shown' })
      expect(prompt.reload).to have_attributes(trigger: 'save', admin_area: '/:locale/admin/projects/:projectId/general')
    end

    example 'Return no prompt when none is due', document: false do
      do_request
      assert_status 204
    end

    example '[error] Show the next prompt with invalid parameters', document: false do
      create(:feedback_prompt, user: user)
      do_request(trigger: 'unknown', ui_version: 'unknown')
      assert_status 422
      expect(json_response_body[:errors].keys).to contain_exactly(:trigger, :ui_version)
    end

    example 'Ignore an admin area that is not a route pattern', document: false do
      prompt = create(:feedback_prompt, user: user)
      do_request(admin_area: '/en/admin/projects/some-slug')
      assert_status 204
      expect(prompt.reload.status).to eq 'pending'
    end

    example 'Do not show a project prompt outside the project back office', document: false do
      prompt = create(:feedback_prompt, user: user)
      do_request(admin_area: '/:locale/admin/dashboard/overview')
      assert_status 204
      expect(prompt.reload.status).to eq 'pending'
    end

    context 'when the user is a resident' do
      let(:user) { create(:user) }

      example_request '[error] Show the next prompt', document: false do
        assert_status 401
      end
    end
  end

  patch 'web_api/v1/feedback_prompts/:id/answer' do
    with_options scope: :feedback_prompt do
      parameter :score, 'From 1 (very hard) to 7 (very easy)', required: true
      parameter :comment, 'Optional comment'
    end

    let(:prompt) { create(:feedback_prompt, :shown, user: user) }
    let(:id) { prompt.id }
    let(:score) { 6 }
    let(:comment) { 'Found it quickly' }

    example_request 'Answer a prompt' do
      assert_status 200
      expect(prompt.reload).to have_attributes(status: 'answered', score: 6, comment: 'Found it quickly')
      expect(prompt.responded_at).to be_present
    end

    example '[error] Answer with an invalid score', document: false do
      do_request(feedback_prompt: { score: 8 })
      assert_status 422
    end

    context 'when the prompt belongs to someone else' do
      let(:prompt) { create(:feedback_prompt, :shown) }

      example_request '[error] Answer a prompt', document: false do
        assert_status 401
      end
    end

    context 'when the prompt was not shown' do
      let(:prompt) { create(:feedback_prompt, user: user) }

      example_request '[error] Answer a prompt', document: false do
        assert_status 401
      end
    end
  end

  patch 'web_api/v1/feedback_prompts/:id/dismiss' do
    let(:prompt) { create(:feedback_prompt, :shown, user: user) }
    let(:id) { prompt.id }

    example_request 'Dismiss a prompt' do
      assert_status 200
      expect(prompt.reload).to have_attributes(status: 'dismissed', responded_at: be_present)
    end
  end
end
