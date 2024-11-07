require 'rails_helper'

describe ProjectsFinderService do
  let(:service) { described_class }
  let(:user) { create(:user) }
  let(:result) { service.new(Project.all, user).participation_possible }

  describe 'participation_possible' do
    let!(:active_ideation_project) { create(:project_with_active_ideation_phase) }
    let!(:_past_project) { create(:project_with_two_past_ideation_phases) }
    let!(:_future_project) { create(:project_with_future_native_survey_phase) }

    it 'filters out projects without active participatory (not information) phase' do
      expect(Project.count).to eq 3
      expect(result[:projects].size).to eq 1
      expect(result[:projects][0].id).to eq active_ideation_project.id
    end

    it 'filters out projects with information phase' do
      create(:project_with_past_ideation_and_current_information_phase)

      expect(Project.count).to eq 4
      expect(result[:projects].size).to eq 1
      expect(result[:projects][0].id).to eq active_ideation_project.id
    end

    it 'filters out projects without a published status' do
      create(:project_with_active_ideation_phase, admin_publication_attributes: { publication_status: 'draft' })
      create(:project_with_active_ideation_phase, admin_publication_attributes: { publication_status: 'archived' })

      expect(Project.count).to eq 5
      expect(result[:projects].size).to eq 1
      expect(result[:projects][0].id).to eq active_ideation_project.id
    end

    it "lists projects ordered by end_at of projects' active phase (ASC NULLS LAST)" do
      soonest_end_at = active_ideation_project.phases.first.end_at

      active_project2 = create(:project_with_active_ideation_phase)
      active_project2.phases.first.update!(end_at: soonest_end_at + 1.day)
      active_project3 = create(:project_with_active_ideation_phase)
      active_project3.phases.first.update!(end_at: soonest_end_at + 2.days)

      expect(Project.count).to eq 5
      expect(result[:projects].size).to eq 3
      expect(result[:projects].map(&:id)).to eq [active_ideation_project.id, active_project2.id, active_project3.id]
    end

    it 'handles case where n of projects is greater than page size * page number' do
      _active_project2 = create(:project_with_active_ideation_phase)
      _active_project3 = create(:project_with_active_ideation_phase)

      result = service.new(Project.all, user, { page: { size: 2, number: 1 } }).participation_possible

      expect(result[:projects].size).to eq 2
    end

    it 'includes action descriptors for each returned project' do
      expect(Project.count).to eq 3
      expect(result[:projects].size).to eq 1
      expect(result[:projects][0].id).to eq active_ideation_project.id

      expect(result[:descriptor_pairs][active_ideation_project.id]).to be_a(Hash).and(include(
        posting_idea: { enabled: true, disabled_reason: nil, future_enabled_at: nil },
        commenting_idea: { enabled: true, disabled_reason: nil },
        reacting_idea: {
          enabled: true,
          disabled_reason: nil,
          up: { enabled: true, disabled_reason: nil },
          down: { enabled: true, disabled_reason: nil }
        },
        comment_reacting_idea: { enabled: true, disabled_reason: nil },
        annotating_document: { enabled: false, disabled_reason: 'not_document_annotation' },
        taking_survey: { enabled: false, disabled_reason: 'not_survey' },
        taking_poll: { enabled: false, disabled_reason: 'not_poll' },
        voting: { enabled: false, disabled_reason: 'not_voting' },
        attending_event: { enabled: true, disabled_reason: nil },
        volunteering: { enabled: false, disabled_reason: 'not_volunteering' }
      ))
    end

    it "excludes projects where only permitted action is attending_event & no permission is 'fixable'" do
      group = create(:group)
      permission = create(:permission, action: 'posting_idea', permission_scope: active_ideation_project.phases.first, permitted_by: 'users')
      create(:groups_permission, permission_id: permission.id, group: group)
      permission = create(:permission, action: 'commenting_idea', permission_scope: active_ideation_project.phases.first, permitted_by: 'users')
      create(:groups_permission, permission_id: permission.id, group: group)
      permission = create(:permission, action: 'reacting_idea', permission_scope: active_ideation_project.phases.first, permitted_by: 'users')
      create(:groups_permission, permission_id: permission.id, group: group)

      user_requirements_service = Permissions::UserRequirementsService.new(check_groups_and_verification: false)
      action_descriptors = Permissions::ProjectPermissionsService.new(
        active_ideation_project, user, user_requirements_service: user_requirements_service
      ).action_descriptors

      expect(action_descriptors.except(:attending_event).all? { |_k, v| v[:enabled] == false }).to be true
      expect(action_descriptors[:posting_idea][:disabled_reason]).to eq 'user_not_in_group'
      expect(action_descriptors[:commenting_idea][:disabled_reason]).to eq 'user_not_in_group'
      expect(action_descriptors[:reacting_idea][:disabled_reason]).to eq 'user_not_in_group'

      expect(Project.count).to eq 3
      expect(result[:projects].size).to eq 0
    end

    it "includes projects where no action permitted (excluding attending_event), but a permission is 'fixable'" do
      create(:custom_field, required: true)

      user_requirements_service = Permissions::UserRequirementsService.new(check_groups_and_verification: false)
      action_descriptors = Permissions::ProjectPermissionsService.new(
        active_ideation_project, user, user_requirements_service: user_requirements_service
      ).action_descriptors

      expect(action_descriptors.except(:attending_event).all? { |_k, v| v[:enabled] == false }).to be true
      expect(action_descriptors[:posting_idea][:disabled_reason]).to eq 'user_missing_requirements'

      expect(Project.count).to eq 3
      expect(result[:projects].size).to eq 1
      expect(result[:projects][0].id).to eq active_ideation_project.id
    end

    it 'caches the result for 1 hour if user is not logged in' do
      Rails.cache.clear
      start_at = Time.zone.now
      result = service.new(Project.all, nil).participation_possible

      expect(Project.count).to eq 3
      expect(result[:projects].size).to eq 1
      expect(result[:projects][0].id).to eq active_ideation_project.id

      active_ideation_project2 = create(:project_with_active_ideation_phase)
      result = service.new(Project.all, nil).participation_possible

      expect(Project.count).to eq 4
      expect(result[:projects].size).to eq 1
      expect(result[:projects][0].id).to eq active_ideation_project.id

      travel_to(start_at + 61.minutes) do
        result = service.new(Project.all, nil).participation_possible

        expect(Project.count).to eq 4
        expect(result[:projects].size).to eq 2
        expect(result[:projects].map(&:id)).to match_array([active_ideation_project.id, active_ideation_project2.id])
      end
    end

    it 'does not use cached result if user is logged in' do
      Rails.cache.clear
      result = service.new(Project.all, nil).participation_possible

      expect(Project.count).to eq 3
      expect(result[:projects].size).to eq 1
      expect(result[:projects][0].id).to eq active_ideation_project.id

      active_ideation_project2 = create(:project_with_active_ideation_phase)
      result = service.new(Project.all, user).participation_possible

      expect(Project.count).to eq 4
      expect(result[:projects].size).to eq 2
      expect(result[:projects].map(&:id)).to match_array([active_ideation_project.id, active_ideation_project2.id])
    end

    it 'does not invoke unnecessary queries' do
      expect(Project.count).to eq 3

      # The creation of action descriptors for projects that have been selected
      # (as published, with active participatory phase) is the most expensive part of the invoked query chain(s).
      # For this reason, we limit this somewhat to the n projects within the pagination limit,
      # and we avoid getting the action descriptors again in the serializer, by passing them along.
      expect { result }.not_to exceed_query_limit(50)
    end
  end
end
