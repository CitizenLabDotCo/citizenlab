# frozen_string_literal: true

require 'rails_helper'

describe SideFxProjectService do
  let(:sfx_pc) { instance_double(SideFxParticipationContextService) }
  let(:service) { described_class.new(sfx_pc) }
  let(:user) { create(:user) }
  let(:project) { create(:project) }

  describe 'after_create' do
    it "logs a 'created' action when a project is created" do
      expect { service.after_create(project, user) }
        .to have_enqueued_job(LogActivityJob).with(project, 'created', user, project.created_at.to_i)
    end

    it 'calls after_create on SideFxParticipationContextService for a continuous project' do
      continuous_project = create(:continuous_project)
      expect(sfx_pc).to receive(:after_create).with(continuous_project, user)
      service.after_create(continuous_project, user)
    end

    it "doesn't call after_create on SideFxParticipationContextService for a timeline project" do
      service.after_create(project, user)
    end

    it 'runs the description through the text image service' do
      expect_any_instance_of(TextImageService).to receive(:swap_data_images).with(project, :description_multiloc).and_return(project.description_multiloc)
      service.after_create(project, user)
    end
  end

  describe 'before_update' do
    it 'runs the description through the text image service' do
      expect_any_instance_of(TextImageService).to receive(:swap_data_images).with(project, :description_multiloc).and_return(project.description_multiloc)
      service.before_update(project, user)
    end
  end

  describe 'after_update' do
    it "logs a 'changed' action job when the project has changed" do
      project.update(title_multiloc: { en: 'changed' })
      expect { service.after_update(project, user) }
        .to have_enqueued_job(LogActivityJob).with(project, 'changed', user, project.updated_at.to_i)
    end

    it 'calls before_update on SideFxParticipationContextService for a continuous project' do
      continuous_project = build(:continuous_project)
      expect(sfx_pc).to receive(:before_update).with(continuous_project, user)
      service.before_update(continuous_project, user)
    end

    it "doesn't call before_update on SideFxParticipationContextService for a timeline project" do
      service.before_update(project, user)
    end
  end

  describe 'before_destroy' do
    it 'calls before_destroy on SideFxParticipationContextService for a continuous project' do
      continuous_project = build(:continuous_project)
      expect(sfx_pc).to receive(:before_destroy).with(continuous_project, user)
      service.before_destroy(continuous_project, user)
    end

    it "doesn't call before_destroy on SideFxParticipationContextService for a timeline project" do
      service.before_destroy(project, user)
    end
  end

  describe 'after_destroy' do
    it "logs a 'deleted' action job when the project is destroyed" do
      travel_to Time.now do
        frozen_project = project.destroy
        expect { service.after_destroy(frozen_project, user) }
          .to have_enqueued_job(LogActivityJob)
      end
    end
  end

  describe 'after_delete_inputs' do
    it 'logs "inputs_deleted" activity' do
      expect(LogActivityJob).to receive(:perform_later).with(
        project,
        'inputs_deleted',
        user,
        anything
      )
      service.after_delete_inputs project, user
    end
  end

  describe 'after_copy' do
    it 'associates correct groups with group permissions of copied continuous ideation project' do
      groups = create_list(:group, 3)
      source_project = create(:project, participation_method: 'ideation')

      permission1 = build(
        :permission,
        action: 'posting_idea',
        permission_scope_type: 'Project',
        permission_scope_id: source_project.id,
        permitted_by: 'groups',
        groups: groups
      )
      # Skip validation to avoid Validation failed: Action has already been taken
      permission1.save!(validate: false)

      # permission2 is associated with the copied project, but has no groups associated with it,
      # since we need side_fx.after_copy to add the necessary groups_permissions.
      permission2 = build(
        :permission,
        action: 'posting_idea',
        permission_scope_type: 'Project',
        permission_scope_id: project.id,
        permitted_by: 'groups'
      )
      # Skip validation to avoid Validation failed: Action is not included in the list
      permission2.save!(validate: false)

      service.after_copy source_project, project
      expect(project.permissions.first.groups).to eq source_project.permissions.first.groups
    end

    it 'associates correct groups with group permissions of copied ideation phase' do
      groups = create_list(:group, 3)
      source_project = create(:project_with_active_ideation_phase)
      copied_project = create(:project_with_active_ideation_phase)

      permission1 = build(
        :permission,
        action: 'posting_idea',
        permission_scope_type: 'Phase',
        permission_scope_id: source_project.phases.first.id,
        permitted_by: 'groups',
        groups: groups
      )
      # Skip validation to avoid Validation failed: Action has already been taken
      permission1.save!(validate: false)

      # permission2 is associated with the copied project phase, but has no groups associated with it,
      # since we need side_fx.after_copy to add the necessary groups_permissions.
      permission2 = build(
        :permission,
        action: 'posting_idea',
        permission_scope_type: 'Phase',
        permission_scope_id: copied_project.phases.first.id,
        permitted_by: 'groups'
      )
      # Skip validation to avoid Validation failed: Action is not included in the list
      permission2.save!(validate: false)

      # This prevents flakiness, whereby either source or copied project phase would have no groups
      # associated with the permission evaluated in the expectation, in approx 1 out of 3 test runs.
      source_project.phases.first.permissions = [permission1]
      copied_project.phases.first.permissions = [permission2]

      service.after_copy source_project, copied_project
      expect(copied_project.phases.first.permissions.first.groups).to eq source_project.phases.first.permissions.first.groups
    end

    it 'associates areas of source project with copied project' do
      area1 = create(:area)
      area2 = create(:area)
      source_project = build(:project, areas: [area1, area2])

      service.after_copy source_project, project
      expect(project.areas).to eq source_project.areas
    end

    it 'associates topics of source project with copied project' do
      topic1 = create(:topic)
      topic2 = create(:topic)
      source_project = build(:project, topics: [topic1, topic2])

      service.after_copy source_project, project
      expect(project.topics).to eq source_project.topics
    end
  end
end
