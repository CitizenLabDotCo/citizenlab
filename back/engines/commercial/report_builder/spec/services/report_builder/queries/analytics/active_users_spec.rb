# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Queries::Analytics::ActiveUsers do
  subject(:query) { described_class.new(build(:user)) }

  describe '#run_query' do
    let_it_be(:date) { Date.new(2022, 9, 1) }
    let_it_be(:date2) { Date.new(2022, 9, 10) }
    let_it_be(:date3) { Date.new(2022, 9, 20) }
    let_it_be(:dimension_type) { create(:dimension_type, name: 'idea', parent: 'post') }
    let_it_be(:project) { create(:single_phase_ideation_project) }
    let_it_be(:user) { create(:user) }

    let_it_be(:idea) do
      create(:dimension_date, date: date)
      create(:idea, created_at: date, author: user, project: project)
    end
    let_it_be(:idea2) do
      create(:dimension_date, date: date2)
      create(:idea, created_at: date2, author: user, project: project)
    end
    # idea3 has a different author
    let_it_be(:idea3) do
      create(:dimension_date, date: date3)
      create(:idea, created_at: date3, project: project)
    end

    it 'correctly filters by time' do
      params = { start_at: date - 1.day, end_at: date + 1.day, project_id: project.id }
      expect(query.run_query(**params)).to eq(
        [
          [{
            'count_dimension_user_id' => 1,
            'dimension_date_created.month' => '2022-09',
            'first_dimension_date_created_date' => date
          }],
          [{
            'count_dimension_user_id' => 1
          }]
        ]
      )
    end

    it 'dedupes participations by user id' do
      params = { start_at: date - 1.day, end_at: date + 25.days, project_id: project.id }
      expect(query.run_query(**params)).to eq(
        [
          [{
            'count_dimension_user_id' => 2,
            'dimension_date_created.month' => '2022-09',
            'first_dimension_date_created_date' => date
          }],
          [{
            'count_dimension_user_id' => 2
          }]
        ]
      )
    end
  end
end
