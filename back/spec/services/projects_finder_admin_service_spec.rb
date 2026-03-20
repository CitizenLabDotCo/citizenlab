require 'rails_helper'

describe ProjectsFinderAdminService do
  def create_project(
    start_at: nil,
    end_at: nil,
    start_at2: nil,
    end_at2: nil,
    created_at: nil
  )
    project = if created_at
      create(:project, created_at: created_at)
    else
      create(:project)
    end

    create(
      :phase,
      start_at: start_at,
      end_at: end_at,
      project: project
    )

    if start_at2 && end_at2
      create(
        :phase,
        start_at: start_at2,
        end_at: end_at2,
        project: project
      )
    end

    project
  end

  describe 'self.filter_moderatable' do
    let!(:folder1) { create(:project_folder) }
    let!(:folder2) { create(:project_folder) }
    let!(:project_in_folder1) { create(:project, folder: folder1) }
    let!(:project_in_folder2) { create(:project, folder: folder2) }
    let!(:project_without_folder) { create(:project) }

    let!(:user) do
      create(:user, roles: [
        { 'type' => 'project_moderator', project_id: project_without_folder.id },
        { 'type' => 'project_folder_moderator', project_folder_id: folder1.id }
      ])
    end

    it 'returns all projects for admin user' do
      admin_user = create(:admin)
      result = described_class.filter_moderatable(Project.all, admin_user)
      expect(result.pluck(:id)).to contain_exactly(project_in_folder1.id, project_in_folder2.id, project_without_folder.id)
    end

    it 'returns projects user can moderate if not admin' do
      result = described_class.filter_moderatable(Project.all, user)
      expect(result.pluck(:id)).to contain_exactly(project_without_folder.id, project_in_folder1.id)
    end

    it 'returns empty scope if there is no user' do
      result = described_class.filter_moderatable(Project.all, nil)
      expect(result.count).to eq 0
    end
  end

  describe 'self.filter_status' do
    let!(:draft_project) do
      project = create(:project)
      admin_publication = AdminPublication.find_by(publication_id: project.id)
      admin_publication.update!(publication_status: 'draft')
      project
    end
    let!(:published_project) do
      project = create(:project)
      admin_publication = AdminPublication.find_by(publication_id: project.id)
      admin_publication.update!(publication_status: 'published')
      project
    end
    let!(:archived_project) do
      project = create(:project)
      admin_publication = AdminPublication.find_by(publication_id: project.id)
      admin_publication.update!(publication_status: 'archived')
      project
    end

    it 'filters by status' do
      result = described_class.filter_status(Project.all, { status: %w[published archived] })
      expect(result.pluck(:id).sort).to eq([published_project.id, archived_project.id].sort)
    end

    it 'returns all projects when no status specified' do
      result = described_class.filter_status(Project.all, {})
      expect(result.pluck(:id).sort).to match_array([draft_project.id, published_project.id, archived_project.id].sort)
    end
  end

  describe 'self.filter_review_state' do
    let!(:regular_project) { create(:project) }
    let!(:pending_review_draft_project) do
      project = create(:project)
      admin_publication = AdminPublication.find_by(publication_id: project.id)
      admin_publication.update!(publication_status: 'draft')
      create(:project_review, project: project)
      project
    end
    let!(:pending_review_published_project) do
      project = create(:project)
      admin_publication = AdminPublication.find_by(publication_id: project.id)
      admin_publication.update!(publication_status: 'published')
      create(:project_review, project: project)
      project
    end
    let!(:approved_project) do
      project = create(:project)
      create(:project_review, project: project, approved_at: Time.zone.now)
      project
    end

    it 'returns all projects when no review_state specified' do
      result = described_class.filter_review_state(Project.all, {})
      expect(result.pluck(:id).sort).to match_array([
        regular_project.id,
        pending_review_draft_project.id,
        pending_review_published_project.id,
        approved_project.id
      ].sort)
    end

    it 'filters by review_state = pending (only includes draft projects)' do
      result = described_class.filter_review_state(Project.all, { review_state: 'pending' })
      expect(result.pluck(:id)).to eq([pending_review_draft_project.id])
    end

    it 'filters by review_state = approved' do
      result = described_class.filter_review_state(Project.all, { review_state: 'approved' })
      expect(result.pluck(:id)).to eq([approved_project.id])
    end
  end

  describe 'self.filter_project_manager' do
    let!(:p1) { create(:project) }
    let!(:p2) { create(:project) }
    let!(:p3) { create(:project) }

    let!(:user1) { create(:user, roles: [{ 'type' => 'project_moderator', project_id: p1.id }]) }
    let!(:user2) { create(:user, roles: [{ 'type' => 'project_moderator', project_id: p2.id }]) }

    it 'returns projects managed by specified users' do
      result = described_class.filter_project_manager(Project.all, { managers: [user1.id] })
      expect(result.pluck(:id)).to eq([p1.id])
    end

    it 'returns all projects when no managers specified' do
      result = described_class.filter_project_manager(Project.all, {})
      expect(result.pluck(:id)).to contain_exactly(p1.id, p2.id, p3.id)
    end
  end

  describe 'self.search' do
    let!(:p1) { create(:project, title_multiloc: { 'en' => 'Test Project 1' }) }
    let!(:p2) { create(:project, title_multiloc: { 'en' => 'Another Project' }) }
    let!(:p3) { create(:project, title_multiloc: { 'en' => 'Test Project 2' }) }

    it 'filters projects by search term' do
      result = described_class.search(Project.all, { search: 'Test' })
      expect(result.pluck(:id)).to match_array([p1, p3].pluck(:id))
    end

    it 'returns all projects when search term is empty' do
      result = described_class.search(Project.all, {})
      expect(result.pluck(:id)).to match_array([p1, p2, p3].pluck(:id))
    end
  end

  describe '.filter_start_date' do
    let!(:p1) { create_project(start_at: 5.days.ago, end_at: 5.days.from_now) }
    let!(:p2) { create_project(start_at: 10.days.ago, end_at: 5.days.ago) }
    let!(:p3) { create_project(start_at: 5.days.from_now, end_at: 10.days.from_now) }
    let!(:p4) { create_project(start_at: 1.day.from_now) }
    let!(:p5) do
      create_project(
        start_at: 50.days.ago, end_at: 5.days.ago,
        start_at2: 4.days.ago, end_at2: 3.days.from_now
      )
    end

    it 'filters projects by start date' do
      today = Date.current

      result = described_class.filter_start_date(Project, {
        min_start_date: today - 5.days,
        max_start_date: today + 2.days
      })

      expect(result).to contain_exactly(p1, p4)
    end

    it 'returns all projects when range is empty' do
      result = described_class.filter_start_date(Project.all, { min_start_date: nil, max_start_date: nil })
      expect(result.pluck(:id).sort).to contain_exactly(p1.id, p2.id, p3.id, p4.id, p5.id)
    end
  end

  describe 'self.filter_participation_states' do
    # Project that has not started yet
    let!(:not_started_project) { create(:phase, start_at: 10.days.from_now).project }

    # Project with current data collection phase
    let!(:collecting_data_project) do
      create(:project).tap do |project|
        p1 = create(:information_phase, start_at: 20.days.ago, end_at: 10.days.ago, project:)
        create(:ideation_phase, start_at: p1.end_at, end_at: 10.days.from_now, project:)
      end
    end

    # Project with current information phase
    let!(:information_phase_project) do
      create(:project).tap do |project|
        past_phase = create(:ideation_phase, start_at: 20.days.ago, end_at: 10.days.ago, project:)
        current_phase = create(:information_phase, start_at: past_phase.end_at, end_at: 10.days.from_now, project:)
        create(:ideation_phase, start_at: current_phase.end_at, project:)
      end
    end

    # Project that is completely in the past
    let!(:past_project) { create(:phase, start_at: 30.days.ago, end_at: 20.days.ago).project }

    # Project that has a gap between phases, and right now we're in the gap
    let!(:gap_project) do
      create(:project).tap do |project|
        create(:phase, start_at: 30.days.ago, end_at: 20.days.ago, project:)
        create(:phase, start_at: 10.days.from_now, end_at: 20.days.from_now, project:)
      end
    end

    # Project without any phases
    let!(:project_without_phases) { create(:project) }

    it 'returns all projects when no participation states specified' do
      result = described_class.filter_participation_states(Project.all, {})
      expect(result.pluck(:id).sort).to match_array([
        not_started_project.id,
        collecting_data_project.id,
        information_phase_project.id,
        past_project.id,
        gap_project.id,
        project_without_phases.id
      ].sort)
    end

    it 'returns not_started projects' do
      result = described_class.filter_participation_states(Project.all, { participation_states: ['not_started'] })
      expect(result.pluck(:id).sort).to match_array([not_started_project.id, project_without_phases.id].sort)
    end

    it 'includes projects without phases when filtering for not_started projects' do
      result = described_class.filter_participation_states(Project.all, { participation_states: ['not_started'] })
      expect(result.pluck(:id)).to include(project_without_phases.id)
    end

    it 'returns collecting_data projects' do
      result = described_class.filter_participation_states(Project.all, { participation_states: ['collecting_data'] })
      expect(result.pluck(:id)).to eq([collecting_data_project.id])
    end

    it 'returns informing projects' do
      result = described_class.filter_participation_states(Project.all, { participation_states: ['informing'] })
      expect(result.pluck(:id)).to eq([information_phase_project.id])
    end

    it 'returns past projects' do
      result = described_class.filter_participation_states(Project.all, { participation_states: ['past'] })
      expect(result.pluck(:id)).to eq([past_project.id])
    end

    it 'excludes projects without phases when filtering for past projects' do
      result = described_class.filter_participation_states(Project.all, { participation_states: ['past'] })
      expect(result.pluck(:id)).not_to include(project_without_phases.id)
    end

    it 'returns collecting_data and past projects' do
      result = described_class.filter_participation_states(Project.all, { participation_states: %w[collecting_data past] })
      expect(result.pluck(:id).sort).to match_array([collecting_data_project.id, past_project.id].sort)
    end

    it 'returns not_started, collecting_data, informing and past projects' do
      result = described_class.filter_participation_states(Project.all, { participation_states: %w[not_started collecting_data informing past] })
      expect(result.pluck(:id).sort).to match_array([not_started_project.id, project_without_phases.id, collecting_data_project.id, information_phase_project.id, past_project.id].sort)
    end
  end

  describe 'self.filter_by_folder_ids' do
    let!(:folder1) { create(:project_folder) }
    let!(:folder2) { create(:project_folder) }
    let!(:project_in_folder1) { create(:project, folder: folder1) }
    let!(:project_in_folder2) { create(:project, folder: folder2) }
    let!(:project_without_folder) { create(:project) }

    it 'returns projects in the specified folder' do
      result = described_class.filter_by_folder_ids(Project.all, { folder_ids: [folder1.id] })
      expect(result.pluck(:id)).to contain_exactly(project_in_folder1.id)
    end

    it 'returns projects in any of the specified folders' do
      result = described_class.filter_by_folder_ids(Project.all, { folder_ids: [folder1.id, folder2.id] })
      expect(result.pluck(:id)).to contain_exactly(project_in_folder1.id, project_in_folder2.id)
    end

    it 'returns all projects if folder_ids is blank' do
      result = described_class.filter_by_folder_ids(Project.all, { folder_ids: [] })
      expect(result.pluck(:id)).to include(project_in_folder1.id, project_in_folder2.id, project_without_folder.id)
    end
  end

  describe 'self.filter_current_phase_participation_method' do
    let!(:project_ideation) { create(:ideation_phase, start_at: 10.days.ago, end_at: 10.days.from_now).project }
    let!(:project_voting) { create(:single_voting_phase, start_at: 10.days.ago, end_at: 10.days.from_now).project }
    let!(:project_information) { create(:information_phase, start_at: 10.days.ago, end_at: 10.days.from_now).project }
    let!(:project_ideation_future) { create(:ideation_phase, start_at: 10.days.from_now, end_at: 20.days.from_now).project }

    it 'returns all projects when no participation_methods specified' do
      result = described_class.filter_current_phase_participation_method(Project.all, {})
      expect(result.pluck(:id)).to contain_exactly(project_ideation.id, project_voting.id, project_information.id, project_ideation_future.id)
    end

    it 'filters projects by a single participation method' do
      result = described_class.filter_current_phase_participation_method(Project.all, { participation_methods: ['ideation'] })
      expect(result.pluck(:id)).to eq([project_ideation.id])
    end

    it 'filters projects by multiple participation methods' do
      result = described_class.filter_current_phase_participation_method(Project.all, { participation_methods: %w[ideation voting] })
      expect(result.pluck(:id)).to contain_exactly(project_ideation.id, project_voting.id)
    end
  end

  describe 'self.sort_alphabetically' do
    let!(:p3) { create(:project, title_multiloc: { 'en' => 'Gamma Project' }) }
    let!(:p1) { create(:project, title_multiloc: { 'en' => 'Alpha Project' }) }
    let!(:p2) { create(:project, title_multiloc: { 'en' => 'Beta Project' }) }

    it 'sorts projects alphabetically by title' do
      result = described_class.sort_alphabetically(Project.all, { locale: 'en', sort: 'alphabetically_asc' })
      expect(result.pluck(:id)).to eq([p1.id, p2.id, p3.id])
    end
  end

  describe 'self.sort_by_participation' do
    before_all do
      Analytics::PopulateDimensionsService.populate_types
    end

    let!(:p1) { create(:project, title_multiloc: { 'en' => 'Project 1' }) }
    let!(:p2) { create(:project, title_multiloc: { 'en' => 'Project 2' }) }
    let!(:p3) { create(:project, title_multiloc: { 'en' => 'Project 3' }) }
    let!(:p4) { create(:project, title_multiloc: { 'en' => 'Project 4' }) }

    before do
      create_list(:idea, 5, project: p1)
      create_list(:idea, 10, project: p2)
      create_list(:idea, 2, project: p3)
    end

    it 'sorts projects by participation count in ascending order' do
      result = described_class.sort_by_participation(Project.all, { sort: 'participation_asc' })
      expect(result.pluck(:id)).to eq([p4.id, p3.id, p1.id, p2.id])
    end

    it 'sorts projects by participation count in descending order' do
      result = described_class.sort_by_participation(Project.all, { sort: 'participation_desc' })
      expect(result.pluck(:id)).to eq([p2.id, p1.id, p3.id, p4.id])
    end

    it 'handles multiple participation types correctly' do
      idea = create(:idea, project: p3)
      create_list(:comment, 3, idea: idea)
      create_list(:reaction, 2, reactable: idea)

      result = described_class.sort_by_participation(Project.all, { sort: 'participation_desc' })
      # p3 now has: 2 ideas + 1 new idea + 3 comments + 2 reactions = 8 participations
      # p2 has 10, p3 has 8, p1 has 5, p4 has 0
      expect(result.pluck(:id)).to eq([p2.id, p3.id, p1.id, p4.id])
    end

    it 'works with pre-filtered scopes that have joins' do
      pre_filtered_scope = Project
        .joins(:admin_publication)
        .where(admin_publication: { publication_status: 'published' })

      result = described_class.execute(
        pre_filtered_scope,
        { sort: 'participation_desc' },
        current_user: create(:admin)
      )

      # Force the query to actually run
      expect { result.to_a }.not_to raise_error(ActiveRecord::StatementInvalid)
      expect(result.to_a).to be_an(Array)
    end
  end

  describe 'self.filter_visibility' do
    let!(:public_project) { create(:project, visible_to: 'public') }
    let!(:groups_project) { create(:project, visible_to: 'groups') }
    let!(:admins_project) { create(:project, visible_to: 'admins') }
    let!(:listed_project) { create(:project, visible_to: 'public', listed: true) }
    let!(:unlisted_project) { create(:project, visible_to: 'public', listed: false) }

    let(:test_projects) { Project.where(id: [public_project.id, groups_project.id, admins_project.id, listed_project.id, unlisted_project.id]) }

    it 'returns all projects when no visibility filter is applied' do
      result = described_class.filter_visibility(test_projects, {})
      expect(result.pluck(:id).sort).to match_array([
        public_project.id,
        groups_project.id,
        admins_project.id,
        listed_project.id,
        unlisted_project.id
      ].sort)
    end

    it 'filters projects by public visibility' do
      result = described_class.filter_visibility(test_projects, { visibility: ['public'] })
      # Only projects with visible_to: 'public' should be returned
      # This includes both public_project and listed_project since both have visible_to: 'public'
      # Also includes unlisted_project since it has visible_to: 'public' (even though listed: false)
      expected_ids = [public_project.id, listed_project.id, unlisted_project.id].sort
      actual_ids = result.pluck(:id).sort
      expect(actual_ids).to match_array(expected_ids)
    end

    it 'filters projects by groups visibility' do
      result = described_class.filter_visibility(test_projects, { visibility: ['groups'] })
      expect(result.pluck(:id)).to eq([groups_project.id])
    end

    it 'filters projects by admins visibility' do
      result = described_class.filter_visibility(test_projects, { visibility: ['admins'] })
      expect(result.pluck(:id)).to eq([admins_project.id])
    end

    it 'filters projects by multiple visibility types' do
      result = described_class.filter_visibility(test_projects, { visibility: %w[public groups] })
      # Projects with visible_to: 'public' OR visible_to: 'groups' should be returned
      # This includes public_project, groups_project, listed_project, and unlisted_project
      expected_ids = [public_project.id, groups_project.id, listed_project.id, unlisted_project.id].sort
      actual_ids = result.pluck(:id).sort
      expect(actual_ids).to match_array(expected_ids)
    end

    it 'filters projects by all visibility types' do
      result = described_class.filter_visibility(test_projects, { visibility: %w[public groups admins] })
      expect(result.pluck(:id).sort).to match_array([public_project.id, groups_project.id, admins_project.id, listed_project.id, unlisted_project.id].sort)
    end
  end

  describe 'self.filter_discoverability' do
    let!(:public_project) { create(:project, visible_to: 'public', listed: true) }
    let!(:hidden_project) { create(:project, visible_to: 'public', listed: false) }
    let!(:groups_project) { create(:project, visible_to: 'groups', listed: true) }
    let!(:groups_hidden_project) { create(:project, visible_to: 'groups', listed: false) }

    let(:test_projects) { Project.where(id: [public_project.id, hidden_project.id, groups_project.id, groups_hidden_project.id]) }

    it 'returns all projects when no discoverability filter is applied' do
      result = described_class.filter_discoverability(test_projects, {})
      expect(result.pluck(:id).sort).to match_array([
        public_project.id,
        hidden_project.id,
        groups_project.id,
        groups_hidden_project.id
      ].sort)
    end

    it 'filters projects by listed discoverability' do
      result = described_class.filter_discoverability(test_projects, { discoverability: ['listed'] })
      # Only projects with listed: true should be returned
      expected_ids = [public_project.id, groups_project.id].sort
      actual_ids = result.pluck(:id).sort
      expect(actual_ids).to match_array(expected_ids)
    end

    it 'filters projects by unlisted discoverability' do
      result = described_class.filter_discoverability(test_projects, { discoverability: ['unlisted'] })
      # Only projects with listed: false should be returned
      expected_ids = [hidden_project.id, groups_hidden_project.id].sort
      actual_ids = result.pluck(:id).sort
      expect(actual_ids).to match_array(expected_ids)
    end

    it 'filters projects by multiple discoverability types' do
      result = described_class.filter_discoverability(test_projects, { discoverability: %w[listed unlisted] })
      # Projects with listed: true OR listed: false should be returned
      # This includes all projects
      expected_ids = [public_project.id, hidden_project.id, groups_project.id, groups_hidden_project.id].sort
      actual_ids = result.pluck(:id).sort
      expect(actual_ids).to match_array(expected_ids)
    end

    it 'returns all projects for invalid discoverability value' do
      result = described_class.filter_discoverability(test_projects, { discoverability: ['invalid'] })
      expect(result.pluck(:id).sort).to match_array([
        public_project.id,
        hidden_project.id,
        groups_project.id,
        groups_hidden_project.id
      ].sort)
    end
  end

  describe 'self.execute' do
    describe 'sort: recently_viewed' do
      let!(:user) { create(:admin) }
      let!(:p1) do
        create_project(start_at: 40.days.ago, end_at: 5.days.ago).tap do |project|
          create_session(project, 20.days.ago)
        end
      end
      let!(:p2) do
        create_project(start_at: 30.days.ago, end_at: 30.days.from_now).tap do |project|
          create_session(project, 30.days.ago)
          create_session(project, 10.days.ago)
        end
      end
      let!(:p3) do
        create_project(start_at: 30.days.ago, end_at: 30.days.from_now).tap do |project|
          create_session(project, 5.days.ago)
        end
      end
      let!(:p4) do
        create_project(start_at: 30.days.ago, end_at: 30.days.from_now).tap do |_project|
          session = create(:session, created_at: 4.days.ago, user_id: create(:user).id)
          create(:pageview, session_id: session.id, path: '/en/', created_at: session.created_at)
        end
      end

      def create_session(project, created_at)
        session = create(:session, created_at: created_at, user_id: user.id)
        create(
          :pageview,
          session_id: session.id,
          path: "/en/admin/projects/#{project.id}/phases/741874e2-994f-4cfc-adf9-9b83e7f62ae0",
          created_at: created_at
        )
      end

      it 'sorts by recently viewed by you' do
        result = described_class.execute(
          Project.all,
          { sort: 'recently_viewed' },
          current_user: user
        )
        expect(result.pluck(:id)).to eq([p3, p2, p1, p4].pluck(:id))
      end

      it 'filters overlapping period' do
        min_start_date = 35.days.ago

        result = described_class.execute(
          Project.all,
          { sort: 'recently_viewed', min_start_date: min_start_date, max_start_date: nil },
          current_user: user
        )

        expect(result.pluck(:id)).to eq([p3, p2, p4].pluck(:id))
      end
    end

    describe 'sort: phase_starting_or_ending_soon' do
      let!(:p1) { create_project(start_at: '2020-01-01', end_at: '2021-01-01', created_at: '2019-01-01') }
      let!(:p2) { create_project(start_at: '2020-02-01', end_at: nil, created_at: '2019-02-01') }
      let!(:p3) do
        create_project(
          start_at: '2020-02-03', end_at: '2023-04-01',
          start_at2: '2023-04-01', end_at2: 21.days.from_now
        )
      end
      let!(:p4) { create_project(start_at: '2020-04-01', end_at: 100.days.from_now) }
      let!(:p5) { create_project(start_at: 5.days.from_now, end_at: 25.days.from_now) }
      let!(:p6) { create_project(start_at: 4.days.from_now, end_at: 50.days.from_now) }
      let!(:p7) { create_project(start_at: 8.days.from_now, end_at: nil) }
      let!(:p8) { create_project(start_at: 60.days.from_now, end_at: 90.days.from_now) }

      it 'sorts projects by phases starting or ending soon' do
        result = described_class.execute(
          Project.all,
          { sort: 'phase_starting_or_ending_soon' },
          current_user: create(:admin)
        )

        expect(result.pluck(:id)).to eq([
          # p2 should come before p1, even though its creation
          # date is after, because p2 has an open-ended phase
          p6, p5, p7, p3, p8, p4, p2, p1
        ].pluck(:id))
      end

      it 'filters overlapping period' do
        min_start_date = Date.current

        result = described_class.execute(
          Project.all,
          { sort: 'phase_starting_or_ending_soon', min_start_date: min_start_date, end_at: nil },
          current_user: create(:admin)
        )

        expect(result.pluck(:id)).to eq([p6, p5, p7, p8].pluck(:id))
      end
    end

    describe 'with excluded_project_ids' do
      let!(:project1) { create(:project) }
      let!(:project2) { create(:project) }
      let!(:project3) { create(:project) }
      let(:admin_user) { create(:admin) }

      it 'excludes projects by their project IDs' do
        result = described_class.execute(
          Project.all,
          { excluded_project_ids: [project1.id] },
          current_user: admin_user
        )

        expect(result.pluck(:id)).to contain_exactly(project2.id, project3.id)
      end

      it 'returns all projects when excluded_project_ids is empty' do
        result = described_class.execute(
          Project.all,
          { excluded_project_ids: [] },
          current_user: admin_user
        )

        expect(result.pluck(:id)).to contain_exactly(project1.id, project2.id, project3.id)
      end
    end

    describe 'with excluded_folder_ids' do
      let!(:folder) { create(:project_folder) }
      let!(:project_in_folder) { create(:project, folder: folder) }
      let!(:project_outside_folder) { create(:project) }
      let(:admin_user) { create(:admin) }

      it 'excludes projects within excluded folders' do
        result = described_class.execute(
          Project.all,
          { excluded_folder_ids: [folder.id] },
          current_user: admin_user
        )

        expect(result.pluck(:id)).to contain_exactly(project_outside_folder.id)
      end

      it 'returns all projects when excluded_folder_ids is empty' do
        result = described_class.execute(
          Project.all,
          { excluded_folder_ids: [] },
          current_user: admin_user
        )

        expect(result.pluck(:id)).to contain_exactly(project_in_folder.id, project_outside_folder.id)
      end
    end
  end

  describe '.filter_with_admin_publication' do
    let!(:project_with_admin_pub) { create(:project) }
    let!(:project_without_admin_pub) do
      project = create(:project)
      project.admin_publication.destroy!
      project.reload
      project
    end

    it 'filters out projects without admin_publication' do
      all_projects = Project.all
      filtered_projects = described_class.filter_with_admin_publication(all_projects)

      expect(filtered_projects).to include(project_with_admin_pub)
      expect(filtered_projects).not_to include(project_without_admin_pub)
    end
  end
end
