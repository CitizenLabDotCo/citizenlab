require 'rails_helper'

describe ProjectsFinderAdminService do
  let(:service) { described_class }

  describe 'recently_updated' do
    it 'sorts by recently updated' do
      # Project updated 1 year ago
      # TODO

      # Project updated 10 months ago
      # TODO

      # Phase updated 9 months ago
      # TODO

      # Ideation form updated 8 months ago
      # TODO

      # Survey form updated 7 months ago
      # TODO

      # Project topics
      # TODO

      # Project allowed input topics
      # TODO
    end

    it 'filters overlapping period' do
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
        Project.all, user, { start_at: start_period, end_at: end_period }
      ).recently_updated

      expect(result.pluck(:id).sort).to eq([p2, p3, p4, p5, p6, p7].pluck(:id).sort)
    end
  end
end