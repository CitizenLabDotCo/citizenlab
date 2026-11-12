# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Pulse checks' do
  explanation 'Short in-product survey questions asked to admins and project managers.'
  header 'Content-Type', 'application/json'

  let(:user) { create(:admin) }

  before { header_token_for(user) }

  post 'web_api/v1/pulse_checks/show_next' do
    parameter :trigger, "The moment the check happens: 'save' or 'project_exit'", required: true
    parameter :ui_version, 'The back office version the user is in', required: true
    parameter :project_id, 'The current project, or the project being left'
    parameter :admin_area, 'The route pattern of the back office page the user is on (or just left)'

    let(:trigger) { 'save' }
    let(:ui_version) { 'project_backoffice_v1' }
    let(:admin_area) { '/:locale/admin/projects/:projectId/general' }

    example 'Show the next due pulse check' do
      pulse_check = create(:pulse_check, user: user)
      do_request
      assert_status 200
      expect(response_data).to include(id: pulse_check.id, attributes: { key: 'return_findability', status: 'shown' })
      expect(pulse_check.reload).to have_attributes(trigger: 'save', admin_area: '/:locale/admin/projects/:projectId/general')
    end

    example "Do not return another project's setup question", document: false do
      project = create(:project)
      create(:pulse_check, user: user, key: 'project_setup_ease', subject: project)
      do_request(project_id: create(:project).id)
      assert_status 204
      do_request(project_id: project.id)
      assert_status 200
    end

    example 'Return no pulse check when none is due', document: false do
      do_request
      assert_status 204
    end

    example '[error] Show the next pulse check with invalid parameters', document: false do
      create(:pulse_check, user: user)
      do_request(trigger: 'unknown', ui_version: 'unknown')
      assert_status 422
      expect(json_response_body[:errors].keys).to contain_exactly(:trigger, :ui_version)
    end

    example 'Show a pulse check on any project back office page', document: false do
      pulse_check = create(:pulse_check, user: user)
      do_request(admin_area: '/:locale/admin/projects/:projectId/phases/:phaseId/some-new-page')
      assert_status 200
      expect(pulse_check.reload.admin_area).to eq '/:locale/admin/projects/:projectId/phases/:phaseId/some-new-page'
    end

    example 'Ignore an admin area that is not a route pattern', document: false do
      pulse_check = create(:pulse_check, user: user)
      do_request(admin_area: '/en/admin/projects/some-slug')
      assert_status 204
      expect(pulse_check.reload.status).to eq 'pending'
    end

    example 'Do not show a project pulse check outside the project back office', document: false do
      pulse_check = create(:pulse_check, user: user)
      do_request(admin_area: '/:locale/admin/dashboard/overview')
      assert_status 204
      expect(pulse_check.reload.status).to eq 'pending'
    end

    context 'when the user is a resident' do
      let(:user) { create(:user) }

      example_request '[error] Show the next pulse check', document: false do
        assert_status 401
      end
    end
  end

  patch 'web_api/v1/pulse_checks/:id/answer' do
    with_options scope: :pulse_check do
      parameter :score, 'From 1 (very hard) to 7 (very easy)', required: true
      parameter :comment, 'Optional comment'
    end

    let(:pulse_check) { create(:pulse_check, :shown, user: user) }
    let(:id) { pulse_check.id }
    let(:score) { 6 }
    let(:comment) { 'Found it quickly' }

    example_request 'Answer a pulse check' do
      assert_status 200
      expect(pulse_check.reload).to have_attributes(status: 'answered', score: 6, comment: 'Found it quickly')
      expect(pulse_check.responded_at).to be_present
    end

    example 'Save a score before adding a comment', document: false do
      do_request(pulse_check: { score: 6, comment: nil })
      assert_status 200
      expect(pulse_check.reload).to have_attributes(status: 'answered', score: 6, comment: nil)
      responded_at = pulse_check.responded_at

      do_request(pulse_check: { score: 7, comment: 'Found it quickly' })
      assert_status 200
      expect(pulse_check.reload).to have_attributes(score: 7, comment: 'Found it quickly', responded_at: responded_at)
    end

    example '[error] Answer with an invalid score', document: false do
      do_request(pulse_check: { score: 8 })
      assert_status 422
    end

    context 'when the pulse check belongs to someone else' do
      let(:pulse_check) { create(:pulse_check, :shown) }

      example_request '[error] Answer a pulse check', document: false do
        assert_status 401
      end
    end

    context 'when the pulse check was not shown' do
      let(:pulse_check) { create(:pulse_check, user: user) }

      example_request '[error] Answer a pulse check', document: false do
        assert_status 401
      end
    end
  end

  patch 'web_api/v1/pulse_checks/:id/dismiss' do
    let(:pulse_check) { create(:pulse_check, :shown, user: user) }
    let(:id) { pulse_check.id }

    context 'when the score was already saved' do
      let(:pulse_check) { create(:pulse_check, :shown, user: user, status: 'answered', score: 6) }

      example_request '[error] Dismiss an answered pulse check', document: false do
        assert_status 401
        expect(pulse_check.reload).to have_attributes(status: 'answered', score: 6)
      end
    end

    example_request 'Dismiss a pulse check' do
      assert_status 200
      expect(pulse_check.reload).to have_attributes(status: 'dismissed', responded_at: be_present)
    end
  end
end
