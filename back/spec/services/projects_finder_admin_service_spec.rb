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
      expect(result.pluck(:id)).to match_array([p1.id, p2.id, p3.id])
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

  describe 'self.filter_participation_states' do
    # Project that has not started yet
    let!(:not_started_project) do
      project = create(:project)
      create(:phase, start_at: Time.zone.today + 10.days, project: project)
      project
    end

    # Project with current data collection phase
    let!(:collecting_data_project) do
      project = create(:project)
      create(:phase, start_at: Time.zone.today - 20.days, end_at: Time.zone.today - 11.days, project: project, participation_method: 'information')
      create(:phase, start_at: Time.zone.today - 10.days, end_at: Time.zone.today + 10.days, project: project, participation_method: 'ideation')
      project
    end

    # Project with current information phase
    let!(:information_phase_project) do
      project = create(:project)
      create(:phase, start_at: Time.zone.today - 20.days, end_at: Time.zone.today - 11.days, project: project, participation_method: 'ideation')
      create(:phase, start_at: Time.zone.today - 10.days, end_at: Time.zone.today + 10.days, project: project, participation_method: 'information')
      create(:phase, start_at: Time.zone.today + 11.days, end_at: nil, project: project, participation_method: 'ideation')
      project
    end

    # Project that is completely in the past
    let!(:past_project) do
      project = create(:project)
      create(:phase, start_at: Time.zone.today - 30.days, end_at: Time.zone.today - 20.days, project: project)
      project
    end

    # Project that has a gap between phases, and right now we're in the gap
    let!(:gap_project) do
      project = create(:project)
      create(:phase, start_at: Time.zone.today - 30.days, end_at: Time.zone.today - 20.days, project: project)
      create(:phase, start_at: Time.zone.today + 10.days, end_at: Time.zone.today + 20.days, project: project)
      project
    end

    it 'returns all projects when no participation states specified' do
      result = described_class.filter_participation_states(Project.all, {})
      expect(result.pluck(:id).sort).to match_array([
        not_started_project.id,
        collecting_data_project.id,
        information_phase_project.id,
        past_project.id,
        gap_project.id
      ].sort)
    end

    it 'returns not_started projects' do
      result = described_class.filter_participation_states(Project.all, { participation_states: ['not_started'] })
      expect(result.pluck(:id)).to eq([not_started_project.id])
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

    it 'returns collecting_data and past projects' do
      result = described_class.filter_participation_states(Project.all, { participation_states: %w[collecting_data past] })
      expect(result.pluck(:id).sort).to match_array([collecting_data_project.id, past_project.id].sort)
    end

    it 'returns not_started, collecting_data, informing and past projects' do
      result = described_class.filter_participation_states(Project.all, { participation_states: %w[not_started collecting_data informing past] })
      expect(result.pluck(:id).sort).to match_array([not_started_project.id, collecting_data_project.id, information_phase_project.id, past_project.id].sort)
    end
  end

  describe 'self.execute' do
    describe 'sort: recently_viewed' do
      let!(:user) { create(:user) }
      let!(:p1) do
        project = create_project(start_at: Time.zone.today - 30.days, end_at: Time.zone.today - 5.days)
        create_session(project, Time.zone.today - 20.days)
        project
      end
      let!(:p2) do
        project = create_project(start_at: Time.zone.today - 30.days, end_at: Time.zone.today + 30.days)
        create_session(project, Time.zone.today - 30.days)
        create_session(project, Time.zone.today - 10.days)
        project
      end
      let!(:p3) do
        project = create_project(start_at: Time.zone.today - 30.days, end_at: Time.zone.today + 30.days)
        create_session(project, Time.zone.today - 5.days)
        project
      end
      let!(:p4) do
        project = create_project(start_at: Time.zone.today - 30.days, end_at: Time.zone.today + 30.days)
        s4 = create(:session, created_at: Time.zone.today - 4.days, user_id: create(:user).id)
        create(
          :pageview,
          session_id: s4.id,
          path: '/en/',
          created_at: Time.zone.today - 4.days
        )
        project
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
        start_period = Time.zone.today
        end_period = Time.zone.today + 30.days

        result = described_class.execute(
          Project.all,
          { sort: 'recently_viewed', start_at: start_period, end_at: end_period },
          current_user: user
        )

        expect(result.pluck(:id)).to eq([p3, p2, p4].pluck(:id))
      end
    end

    describe 'sort: phase_starting_or_ending_soon' do
      let!(:p1) do
        create_project(
          start_at: Date.new(2020, 1, 1),
          end_at: Date.new(2021, 1, 1),
          created_at: Date.new(2019, 1, 1)
        )
      end
      let!(:p2) do
        create_project(
          start_at: Date.new(2020, 2, 1),
          end_at: nil,
          created_at: Date.new(2019, 2, 1)
        )
      end

      let!(:p3) do
        create_project(
          start_at: Date.new(2020, 2, 3), end_at: Date.new(2023, 4, 1),
          start_at2: Date.new(2023, 4, 2), end_at2: Time.zone.today + 20.days
        )
      end

      let!(:p4) { create_project(start_at: Date.new(2020, 4, 1), end_at: Time.zone.today + 100.days) }
      let!(:p5) { create_project(start_at: Time.zone.today + 5.days, end_at: Time.zone.today + 25.days) }
      let!(:p6) { create_project(start_at: Time.zone.today + 4.days, end_at: Time.zone.today + 50.days) }
      let!(:p7) { create_project(start_at: Time.zone.today + 8.days, end_at: nil) }
      let!(:p8) { create_project(start_at: Time.zone.today + 60.days, end_at: Time.zone.today + 90.days) }

      it 'sorts projects by phases starting or ending soon' do
        result = described_class.execute(
          Project.all,
          { sort: 'phase_starting_or_ending_soon' }
        )

        expect(result.pluck(:id)).to eq([
          # p2 should come before p1, even though its creation
          # date is after, because p2 has an open-ended phase
          p6, p5, p7, p3, p8, p4, p2, p1
        ].pluck(:id))
      end

      it 'filters overlapping period' do
        start_period = Time.zone.today
        end_period = Time.zone.today + 30.days

        result = described_class.execute(
          Project.all,
          { sort: 'phase_starting_or_ending_soon', start_at: start_period, end_at: end_period }
        )

        expect(result.pluck(:id)).to eq([p6, p5, p7, p3, p4, p2].pluck(:id))
      end
    end
  end
end
