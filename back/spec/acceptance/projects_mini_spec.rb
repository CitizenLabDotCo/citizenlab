require 'rails_helper'
require 'rspec_api_documentation/dsl'

# A somewhat arbitrary choice to put specs related to projects actions that make use of the ProjectMiniSerializer
# in this file, mainly to reduce the n of tests in the projects_spec.rb file.

resource 'ProjectsMini' do # == Projects, but labeled as ProjectsMini, to help differentiate when/if tests fail
  explanation 'Projects can have phases which can be of different participation methods.'

  before do
    @user = create(:user, roles: [])
    header_token_for @user
  end

  let(:json_response) { json_parse(response_body) }

  get 'web_api/v1/projects/for_followed_item' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of projects per page'
    end

    let!(:followed_project) { create(:project) }
    let!(:_follower) { create(:follower, followable: followed_project, user: @user) }

    let!(:project_with_followed_idea) { create(:project) }
    let!(:idea) { create(:idea, project: project_with_followed_idea) }
    let!(:_follower2) { create(:follower, followable: idea, user: @user) }

    let!(:project_for_followed_area) { create(:project) }
    let!(:area) { create(:area) }
    let!(:_areas_project) { create(:areas_project, project: project_for_followed_area, area: area) }
    let!(:_follower3) { create(:follower, followable: area, user: @user) }

    let!(:project_for_followed_topic) { create(:project) }
    let!(:topic) { create(:global_topic) }
    let!(:_projects_topic) { create(:projects_global_topic, project: project_for_followed_topic, global_topic: topic) }
    let!(:_follower4) { create(:follower, followable: topic, user: @user) }

    let!(:_unfollowed_project) { create(:project) }

    example_request 'Includes projects for followed items, and not un-followed projects' do
      expect(status).to eq 200

      project_ids = json_response[:data].pluck(:id)

      expect(project_ids).to contain_exactly(followed_project.id, project_with_followed_idea.id, project_for_followed_area.id, project_for_followed_topic.id)
    end

    example 'Returns an empty list if the user is not signed in', document: false do
      header 'Authorization', nil

      do_request
      expect(status).to eq 200
      expect(json_response[:data]).to be_empty
    end

    example 'Includes project images', document: false do
      project_image = create(:project_image, project: followed_project)

      do_request
      expect(status).to eq(200)

      included_image_ids = json_response[:included].select { |d| d[:type] == 'image' }.pluck(:id)
      expect(included_image_ids).to include project_image.id
    end

    example_request 'Includes current phase', document: false do
      expect(status).to eq(200)

      current_phase_ids = json_response[:data].filter_map { |d| d.dig(:relationships, :current_phase, :data, :id) }
      included_phase_ids = json_response[:included].select { |d| d[:type] == 'phase' }.pluck(:id)

      expect(current_phase_ids).to match included_phase_ids
    end

    example 'Does not include unlisted projects' do
      unlisted_project = create(:project, listed: false)
      create(:follower, followable: unlisted_project, user: @user)

      do_request
      expect(status).to eq(200)

      project_ids = json_response[:data].pluck(:id)
      expect(project_ids).not_to include(unlisted_project.id)
    end

    context 'when admin' do
      before do
        @user = create(:admin)
        header_token_for @user

        followed_project.update!(admin_publication_attributes: { publication_status: 'draft' })
        create(:follower, followable: followed_project, user: @user)
      end

      example_request 'Does not include draft projects', document: false do
        expect(status).to eq 200
        expect(json_response[:data]).to eq []
      end
    end
  end

  get 'web_api/v1/projects/with_active_participatory_phase' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of projects per page'
    end

    let!(:active_ideation_project) { create(:project_with_active_ideation_phase) }
    let!(:endless_project) { create(:single_phase_ideation_project) }

    let!(:active_information_project) { create(:project_with_past_ideation_and_current_information_phase) }
    let!(:past_project) { create(:project_with_two_past_ideation_phases) }
    let!(:future_project) { create(:project_with_future_native_survey_phase) }

    example_request 'Lists only projects with an active participatory phase' do
      expect(status).to eq 200

      project_ids = json_response[:data].pluck(:id)

      expect(project_ids).to include active_ideation_project.id
      expect(project_ids).to include endless_project.id

      expect(project_ids).not_to include active_information_project.id
      expect(project_ids).not_to include past_project.id
      expect(project_ids).not_to include future_project.id
    end

    example "Excludes projects where only permitted action is attending_event & no permission is 'fixable'", document: false do
      group = create(:group)
      permission = create(:permission, action: 'posting_idea', permission_scope: active_ideation_project.phases.first, permitted_by: 'users')
      create(:groups_permission, permission_id: permission.id, group: group)
      permission = create(:permission, action: 'commenting_idea', permission_scope: active_ideation_project.phases.first, permitted_by: 'users')
      create(:groups_permission, permission_id: permission.id, group: group)
      permission = create(:permission, action: 'reacting_idea', permission_scope: active_ideation_project.phases.first, permitted_by: 'users')
      create(:groups_permission, permission_id: permission.id, group: group)

      user_requirements_service = Permissions::UserRequirementsService.new(check_groups_and_verification: false)
      action_descriptors = Permissions::ProjectPermissionsService.new(
        active_ideation_project, @user, user_requirements_service: user_requirements_service
      ).action_descriptors

      expect(action_descriptors.except(:attending_event).all? { |_k, v| v[:enabled] == false }).to be true

      do_request
      expect(status).to eq(200)

      expect(json_response[:data].pluck(:id)).not_to include active_ideation_project.id
    end

    example "Includes projects where no action permitted (excluding attending_event), but a permission is 'fixable'", document: false do
      create(:custom_field, required: true)

      user_requirements_service = Permissions::UserRequirementsService.new(check_groups_and_verification: false)
      action_descriptors = Permissions::ProjectPermissionsService.new(
        active_ideation_project, @user, user_requirements_service: user_requirements_service
      ).action_descriptors

      expect(action_descriptors.except(:attending_event).all? { |_k, v| v[:enabled] == false }).to be true
      expect(action_descriptors.except(:attending_event).count { |_k, v| v[:disabled_reason] == 'user_missing_requirements' }).to eq 4

      do_request
      expect(status).to eq(200)

      expect(json_response[:data].pluck(:id)).to include active_ideation_project.id
    end

    example 'Includes project images', document: false do
      project_image = create(:project_image, project: active_ideation_project)

      do_request
      expect(status).to eq(200)

      included_image_ids = json_response[:included].select { |d| d[:type] == 'image' }.pluck(:id)

      expect(included_image_ids).to include project_image.id
    end

    example_request 'Includes current phase', document: false do
      expect(status).to eq(200)

      current_phase_ids = json_response[:data].filter_map { |d| d.dig(:relationships, :current_phase, :data, :id) }
      included_phase_ids = json_response[:included].select { |d| d[:type] == 'phase_mini' }.pluck(:id)

      expect(current_phase_ids).to match included_phase_ids
    end

    example 'Includes next page link in response when appropriate', document: false do
      Project.destroy_all

      create_list(:project_with_active_ideation_phase, 5)

      do_request page: { number: 1, size: 2 }
      expect(json_response[:links][:next])
        .to eq 'http://example.org/web_api/v1/projects/with_active_participatory_phase?page%5Bnumber%5D=2&page%5Bsize%5D=2'

      do_request page: { number: 2, size: 2 }
      json_response = json_parse(response_body)
      expect(json_response[:links][:next])
        .to eq 'http://example.org/web_api/v1/projects/with_active_participatory_phase?page%5Bnumber%5D=3&page%5Bsize%5D=2'

      do_request page: { number: 3, size: 2 }
      json_response = json_parse(response_body)
      expect(json_response[:links][:next]).to be_nil
    end

    # Test to catch duplicates that can occur when active phase end dates match, and no secondary sorting is applied,
    # or when project created_at dates also match, and no ternary sorting is applied.
    # This would cuase duplicates to appear on different pages.
    example 'Does not duplicate projects on different pages when phase end dates are the same', document: false do
      Project.destroy_all

      create_list(:project_with_active_ideation_phase, 10)

      created_at = 1.day.ago
      Project.all.each { |p| p.update!(created_at: created_at) }

      do_request page: { number: 1, size: 4 }
      project_ids_page1 = json_response[:data].pluck(:id)

      do_request page: { number: 2, size: 4 }
      json_response = json_parse(response_body)
      project_ids_page2 = json_response[:data].pluck(:id)

      expect(project_ids_page1 & project_ids_page2).to be_empty
    end
  end

  get 'web_api/v1/projects/finished_or_archived' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of projects per page'
      parameter :filter_by, 'Whether to filter by finished or archived projects, or both'
    end

    context "when passed filter_by: 'finished'" do
      let!(:finished_project1) { create(:project_with_two_past_ideation_phases) }
      let!(:_unfinished_project1) { create(:project_with_active_ideation_phase) }
      let!(:unfinished_project2) { create(:project) }
      let!(:phase) { create(:phase, project: unfinished_project2, start_at: 2.days.ago, end_at: 2.days.from_now) }
      let!(:_report) { create(:report, phase: phase, visible: true) }

      example 'Lists only projects with all phases finished or with a report in the last phase' do
        do_request filter_by: 'finished'
        expect(status).to eq 200

        project_ids = json_response[:data].pluck(:id)

        expect(project_ids).to contain_exactly(finished_project1.id, unfinished_project2.id)
      end

      example 'Excludes projects that are not published' do
        create(:project_with_two_past_ideation_phases, admin_publication_attributes: { publication_status: 'draft' })
        create(:project_with_two_past_ideation_phases, admin_publication_attributes: { publication_status: 'archived' })

        do_request filter_by: 'finished'
        expect(status).to eq 200

        project_ids = json_response[:data].pluck(:id)

        expect(project_ids).to contain_exactly(finished_project1.id, unfinished_project2.id)
      end

      example 'Does not include unlisted projects' do
        create(:project_with_two_past_ideation_phases, listed: false)
        do_request filter_by: 'finished'
        expect(status).to eq 200
        project_ids = json_response[:data].pluck(:id)
        expect(project_ids).to contain_exactly(finished_project1.id, unfinished_project2.id)
      end
    end

    context "when passed filter_by: 'archived'" do
      let!(:archived_project) do
        create(:project_with_past_information_phase, admin_publication_attributes: { publication_status: 'archived' })
      end

      let!(:published_project) do
        create(:project_with_past_information_phase, admin_publication_attributes: { publication_status: 'published' })
      end

      let!(:draft_project) do
        create(:project_with_past_information_phase, admin_publication_attributes: { publication_status: 'draft' })
      end

      example 'Lists only archived projects' do
        do_request filter_by: 'archived'
        expect(status).to eq 200

        project_ids = json_response[:data].pluck(:id)

        expect(project_ids).to eq [archived_project.id]
      end
    end

    context "when passed filter_by: 'finished_and_archived'" do
      let!(:archived_project) do
        create(:project_with_active_ideation_phase, admin_publication_attributes: { publication_status: 'archived' })
      end

      let!(:published_project) do
        create(:project_with_active_ideation_phase, admin_publication_attributes: { publication_status: 'published' })
      end

      let!(:draft_project) do
        create(:project_with_active_ideation_phase, admin_publication_attributes: { publication_status: 'draft' })
      end

      let!(:finished_project1) { create(:project_with_two_past_ideation_phases) }
      let!(:_unfinished_project1) { create(:project_with_active_ideation_phase) } # we do not expect this one
      let!(:unfinished_project2) { create(:project) }
      let!(:phase) { create(:phase, project: unfinished_project2, start_at: 2.days.ago, end_at: 2.days.from_now) }
      let!(:_report) { create(:report, phase: phase, visible: true) }

      example 'Lists (published projects with phases finished OR with a report in last phase) OR archived projects' do
        do_request({ filter_by: 'finished_and_archived' })
        expect(status).to eq 200

        project_ids = json_response[:data].pluck(:id)
        expect(project_ids).to contain_exactly(archived_project.id, finished_project1.id, unfinished_project2.id)
      end

      example 'Includes correct ended_days_ago attribute value', document: false do
        finished_project1.phases[0].update!(start_at: 342.days.ago, end_at: 339.days.ago)
        finished_project1.phases[1].update!(start_at: 338.days.ago, end_at: 335.days.ago)

        do_request({ filter_by: 'finished_and_archived' })
        expect(status).to eq 200

        project = json_response[:data].find { |d| d[:id] == finished_project1.id }
        expect(project[:attributes][:ended_days_ago]).to eq 335
      end

      # Test to catch duplicates that can occur when created_at dates match, and no secondary sorting is applied.
      # Identical created_at dates are possible when tenant templates are applied.
      example 'Does not duplicate projects on different pages when created_at dates are the same', document: false do
        create_list(:project_with_two_past_ideation_phases, 10)

        do_request({ page: { number: 1, size: 4 }, filter_by: 'finished' })
        project_ids_page1 = json_response[:data].pluck(:id)

        do_request({ page: { number: 2, size: 4 }, filter_by: 'finished' })
        json_response = json_parse(response_body)
        project_ids_page2 = json_response[:data].pluck(:id)

        expect(project_ids_page1 & project_ids_page2).to be_empty
      end
    end
  end

  get 'web_api/v1/projects/for_areas' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of projects per page'
      parameter :areas, 'Array of area IDs', required: false
    end

    let!(:area1) { create(:area) }
    let!(:area2) { create(:area) }
    let!(:project_with_areas) { create(:project_with_active_ideation_phase) }
    let!(:_areas_project1) { create(:areas_project, project: project_with_areas, area: area1) }
    let!(:_areas_project2) { create(:areas_project, project: project_with_areas, area: area2) }

    let!(:project_for_all_areas) { create(:project_with_active_ideation_phase, include_all_areas: true) }

    let!(:_project_without_area) { create(:project) }

    example 'Lists projects for a given area OR for all areas' do
      do_request areas: [area1.id]
      expect(status).to eq 200

      expect(Project.count).to eq 3

      project_ids = json_response[:data].pluck(:id)
      expect(project_ids).to contain_exactly(project_with_areas.id, project_for_all_areas.id)
    end

    example_request 'Returns projects for followed areas & for all areas when areas param is blank', document: false do
      create(:follower, followable: area1, user: @user)

      do_request
      expect(status).to eq 200

      expect(json_response[:data].pluck(:id)).to contain_exactly(project_for_all_areas.id, project_with_areas.id)
    end
  end

  get 'web_api/v1/projects/for_topics' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of projects per page'
      parameter :topics, 'Array of topic IDs', required: false
    end

    let!(:topic1) { create(:global_topic) }
    let!(:topic2) { create(:global_topic) }
    let!(:project_with_topics) { create(:project) }
    let!(:_projects_topic1) { create(:projects_global_topic, project: project_with_topics, global_topic: topic1) }
    let!(:_projects_topic2) { create(:projects_global_topic, project: project_with_topics, global_topic: topic2) }

    let!(:_project_without_topic) { create(:project) }

    example_request 'Lists projects for a given topic' do
      do_request topics: [topic1.id]
      expect(status).to eq 200

      expect(Project.count).to eq 2

      project_ids = json_response[:data].pluck(:id)
      expect(project_ids).to contain_exactly(project_with_topics.id)
    end

    example 'Orders projects by created_at DESC', document: false do
      project2 = create(:project)
      project3 = create(:project)
      project4 = create(:project)
      create(:projects_global_topic, project: project2, global_topic: topic1)
      create(:projects_global_topic, project: project3, global_topic: topic1)
      create(:projects_global_topic, project: project4, global_topic: topic1)

      project_with_topics.update!(created_at: 4.days.ago)
      project2.update!(created_at: 1.day.ago)
      project3.update!(created_at: 3.days.ago)
      project4.update!(created_at: 2.days.ago)

      do_request topics: [topic1.id]
      expect(status).to eq 200

      project_ids = json_response[:data].pluck(:id)
      expect(project_ids).to eq [project2.id, project4.id, project3.id, project_with_topics.id]
    end

    example_request 'Does not return duplicate projects when more than one projects_topic matches', document: false do
      do_request topics: [topic1.id, topic2.id]
      expect(status).to eq 200

      project_ids = json_response[:data].pluck(:id)
      expect(project_ids).to contain_exactly(project_with_topics.id)
    end

    example_request 'Returns an empty list when topics parameter is nil', document: false do
      do_request
      expect(status).to eq 200
      expect(json_response[:data]).to eq []
    end

    context 'when admin' do
      before do
        @user = create(:admin)
        header_token_for @user
      end

      example_request 'Does not include draft projects', document: false do
        project_with_topics.update!(admin_publication_attributes: { publication_status: 'draft' })

        do_request topics: [topic1.id]
        expect(status).to eq 200
        expect(json_response[:data]).to eq []
      end
    end
  end
end
