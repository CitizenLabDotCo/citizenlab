# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Queries::Projects do
  subject(:query) { described_class.new(build(:user)) }

  describe '#run_query' do
    before_all do
      @overlapping_project = create(:project)
      create(:phase, project: @overlapping_project, start_at: Date.new(2021, 2, 1), end_at: Date.new(2021, 3, 1))

      # Past project
      past_project = create(:project)
      create(:phase, project: past_project, start_at: Date.new(2020, 2, 1), end_at: Date.new(2020, 3, 1))

      # Future project
      future_project = create(:project)
      create(:phase, project: future_project, start_at: Date.new(2022, 2, 1), end_at: Date.new(2022, 3, 1))

      # Make TimeBoundariesParser work as expected
      AppConfiguration.instance.update!(created_at: Date.new(2019, 12, 31))
    end

    it 'returns overlapping project' do
      result = query.run_query(start_at: Date.new(2021, 1, 1), end_at: Date.new(2021, 4, 1))
      expect(result[:projects].count).to eq(1)
      expect(result[:projects].first[:id]).to eq(@overlapping_project.id)
    end
  end
end
