# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Queries::Projects do
  subject(:query) { described_class.new(build(:user)) }

  describe '#run_query' do
    before_all do
      # 2020
      past_project = create(:project)
      create(:phase, project: past_project, start_at: Date.new(2020, 2, 1), end_at: Date.new(2020, 3, 1))

      # 2021
      @project1 = create(:project)
      create(:phase, project: @project1, start_at: Date.new(2021, 2, 1), end_at: Date.new(2021, 3, 1))

      @project2 = create(:project)
      create(:phase, project: @project2, start_at: Date.new(2021, 2, 1), end_at: Date.new(2021, 3, 1))
      create(:phase, project: @project2, start_at: Date.new(2021, 3, 2), end_at: nil)

      # 2022
      @project3 = create(:project)
      create(:phase, project: @project3, start_at: Date.new(2022, 2, 1), end_at: nil)

      # Empty project
      create(:project)

      # Make TimeBoundariesParser work as expected
      AppConfiguration.instance.update!(created_at: Date.new(2019, 12, 31))

      # Add project image
      create(:project_image, project: @project1)
    end

    it 'returns overlapping projects' do
      result = query.run_query(start_at: Date.new(2021, 1, 1), end_at: Date.new(2021, 4, 1))
      expect(result[:projects].count).to eq(2)

      expect(
        result[:projects].pluck(:id).sort
      ).to eq([@project1.id, @project2.id].sort)
    end

    it 'returns overlapping projects when last phase has no end date' do
      result = query.run_query(start_at: Date.new(2022, 1, 1), end_at: Date.new(2022, 4, 1))
      expect(result[:projects].count).to eq(2)

      expect(
        result[:projects].pluck(:id).sort
      ).to eq([@project2.id, @project3.id].sort)
    end

    it 'returns project images' do
      result = query.run_query(start_at: Date.new(2021, 1, 1), end_at: Date.new(2021, 4, 1))
      expect(result[:project_images].count).to eq(1)
    end

    it 'returns correct project periods' do
      result = query.run_query(start_at: Date.new(2021, 1, 1), end_at: Date.new(2021, 4, 1))
      expect(result[:periods].count).to eq(2)
      expect(result[:periods][@project1.id]).to eq({
        start_at: Date.new(2021, 2, 1),
        last_phase_start_at: Date.new(2021, 2, 1),
        end_at: Date.new(2021, 3, 1)
      })
      expect(result[:periods][@project2.id]).to eq({
        start_at: Date.new(2021, 2, 1),
        last_phase_start_at: Date.new(2021, 3, 2),
        end_at: nil
      })
    end
  end
end
