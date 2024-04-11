# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Queries::Analytics::ActiveUsers do
  subject(:query) { described_class.new(build(:user)) }

  describe '#run_query' do
    let_it_be(:date) { Date.new(2022, 9, 1) }
    let_it_be(:project) { create(:single_phase_ideation_project) }
    let_it_be(:idea) do
      create(:dimension_date, date: date)
      create(:dimension_type, name: 'idea', parent: 'post')

      create(:idea, created_at: date, project: project)
    end

    # Create ideas without author
    let_it_be(:date2) { Date.new(2022, 9, 4) }
    let_it_be(:idea2) do
      create(:dimension_date, date: date2)
      create(:idea, created_at: date2, project: project, author: nil)
      create(:idea, created_at: date2, project: project, author: nil)
    end

    it 'returns active users' do
      params = { start_at: date - 1.day, end_at: date + 1.day, project_id: idea.project_id }
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

    it 'counts ideas without author as distinct users' do
      params = { start_at: date - 1.day, end_at: date + 5.days, project_id: idea.project_id }
      expect(query.run_query(**params)).to eq(
        [
          [{
            'count_dimension_user_id' => 3,
            'dimension_date_created.month' => '2022-09',
            'first_dimension_date_created_date' => date
          }],
          [{
            'count_dimension_user_id' => 3
          }]
        ]
      )
    end
  end
end
