require 'rails_helper'

describe ProjectsFinderAdminService do
  let(:service) { described_class }

  def create_project(
    start_at, end_at,
    start_at_2: nil, end_at_2: nil,
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
      project: project,
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

    it 'paginates' do
      result1 = service.new(Project.all, { page: { size: 2, number: 1 } }).recently_viewed
      expect(result1.pluck(:id)).to eq([p3, p2].pluck(:id))

      result2 = service.new(Project.all, { page: { size: 2, number: 2 }}).recently_viewed
      expect(result2.pluck(:id)).to eq([p1, p4].pluck(:id))
    end
  end

  describe 'phase_starting_or_ending_soon' do
    let!(:p1) { create_project(Date.new(2020, 1, 1), Date.new(2021, 1, 1), created_at: Date.new(2019, 1, 1)) }
    let!(:p2) { create_project(Date.new(2020, 2, 1), nil, created_at: Date.new(2019, 2, 1)) }

    let!(:p3) do create_project(
      Date.new(2020, 2, 3), Date.new(2023, 4, 1),
      start_at_2: Date.new(2023, 4, 2), end_at_2: Date.today + 20.days
    ) end

    let!(:p4) { create_project(Date.new(2020, 4, 1), Date.today + 100.days) }
    let!(:p5) { create_project(Date.today + 5.days, Date.today + 25.days) }
    let!(:p6) { create_project(Date.today + 4.days, Date.today + 50.days) }
    let!(:p7) { create_project(Date.today + 8.days, nil) }
    let!(:p8) { create_project(Date.today + 60.days, Date.today + 90.days) }

    it 'sorts projects by phases starting or ending soon' do
      result = service.new(Project.all, {}).phase_starting_or_ending_soon

      expect(result.pluck(:id)).to eq([
        # p2 should come before p1, even though its creation
        # date is after, because p2 has an open-ended phase
        p6, p5, p7, p3, p8, p4, p2, p1
      ].pluck(:id))
    end

    it 'filters overlapping period' do
      start_period = Date.today
      end_period = Date.today + 30.days

      result = service.new(
        Project.all, { start_at: start_period, end_at: end_period }
      ).phase_starting_or_ending_soon

      expect(result.pluck(:id)).to eq([p6, p5, p7, p3, p4, p2].pluck(:id))
    end

    it 'paginates' do
      result1 = service.new(Project.all, {
        page: { size: 4, number: 1 }
      }).phase_starting_or_ending_soon

      expect(result1.pluck(:id)).to eq([
        # p2 should come before p1, even though its creation
        # date is after, because p2 has an open-ended phase
        p6, p5, p7, p3
      ].pluck(:id))

      result2 = service.new(Project.all, {
        page: { size: 4, number: 2 }
      }).phase_starting_or_ending_soon

      expect(result2.pluck(:id)).to eq([
        # p2 should come before p1, even though its creation
        # date is after, because p2 has an open-ended phase
        p8, p4, p2, p1
      ].pluck(:id))
    end
  end
end