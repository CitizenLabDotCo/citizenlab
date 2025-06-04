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

    it 'excludes projects in draft folder' do
      folder = create(:project_folder, projects: [active_ideation_project])
      folder.admin_publication.update!(publication_status: 'draft')

      expect(Project.count).to eq 3
      expect(result[:projects].size).to eq 0
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
          down: { enabled: false, disabled_reason: 'reacting_dislike_disabled' }
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

    it 'includes projects with an archived status' do
      followed_project2 = create(:project, admin_publication_attributes: { publication_status: 'archived' })
      create(:follower, followable: followed_project2, user: user)

      expect(Project.count).to eq 3
      expect(result).to match_array [followed_project, followed_project2]
    end

    it 'excludes projects not followed by user' do
      expect(result).to include(followed_project)
      expect(result).not_to include(unfollowed_project)
    end

    it 'excludes projects in draft folder' do
      active_ideation_project = create(:project_with_active_ideation_phase)
      create(:follower, followable: active_ideation_project, user: user)
      folder = create(:project_folder, projects: [active_ideation_project])
      folder.admin_publication.update!(publication_status: 'draft')

      expect(Project.count).to eq 3
      expect(result).not_to include(active_ideation_project)
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

    it 'includes projects in a Folder the user follows' do
      project_in_followed_folder = create(:project)
      folder = create(:project_folder, projects: [project_in_followed_folder])
      project_in_followed_folder.admin_publication.update!(parent: folder.admin_publication)
      create(:follower, followable: folder, user: user)

      expect(service.new(Project.all, user).followed_by_user)
        .to match_array([followed_project, project_in_followed_folder])
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

    describe "when passed filter_by: 'finished'" do
      let(:result) { service.new(Project.all, user, { filter_by: 'finished' }).finished_or_archived }

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

      it 'excludes projects in draft folder' do
        folder = create(:project_folder, projects: [finished_project1])
        folder.admin_publication.update!(publication_status: 'draft')

        expect(Project.count).to eq 2
        expect(result).not_to include(finished_project1)
      end

      it 'includes unfinished projects with a last phase that contains a visible report' do
        unfinished_project2 = create(:project)
        create(:phase, project: unfinished_project2, start_at: 2.days.ago, end_at: 2.days.from_now)
        create(:report, phase: unfinished_project2.phases.last, visible: true)

        expect(Project.count).to eq 3
        expect(result).to match_array([finished_project1, unfinished_project2])
      end

      it 'excludes unfinished projects with a last phase that contains an invisible report' do
        unfinished_project2 = create(:project)
        create(:phase, project: unfinished_project2, start_at: 2.days.ago, end_at: 2.days.from_now)
        create(:report, phase: unfinished_project2.phases.last, visible: false)

        expect(Project.count).to eq 3
        expect(result).to match_array([finished_project1])
      end

      it 'excludes unfinished projects with a phase containing a visible report that is not the final phase' do
        unfinished_project2 = create(:project)
        phase1 = create(:phase, project: unfinished_project2, start_at: 3.days.ago, end_at: 2.days.ago)
        _phase2 = create(:phase, project: unfinished_project2, start_at: 1.day.ago, end_at: 1.day.from_now)
        create(:report, phase: phase1, visible: true)

        expect(Project.count).to eq 3
        expect(result).to match_array([finished_project1])
      end

      it 'inludes projects with an endless last phase & visible report in last phase' do
        endless_project = create(:project)
        create(:phase, project: endless_project, start_at: 2.days.ago, end_at: nil)
        create(:report, phase: endless_project.phases.last, visible: true)

        expect(Project.count).to eq 3
        expect(result).to match_array([endless_project, finished_project1])
      end

      it 'excludes projects with an endless last phase & NO report in last phase' do
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

      it 'lists projects ordered by last phase end_at DESC' do
        endless_project = create(:project)
        create(:phase, project: endless_project, start_at: 2.days.ago, end_at: nil)
        create(:report, phase: endless_project.phases.last, visible: true)

        finished_project2 = create(:project_with_two_past_ideation_phases)
        finished_project2.phases[1].update!(end_at: 5.days.ago)
        finished_project3 = create(:project_with_two_past_ideation_phases)
        finished_project3.phases[1].update!(end_at: 10.days.ago)

        expect(finished_project3.phases[1].end_at).to be_after(finished_project1.phases[1].end_at)
        expect(finished_project2.phases[1].end_at).to be_after(finished_project3.phases[1].end_at)

        expect(result).to eq [endless_project, finished_project2, finished_project3, finished_project1]
      end
    end

    describe "when passed filter_by: 'archived'" do
      let!(:archived_project) do
        create(:project_with_past_information_phase, admin_publication_attributes: { publication_status: 'archived' })
      end

      let!(:_draft_project) do
        create(:project, admin_publication_attributes: { publication_status: 'draft' })
      end

      let!(:_published_project) do
        create(:project, admin_publication_attributes: { publication_status: 'published' })
      end

      let(:result) { service.new(Project.all, user, { filter_by: 'archived' }).finished_or_archived }

      it 'includes archived projects' do
        expect(Project.count).to eq 5
        expect(result).to eq [archived_project]
      end

      it 'excludes projects with no phase' do
        phaseless_project = create(:project, admin_publication_attributes: { publication_status: 'archived' })

        expect(phaseless_project.phases).to be_empty
        expect(Project.count).to eq 6
        expect(result).to eq [archived_project]
      end

      it 'excludes projects in draft folder' do
        folder = create(:project_folder, projects: [archived_project])
        folder.admin_publication.update!(publication_status: 'draft')

        expect(Project.count).to eq 5
        expect(result).not_to include(archived_project)
      end

      it 'lists projects ordered by last_phase end_at DESC (Nulls first)' do
        archived_project2 = create(
          :project_with_past_information_phase,
          admin_publication_attributes: { publication_status: 'archived' }
        )
        archived_project3 = create(
          :project_with_past_information_phase,
          admin_publication_attributes: { publication_status: 'archived' }
        )
        archived_project4 = create(
          :project_with_past_ideation_and_current_information_phase,
          admin_publication_attributes: { publication_status: 'archived' }
        )

        archived_project.phases[0].update!(end_at: nil)
        archived_project2.phases[0].update!(end_at: 2.days.ago)
        archived_project3.phases[0].update!(end_at: 1.day.ago)

        expect(archived_project4.phases[1].end_at).to be_after(archived_project3.phases[0].end_at)
        expect(result).to eq [archived_project, archived_project4, archived_project3, archived_project2]
      end
    end

    describe "when passed filter_by: 'finished_and_archived'" do
      # Should include `finished_project1` and:
      let!(:unfinished_project1) { create(:project) }
      let!(:phase) { create(:phase, project: unfinished_project1, start_at: 2.days.ago, end_at: 2.days.from_now) }
      let!(:_report1) { create(:report, phase: phase, visible: true) }

      let!(:archived_project) do
        create(:project_with_past_information_phase, admin_publication_attributes: { publication_status: 'archived' })
      end

      # Should NOT include:
      let!(:_draft_project) { create(:project, admin_publication_attributes: { publication_status: 'draft' }) }
      let!(:_published_project) { create(:project, admin_publication_attributes: { publication_status: 'published' }) }

      let!(:unfinished_project2) { create(:project) }
      let!(:phase1) { create(:phase, project: unfinished_project2, start_at: 3.days.ago, end_at: 2.days.ago) }
      let!(:_phase2) { create(:phase, project: unfinished_project2, start_at: 1.day.ago, end_at: 1.day.from_now) }
      let!(:_report2) { create(:report, phase: phase1) }

      let(:result) { service.new(Project.all, user, { filter_by: 'finished_and_archived' }).finished_or_archived }

      it 'includes expected projects' do
        expect(Project.count).to eq 7
        expect(result).to match_array [finished_project1, archived_project, unfinished_project1]
      end

      it 'lists projects ordered by last phase end_at DESC (Nulls first)' do
        endless_project = create(:project)
        create(:phase, project: endless_project, start_at: 2.days.ago, end_at: nil)
        create(:report, phase: endless_project.phases.last, visible: true)

        finished_project1.phases[1].update!(end_at: 3.days.ago)
        archived_project.phases[0].update!(end_at: 5.days.ago)

        expect(unfinished_project1.phases[0].end_at).to be_after(finished_project1.phases[1].end_at)

        expect(result).to eq [endless_project, unfinished_project1, finished_project1, archived_project]
      end

      it 'excludes projects in draft folder' do
        folder = create(:project_folder, projects: [unfinished_project1, archived_project])
        folder.admin_publication.update!(publication_status: 'draft')

        expect(Project.count).to eq 7
        expect(result).not_to include(unfinished_project1)
        expect(result).not_to include(archived_project)
      end
    end
  end

  describe 'projects_for_areas' do
    let!(:area1) { create(:area) }
    let!(:area2) { create(:area) }
    let!(:project_with_areas) { create(:project_with_active_ideation_phase) }
    let!(:_areas_project1) { create(:areas_project, project: project_with_areas, area: area1) }
    let!(:_areas_project2) { create(:areas_project, project: project_with_areas, area: area2) }

    let!(:project_for_all_areas) { create(:project_with_active_ideation_phase, include_all_areas: true) }

    let!(:_project_without_area) { create(:project) }

    it 'Lists projects for a given area OR for all areas' do
      result = service.new(Project.all, user, { areas: [area1.id] }).projects_for_areas

      expect(Project.count).to eq 3
      expect(result).to match_array [project_with_areas, project_for_all_areas]
    end

    it 'Orders projects by created_at DESC' do
      project2 = create(:project)
      project3 = create(:project)
      create(:areas_project, project: project2, area: area1)
      create(:areas_project, project: project3, area: area1)

      project_with_areas.update!(created_at: 4.days.ago)
      project2.update!(created_at: 1.day.ago)
      project3.update!(created_at: 3.days.ago)
      project_for_all_areas.update!(created_at: 2.days.ago)

      result = service.new(Project.all, user, { areas: [area1.id] }).projects_for_areas

      expect(result).to eq [project2, project_for_all_areas, project3, project_with_areas]
    end

    it 'Does not return duplicate projects when more than one areas_project matches' do
      result = service.new(Project.all, user, { areas: [area1.id, area2.id] }).projects_for_areas

      expect(result).to eq [project_for_all_areas, project_with_areas]
    end

    it 'Returns projects for followed areas & for all areas when areas param is nil' do
      create(:follower, followable: area1, user: user)

      result = service.new(Project.all, user, {}).projects_for_areas

      expect(result).to match_array [project_with_areas, project_for_all_areas]
    end

    it 'Does not include draft projects, even for an admin' do
      user = create(:admin)
      project_with_areas.update!(admin_publication_attributes: { publication_status: 'draft' })

      result = service.new(Project.all, user, { areas: [area1.id] }).projects_for_areas

      expect(result).to eq [project_for_all_areas]
    end

    it 'excludes projects in draft folder' do
      folder = create(:project_folder, projects: [project_with_areas, project_for_all_areas])
      folder.admin_publication.update!(publication_status: 'draft')

      create(:follower, followable: area1, user: user)

      result = service.new(Project.all, user, { areas: [area1.id] }).projects_for_areas

      expect(Project.count).to eq 3
      expect(result).not_to include(project_with_areas)
      expect(result).not_to include(project_for_all_areas)
    end
  end

  describe 'projects_back_office' do
    it 'filters overlapping period and sorts by start_at' do
      user = create(:admin)

      start_period = Date.new(2023, 1, 1)
      end_period = Date.new(2024, 1, 1)

      def create_project(start_at, end_at)
        project = create(:project)
        create(
          :phase, 
          start_at: start_at, 
          end_at: end_at,
          project: project
        )

        project
      end

      # p1 - p8 indicates the order by start_at date.
      # Since we want to test the ordering, we start with p5 and p6,
      # otherwise the projects would already be in the right order.

      # Project started during period and ends during period
      p5 = create_project(Date.new(2023, 6, 1), Date.new(2023, 10, 1))

      # Project started during period and ends after period
      p6 = create_project(Date.new(2023, 7, 1), Date.new(2025, 1, 1))

      # Project started before period and ended before period
      p1 = create_project(Date.new(2020, 1, 1), Date.new(2021, 1, 1))

      # Project started before period but has open ended phase
      p2 = create_project(Date.new(2020, 2, 1), nil)

      # Project started before period and ends during period
      p3 = create_project(Date.new(2020, 3, 1), Date.new(2023, 6, 1))

      # Project started before period and ends after period
      p4 = create_project(Date.new(2020, 4, 1), Date.new(2025, 1, 1))

      # Project started during period and has open ended phase
      p7 = create_project(Date.new(2023, 8, 1), nil)

      # Project started after period and ends after period
      p8 = create_project(Date.new(2025, 1, 1), Date.new(2026, 1, 1))

      result = service.new(
        Project.all, user, { start_at: start_period, end_at: end_period }
      ).projects_back_office

      expect(result.pluck(:id)).to eq([p2, p3, p4, p5, p6, p7].pluck(:id))
    end
  end
end
