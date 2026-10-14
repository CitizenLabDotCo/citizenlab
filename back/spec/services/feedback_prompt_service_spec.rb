# frozen_string_literal: true

require 'rails_helper'

describe FeedbackPromptService do
  let(:service) { described_class.new }
  let(:user) { create(:admin) }
  let(:project_area) { '/:locale/admin/projects/:projectId/general' }

  describe '#enqueue' do
    it 'creates a pending prompt' do
      prompt = service.enqueue(user, 'return_findability')
      expect(prompt).to have_attributes(status: 'pending', key: 'return_findability', user: user)
    end

    it 'does not create a prompt for a resident' do
      expect(service.enqueue(create(:user), 'return_findability')).to be_nil
    end

    it 'creates a prompt for a project moderator' do
      expect(service.enqueue(create(:project_moderator), 'return_findability')).to be_present
    end

    it 'does not create a second prompt for the same subject' do
      project = create(:project)
      service.enqueue(user, 'project_setup_ease', subject: project)
      expect(service.enqueue(create(:admin), 'project_setup_ease', subject: project)).to be_nil
    end

    it 'creates a prompt per subject while another one is still pending' do
      service.enqueue(user, 'project_setup_ease', subject: create(:project))
      expect(service.enqueue(user, 'project_setup_ease', subject: create(:project))).to be_present
    end

    it 'does not create a second pending prompt with the same key' do
      service.enqueue(user, 'return_findability')
      expect(service.enqueue(user, 'return_findability')).to be_nil
    end

    it 'does not create a prompt the user was shown within its cooldown' do
      create(:feedback_prompt, :shown, user: user, key: 'project_setup_ease', subject: create(:project), shown_at: 10.days.ago)
      expect(service.enqueue(user, 'project_setup_ease', subject: create(:project))).to be_nil
    end

    it 'creates a new pending prompt when the previous one expired' do
      travel_to(15.days.ago) { service.enqueue(user, 'return_findability') }
      expect(service.enqueue(user, 'return_findability')).to be_present
    end
  end

  describe '#after_project_update' do
    let(:project) { create(:project, admin_publication_attributes: { publication_status: 'draft' }) }

    def update_publication(attributes)
      project.update!(admin_publication_attributes: attributes)
      service.after_project_update(project, user)
    end

    it 'enqueues a setup prompt when the project is published for the first time' do
      update_publication(publication_status: 'published')
      expect(FeedbackPrompt.find_by(key: 'project_setup_ease', subject: project, user: user)).to be_present
    end

    it 'enqueues a setup prompt when the first publication is scheduled' do
      update_publication(scheduled_status: 'published', scheduled_at: 1.day.from_now, scheduled_by_id: user.id)
      expect(FeedbackPrompt.find_by(key: 'project_setup_ease', subject: project, user: user)).to be_present
    end

    it 'does not enqueue a prompt when a scheduled publication goes live' do
      travel_to(2.days.ago) do
        project.update!(admin_publication_attributes: {
          scheduled_status: 'published', scheduled_at: 1.day.from_now, scheduled_by_id: user.id
        })
      end
      update_publication(publication_status: 'published', scheduled_status: nil, scheduled_at: nil, scheduled_by_id: nil)
      expect(FeedbackPrompt.count).to eq 0
    end

    it 'does not enqueue a prompt when the project is republished' do
      project.admin_publication.update!(publication_status: 'published')
      project.admin_publication.update!(publication_status: 'archived')
      update_publication(publication_status: 'published')
      expect(FeedbackPrompt.count).to eq 0
    end

    it 'does not enqueue a prompt for other changes' do
      project.update!(title_multiloc: { 'en' => 'New title' })
      service.after_project_update(project, user)
      expect(FeedbackPrompt.count).to eq 0
    end
  end

  describe '#after_project_create' do
    it 'enqueues a setup prompt when the project is created published' do
      project = create(:project, admin_publication_attributes: { publication_status: 'published' })
      service.after_project_create(project, user)
      expect(FeedbackPrompt.find_by(key: 'project_setup_ease', subject: project)).to be_present
    end

    it 'does not enqueue a prompt for a draft project' do
      project = create(:project, admin_publication_attributes: { publication_status: 'draft' })
      service.after_project_create(project, user)
      expect(FeedbackPrompt.count).to eq 0
    end
  end

  describe '#after_session_start' do
    it 'enqueues a findability prompt when the user returns after 60+ days' do
      service.after_session_start(user, 61.days.ago)
      expect(user.feedback_prompts.sole).to have_attributes(key: 'return_findability', days_since_last_active: 61)
    end

    it 'does not enqueue a prompt when the user was active recently' do
      service.after_session_start(user, 59.days.ago)
      expect(user.feedback_prompts).to be_empty
    end

    it 'does not enqueue a prompt for a user who was never active' do
      service.after_session_start(user, nil)
      expect(user.feedback_prompts).to be_empty
    end
  end

  describe '#show_next' do
    it 'only shows setup feedback in the project it belongs to' do
      project = create(:project)
      prompt = create(:feedback_prompt, user: user, key: 'project_setup_ease', subject: project)
      other_project = create(:project)
      expect(service.show_next(user, trigger: 'save', admin_area: project_area, project_id: other_project.id, ui_version: 'project_backoffice_v1')).to be_nil
      expect(prompt.reload.status).to eq 'pending'
      expect(service.show_next(user, trigger: 'save', admin_area: project_area, project_id: project.id, ui_version: 'project_backoffice_v1')).to eq prompt
    end

    it 'expires setup feedback for a deleted project' do
      project = create(:project)
      prompt = create(:feedback_prompt, user: user, key: 'project_setup_ease', subject: project)
      project.destroy!
      expect(service.show_next(user, trigger: 'save', admin_area: project_area, project_id: project.id, ui_version: 'project_backoffice_v1')).to be_nil
      expect(prompt.reload.status).to eq 'expired'
    end

    it 'cannot show a prompt twice' do
      create(:feedback_prompt, user: user)
      expect(service.show_next(user, trigger: 'save', admin_area: project_area, ui_version: 'project_backoffice_v1')).to be_present
      expect(service.show_next(user, trigger: 'save', admin_area: project_area, ui_version: 'project_backoffice_v1')).to be_nil
    end

    it 'marks the oldest pending prompt as shown, with a context snapshot' do
      project = create(:project)
      older = create(:feedback_prompt, user: user, key: 'project_setup_ease', subject: project, created_at: 2.hours.ago)
      create(:feedback_prompt, user: user, created_at: 1.hour.ago)

      prompt = service.show_next(user, trigger: 'save', admin_area: project_area, project_id: project.id, ui_version: 'project_backoffice_v2')

      expect(prompt).to eq older
      expect(prompt.reload).to have_attributes(
        status: 'shown',
        ui_version: 'project_backoffice_v2',
        staff: false,
        role: 'admin',
        project_origin: 'blank'
      )
      expect(prompt.shown_at).to be_present
    end

    it 'flags Go Vocal staff' do
      staff = create(:super_admin)
      create(:feedback_prompt, user: staff)
      expect(service.show_next(staff, trigger: 'save', admin_area: project_area, ui_version: 'project_backoffice_v1')).to have_attributes(staff: true, role: 'super_admin')
    end

    it 'does not show a prompt again within its cooldown' do
      create(:feedback_prompt, :shown, user: user, key: 'project_setup_ease', subject: create(:project), shown_at: 59.days.ago)
      pending = create(:feedback_prompt, user: user, key: 'project_setup_ease', subject: create(:project))
      expect(service.show_next(user, trigger: 'save', admin_area: project_area, project_id: pending.subject_id, ui_version: 'project_backoffice_v1')).to be_nil
    end

    it 'shows a prompt again once its cooldown has passed' do
      create(:feedback_prompt, :shown, user: user, key: 'project_setup_ease', subject: create(:project), shown_at: 61.days.ago)
      pending = create(:feedback_prompt, user: user, key: 'project_setup_ease', subject: create(:project))
      expect(service.show_next(user, trigger: 'save', admin_area: project_area, project_id: pending.subject_id, ui_version: 'project_backoffice_v1')).to be_present
    end

    it 'shows a prompt even when another prompt was shown recently' do
      create(:feedback_prompt, :shown, user: user, key: 'project_setup_ease', subject: create(:project), shown_at: 1.day.ago)
      create(:feedback_prompt, user: user, key: 'return_findability')
      expect(service.show_next(user, trigger: 'save', admin_area: project_area, ui_version: 'project_backoffice_v1')).to have_attributes(key: 'return_findability')
    end

    it 'only shows a prompt at one of its triggers' do
      create(:feedback_prompt, user: user, key: 'project_setup_ease', subject: create(:project))
      expect(service.show_next(user, trigger: 'project_exit', admin_area: project_area, ui_version: 'project_backoffice_v1')).to be_nil
    end

    it 'does not show a project prompt outside the project back office' do
      create(:feedback_prompt, user: user, key: 'return_findability')
      expect(service.show_next(user, trigger: 'save', admin_area: '/:locale/admin/dashboard/overview', ui_version: 'project_backoffice_v1')).to be_nil
      expect(service.show_next(user, trigger: 'save', ui_version: 'project_backoffice_v1')).to be_nil
    end

    it 'records the trigger and admin area' do
      create(:feedback_prompt, user: user, key: 'return_findability')
      prompt = service.show_next(
        user,
        trigger: 'project_exit',
        ui_version: 'project_backoffice_v1',
        admin_area: '/:locale/admin/projects/:projectId/phases/:phaseId/insights'
      )
      expect(prompt).to have_attributes(
        trigger: 'project_exit',
        admin_area: '/:locale/admin/projects/:projectId/phases/:phaseId/insights'
      )
    end

    it 'records how many prompts the user saw before' do
      create(:feedback_prompt, :shown, user: user, key: 'project_setup_ease', subject: create(:project), shown_at: 90.days.ago)
      create(:feedback_prompt, :shown, user: user, key: 'return_findability', shown_at: 40.days.ago, status: 'dismissed')
      create(:feedback_prompt, user: user)
      expect(service.show_next(user, trigger: 'save', admin_area: project_area, ui_version: 'project_backoffice_v1').previously_shown_count).to eq 2
    end

    it 'skips expired pending prompts' do
      expired = create(:feedback_prompt, user: user, created_at: 15.days.ago)
      expect(service.show_next(user, trigger: 'save', admin_area: project_area, ui_version: 'project_backoffice_v1')).to be_nil
      expect(expired.reload.status).to eq 'expired'
      expect(FeedbackPrompt.cooling_down?('return_findability', user)).to be false
    end

    it 'does not guess the origin of an ambiguous project import' do
      project = create(:project)
      BulkImportIdeas::ProjectImport.create!(project: project, import_type: 'project_copy', log: [])
      create(:feedback_prompt, user: user, key: 'project_setup_ease', subject: project)
      expect(service.show_next(user, trigger: 'save', admin_area: project_area, project_id: project.id, ui_version: 'project_backoffice_v1').project_origin).to eq 'unknown'
    end

    it 'records a copied project as such' do
      project = create(:project)
      create(:activity, item: project, action: 'local_copy_created')
      create(:feedback_prompt, user: user, key: 'project_setup_ease', subject: project)
      expect(service.show_next(user, trigger: 'save', admin_area: project_area, project_id: project.id, ui_version: 'project_backoffice_v1').project_origin).to eq 'copy'
    end
  end
end
