require 'rails_helper'

describe ProjectsFinderAdminService do
  let(:service) { described_class }

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

  describe 'recently_viewed' do
    it 'sorts by recently viewed' do
      # Project visited once, 20 days ago
      p1 = create_project(Date.today - 30.days, Date.today + 30.days)
      s1 = create(:session, monthly_user_hash: 'hash1', created_at: Date.today - 20.days)
      # TODO pageviews

      # Project visited twice, 30 days and 10 days ago
      p2 = create_project(Date.today - 30.days, Date.today + 30.days)
      s2_1 = create(:session, monthly_user_hash: 'hash2', created_at: Date.today - 30.days)
      # TODO pageviews
      s2_2 = create(:session, monthly_user_hash: 'hash3', created_at: Date.today - 10.days)
      # TODO pageviews

      # Project visited once, 5 days ago
      p3 = create_project(Date.today - 30.days, Date.today + 30.days)
      s3 = create(:session, monthly_user_hash: 'hash4', created_at: Date.today - 5.days)
      # TODO pageviews

      # Project never visited
      p4 = create_project(Date.today - 30.days, Date.today + 30.days)

      result = service.new(Project.all, {}).recently_viewed
      expect(result.pluck(:id)).to eq([p3, p2, p1, p4].pluck(:id))
    end

    # it 'filters overlapping period' do
      # TODO
    # end
  end

  describe 'phase_starting_or_ending_soon' do
    it 'sorts projects by phases starting or ending soon' do
      # Project completely in the past
      p1 = create_project(Date.new(2020, 1, 1), Date.new(2021, 1, 1))

      # Project with first phase starting in 10 days
      p2 = create_project(Date.today + 10.days, nil)

      # Project with phase ending in 15 days (2 phases)
      p3 = create(:project)
      create(
        :phase, 
        start_at: Date.today - 2.days, 
        end_at: Date.today + 15.days,
        project: p3
      )
      create(
        :phase,
        start_at: Date.today + 16.days,
        end_at: Date.today + 50.days,
        project: p3
      )

      # Project with phase ending in 5 days
      p4 = create_project(Date.today - 10.days, Date.today + 5.days)

      result = service.new(Project.all, {}).phase_starting_or_ending_soon

      expect(result.pluck(:id)).to eq([p4, p2, p3, p1].pluck(:id))
    end

    it 'filters overlapping period' do
      start_period = Date.new(2023, 1, 1)
      end_period = Date.new(2024, 1, 1)

      # Project started before period and ended before period
      p1 = create_project(Date.new(2020, 1, 1), Date.new(2021, 1, 1))

      # Project started before period but has open ended phase
      p2 = create_project(Date.new(2020, 2, 1), nil)

      # Project started before period and ends during period (2 phases)
      p3 = create(:project)
      create(
        :phase, 
        start_at: Date.new(2020, 2, 3), 
        end_at: Date.new(2020, 4, 1),
        project: p3
      )
      create(
        :phase,
        start_at: Date.new(2020, 4, 2),
        end_at: Date.new(2023, 6, 1),
        project: p3
      )


      # Project started before period and ends after period
      p4 = create_project(Date.new(2020, 4, 1), Date.new(2025, 1, 1))

      # Project started during period and ends during period
      p5 = create_project(Date.new(2023, 6, 1), Date.new(2023, 10, 1))

      # Project started during period and ends after period
      p6 = create_project(Date.new(2023, 7, 1), Date.new(2025, 1, 1))

      # Project started during period and has open ended phase
      p7 = create_project(Date.new(2023, 8, 1), nil)

      # Project started after period and ends after period
      p8 = create_project(Date.new(2025, 1, 1), Date.new(2026, 1, 1))

      result = service.new(
        Project.all, { start_at: start_period, end_at: end_period }
      ).phase_starting_or_ending_soon

      expect(result.pluck(:id).sort).to eq([p2, p3, p4, p5, p6, p7].pluck(:id).sort)
    end
  end
end