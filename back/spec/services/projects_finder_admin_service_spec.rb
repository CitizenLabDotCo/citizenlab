require 'rails_helper'

describe ProjectsFinderAdminService do
  let(:service) { described_class }

  def create_project(
    start_at, end_at,
    start_at_2: nil, end_at_2: nil
  )
    project = create(:project)
    create(
      :phase, 
      start_at: start_at, 
      end_at: end_at,
      project: project
    )

    if start_at_2 && end_at_2
      create(
        :phase,
        start_at: start_at_2,
        end_at: end_at_2,
        project: project
      )
    end

    project
  end

  describe 'recently_viewed' do
    def create_session(project, created_at)
      session = create(:session, created_at: created_at)
      create(
        :pageview, 
        session_id: session.id,
        path: "/en/admin/projects/#{project.id}/phases/741874e2-994f-4cfc-adf9-9b83e7f62ae0",
        created_at: created_at
      )
    end

    let!(:p1) do
      project = create_project(Date.today - 30.days, Date.today - 5.days)
      create_session(project, Date.today - 20.days)
      project
    end

    let!(:p2) do
      project = create_project(Date.today - 30.days, Date.today + 30.days)
      create_session(project, Date.today - 30.days)
      create_session(project, Date.today - 10.days)
      project
    end

    let!(:p3) do
      project = create_project(Date.today - 30.days, Date.today + 30.days)
      create_session(project, Date.today - 5.days)
      project
    end

    let!(:p4) do
      project = create_project(Date.today - 30.days, Date.today + 30.days)
      s4 = create(:session, created_at: Date.today - 4.days)
      create(
        :pageview, 
        session_id: s4.id,
        path: "/en/",
        created_at: Date.today - 4.days
      )
      project
    end

    it 'sorts by recently viewed' do
      result = service.new(Project.all, {}).recently_viewed
      expect(result.pluck(:id)).to eq([p3, p2, p1, p4].pluck(:id))
    end

    it 'filters overlapping period' do
      start_period = Date.today
      end_period = Date.today + 30.days

      result = service.new(Project.all, {
        start_at: start_period,
        end_at: end_period
      }).recently_viewed

      expect(result.pluck(:id)).to eq([p3, p2, p4].pluck(:id))
    end
  end

  describe 'phase_starting_or_ending_soon' do
    it 'sorts projects by phases starting or ending soon' do
      # Project completely in the past
      p1 = create_project(Date.new(2020, 1, 1), Date.new(2021, 1, 1))

      # Project with first phase starting in 10 days
      p2 = create_project(Date.today + 10.days, nil)

      # Project with phase ending in 15 days (2 phases)
      p3 = create_project(
        Date.today - 2.days, Date.today + 15.days, 
        start_at_2: Date.today + 16.days, end_at_2: Date.today + 50.days
      )

      # Project with phase ending in 5 days
      p4 = create_project(Date.today - 10.days, Date.today + 5.days)

      result = service.new(Project.all, {}).phase_starting_or_ending_soon

      expect(result.pluck(:id)).to eq([p4, p2, p3, p1].pluck(:id))
    end

    it 'filters overlapping period' do
      start_period = Date.today
      end_period = Date.today + 30.days

      # Project started before period and ended before period (will be excluded)
      p1 = create_project(Date.new(2020, 1, 1), Date.new(2021, 1, 1))

      # Project started before period but has open ended phase
      p2 = create_project(Date.new(2020, 2, 1), nil)

      # Project started before period and ends during period (2 phases)
      p3 = create_project(
        Date.new(2020, 2, 3), Date.new(2023, 4, 1),
        start_at_2: Date.new(2023, 4, 2), end_at_2: Date.today() + 20.days
      )

      # Project started before period and ends after period
      p4 = create_project(Date.new(2020, 4, 1), Date.today + 100.days)

      # Project starting during period and ends during period
      p5 = create_project(Date.today + 5.days, Date.today + 25.days)

      # Project starting during period and ends after period
      p6 = create_project(Date.today + 4.days, Date.today + 50.days)

      # Project starting during period and has open ended phase
      p7 = create_project(Date.today + 8.days, nil)

      # Project starting after period and ends after period (will be excluded)
      p8 = create_project(Date.today + 60.days, Date.today + 90.days)

      result = service.new(
        Project.all, { start_at: start_period, end_at: end_period }
      ).phase_starting_or_ending_soon

      expect(result.pluck(:id)).to eq([p6, p5, p7, p3, p4, p2].pluck(:id))
    end
  end
end