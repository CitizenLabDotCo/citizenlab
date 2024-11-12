require 'rails_helper'

describe ProjectsFinderService do
  let(:service) { described_class }
  let(:user) { create(:user) }

  describe 'participation_possible' do
    let(:result) { service.new(Project.all, user).participation_possible }

    let!(:active_ideation_project) { create(:project_with_active_ideation_phase) }
    let!(:_past_project) { create(:project_with_two_past_ideation_phases) }
    let!(:_future_project) { create(:project_with_future_native_survey_phase) }

    it 'excludes projects without a published status' do
      create(:project_with_active_ideation_phase, admin_publication_attributes: { publication_status: 'draft' })
      create(:project_with_active_ideation_phase, admin_publication_attributes: { publication_status: 'archived' })

      expect(Project.count).to eq 5
      expect(result[:projects].size).to eq 1
      expect(result[:projects][0].id).to eq active_ideation_project.id
    end

    it 'excludes projects without active participatory (not information) phase' do
      expect(Project.count).to eq 3
      expect(result[:projects].size).to eq 1
      expect(result[:projects][0].id).to eq active_ideation_project.id
    end

    it 'excludes projects with information phase' do
      create(:project_with_past_ideation_and_current_information_phase)

      expect(Project.count).to eq 4
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

  describe 'followed_by_user' do
    let(:result) { service.new(Project.all, user).followed_by_user }

    let!(:followed_project) { create(:project) }
    let!(:follower) { create(:follower, followable: followed_project, user: user) }

    let!(:unfollowed_project) { create(:project) }

    it 'excludes projects without a published status' do
      followed_project2 = create(:project, admin_publication_attributes: { publication_status: 'draft' })
      create(:follower, followable: followed_project2, user: user)
      followed_project3 = create(:project, admin_publication_attributes: { publication_status: 'archived' })
      create(:follower, followable: followed_project3, user: user)

      expect(Project.count).to eq 4
      expect(result).to eq [followed_project]
    end

    it 'excludes projects not followed by user' do
      expect(result).to include(followed_project)
      expect(result).not_to include(unfollowed_project)
    end

    it 'includes projects containing an Idea the user has followed' do
      project_with_followed_idea = create(:project)
      idea = create(:idea, project: project_with_followed_idea)
      create(:follower, followable: idea, user: user)

      expect(service.new(Project.all, user).followed_by_user)
        .to match_array([followed_project, project_with_followed_idea])
    end

    it 'includes projects for an Area the user follows' do
      project_for_followed_area = create(:project)
      area = create(:area)
      create(:areas_project, project: project_for_followed_area, area: area)
      create(:follower, followable: area, user: user)

      expect(service.new(Project.all, user).followed_by_user)
        .to match_array([followed_project, project_for_followed_area])
    end

    it 'includes projects for a Topic the user follows' do
      project_for_followed_topic = create(:project)
      topic = create(:topic)
      create(:projects_topic, project: project_for_followed_topic, topic: topic)
      create(:follower, followable: topic, user: user)

      expect(service.new(Project.all, user).followed_by_user)
        .to match_array([followed_project, project_for_followed_topic])
    end

    it 'orders the projects by the creation date of follows (most recent first)' do
      project2 = create(:project)
      project3 = create(:project)
      project4 = create(:project)

      follower2 = create(:follower, followable: project2, user: user)
      follower3 = create(:follower, followable: project3, user: user)
      follower4 = create(:follower, followable: project4, user: user)

      area = create(:area)
      create(:areas_project, project: project4, area: area)
      follower5 = create(:follower, followable: area, user: user)

      follower.update!(created_at: 4.days.ago)  # user follows followed_project, 4 days ago, so followed_project should be last
      follower2.update!(created_at: 3.days.ago) # user follows project2, 3 days ago, so project2 should be third
      follower3.update!(created_at: 1.day.ago)  # user follows project3, 1 day ago, so project3 should be second
      follower4.update!(created_at: 2.days.ago) # user follows project4, 2 days ago, but ...
      follower5.update!(created_at: 1.hour.ago) # user also follows area of project4, 1 hour ago, so project4 should be first

      expect(result).to eq [project4, project3, project2, followed_project]
    end

    # Regression test to catch bug that is easy to introduce by 'simplifying' the way we select distinct projects.
    it 'does not return duplicates' do
      area = create(:area)
      create(:areas_project, project: followed_project, area: area)
      area2 = create(:area)
      create(:areas_project, project: followed_project, area: area2)
      create(:follower, followable: area, user: user)

      expect(result).to eq [followed_project]
    end
  end

  describe 'finished_or_archived' do
    let!(:finished_project1) { create(:project_with_two_past_ideation_phases) }
    let!(:unfinished_project) { create(:project_with_active_ideation_phase) }

    describe "when passed only the 'finished' parameter" do
      let(:result) { service.new(Project.all, user, { finished: true }).finished_or_archived }

      it 'includes finished projects' do
        expect(Project.count).to eq 2
        expect(result).to eq [finished_project1]
      end

      it 'excludes projects without a published status' do
        _draft_finished_project = create(
          :project_with_two_past_ideation_phases,
          admin_publication_attributes: { publication_status: 'draft' }
        )
        _archived_finished_project = create(
          :project_with_two_past_ideation_phases,
          admin_publication_attributes: { publication_status: 'archived' }
        )

        expect(Project.count).to eq 4
        expect(result).to eq [finished_project1]
      end

      it 'includes unfinished projects with a last phase that contains a report' do
        unfinished_project2 = create(:project)
        create(:phase, project: unfinished_project2, start_at: 2.days.ago, end_at: 2.days.from_now)
        create(:report, phase: unfinished_project2.phases.last)

        expect(Project.count).to eq 3
        expect(result).to match_array([finished_project1, unfinished_project2])
      end

      it 'excludes unfinished projects with a phase containing a report that is not the final phase' do
        unfinished_project2 = create(:project)
        phase1 = create(:phase, project: unfinished_project2, start_at: 3.days.ago, end_at: 2.days.ago)
        _phase2 = create(:phase, project: unfinished_project2, start_at: 1.day.ago, end_at: 1.day.from_now)
        create(:report, phase: phase1)

        expect(Project.count).to eq 3
        expect(result).to match_array([finished_project1])
      end

      it 'excludes projects with an endless phase' do
        endless_project = create(:project)
        create(:phase, project: endless_project, start_at: 3.days.ago, end_at: nil)

        expect(Project.count).to eq 3
        expect(result).to match_array([finished_project1])
      end

      it 'excludes projects with no phase' do
        _phaseless_project = create(:project, phases: [])

        expect(Project.count).to eq 3
        expect(result).to match_array([finished_project1])
      end

      it 'lists projects ordered by created_at ASC' do
        finished_project2 = create(:project_with_two_past_ideation_phases)
        finished_project3 = create(:project_with_two_past_ideation_phases)
        finished_project4 = create(:project_with_two_past_ideation_phases)

        finished_project1.update!(created_at: 3.days.ago)
        finished_project2.update!(created_at: 1.day.ago)
        finished_project3.update!(created_at: 2.days.ago)
        finished_project4.update!(created_at: 5.days.ago)

        expect(result).to eq [finished_project4, finished_project1, finished_project3, finished_project2]
      end
    end

    describe "when passed only the 'archived' parameter" do
      let!(:archived_project) { create(:project, admin_publication_attributes: { publication_status: 'archived' }) }
      let!(:_draft_project) { create(:project, admin_publication_attributes: { publication_status: 'draft' }) }
      let!(:_published_project) { create(:project, admin_publication_attributes: { publication_status: 'published' }) }

      let(:result) { service.new(Project.all, user, { archived: true }).finished_or_archived }

      it 'includes archived projects' do
        expect(Project.count).to eq 5
        expect(result).to eq [archived_project]
      end

      it 'lists projects ordered by created_at ASC' do
        archived_project2 = create(:project, admin_publication_attributes: { publication_status: 'archived' })
        archived_project3 = create(:project, admin_publication_attributes: { publication_status: 'archived' })
        archived_project4 = create(:project, admin_publication_attributes: { publication_status: 'archived' })

        archived_project.update!(created_at: 3.days.ago)
        archived_project2.update!(created_at: 1.day.ago)
        archived_project3.update!(created_at: 2.days.ago)
        archived_project4.update!(created_at: 4.days.ago)

        expect(result).to eq [archived_project4, archived_project, archived_project3, archived_project2]
      end
    end

    describe "when passed 'finished' AND 'archived' parameter" do
      # Should include `finished_project1` and:
      let!(:unfinished_project1) { create(:project) }
      let!(:phase) { create(:phase, project: unfinished_project1, start_at: 2.days.ago, end_at: 2.days.from_now) }
      let!(:_report1) { create(:report, phase: phase) }

      let!(:archived_project) { create(:project, admin_publication_attributes: { publication_status: 'archived' }) }

      # Should NOT include:
      let!(:_draft_project) { create(:project, admin_publication_attributes: { publication_status: 'draft' }) }
      let!(:_published_project) { create(:project, admin_publication_attributes: { publication_status: 'published' }) }

      let!(:unfinished_project2) { create(:project) }
      let!(:phase1) { create(:phase, project: unfinished_project2, start_at: 3.days.ago, end_at: 2.days.ago) }
      let!(:_phase2) { create(:phase, project: unfinished_project2, start_at: 1.day.ago, end_at: 1.day.from_now) }
      let!(:_report2) { create(:report, phase: phase1) }

      let(:result) { service.new(Project.all, user, { finished: true, archived: true }).finished_or_archived }

      it 'includes expected projects' do
        expect(Project.count).to eq 7
        expect(result).to match_array [finished_project1, archived_project, unfinished_project1]
      end

      it 'lists projects ordered by created_at ASC' do
        finished_project1.update!(created_at: 3.days.ago)
        unfinished_project1.update!(created_at: 1.day.ago)
        archived_project.update!(created_at: 2.days.ago)

        expect(result).to eq [finished_project1, archived_project, unfinished_project1]
      end
    end
  end
end
