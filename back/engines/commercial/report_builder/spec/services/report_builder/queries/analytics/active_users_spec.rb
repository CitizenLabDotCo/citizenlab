# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Queries::Analytics::ActiveUsers do
  subject(:query) { described_class.new(build(:user)) }

  describe '#run_query' do
    let_it_be(:date) { Date.new(2022, 9, 1) }
    let_it_be(:date2) { Date.new(2022, 9, 10) }
    let_it_be(:date3) { Date.new(2022, 9, 20) }
    let_it_be(:date4) { Date.new(2022, 9, 26) }
    let_it_be(:project) { create(:single_phase_ideation_project) }
    let_it_be(:user) { create(:user) }

    # Create two idea activities by the same author
    let_it_be(:activity1) do
      create(:dimension_date, date: date)
      create(:activity, acted_at: date, user: user, project_id: project.id)
    end
    let_it_be(:activity2) do
      create(:dimension_date, date: date2)
      create(:activity, acted_at: date2, user: user, project_id: project.id)
    end

    # Create an idea activity by another author
    let_it_be(:activity3) do
      create(:dimension_date, date: date3)
      create(:activity, acted_at: date3, user: create(:user), project_id: project.id)
    end

    # Create two idea activities with no author
    let_it_be(:activity4) do
      create(:dimension_date, date: date4)
      create(:activity, acted_at: date4, user: nil, project_id: project.id)
    end
    let_it_be(:activity5) do
      create(:activity, acted_at: date4, user: nil, project_id: project.id)
    end

    it 'correctly filters by time' do
      params = { start_at: date - 1.day, end_at: date + 1.day, project_id: project.id }
      expect(query.run_query(**params)).to eq(
        [
          [{
            'count_participant_id' => 1,
            'dimension_date_created.month' => '2022-09',
            'first_dimension_date_created_date' => date
          }],
          [{
            'count_participant_id' => 1
          }]
        ]
      )
    end

    it 'dedupes participations by user id' do
      params = { start_at: date - 1.day, end_at: date + 21.days, project_id: project.id }
      expect(query.run_query(**params)).to eq(
        [
          [{
            'count_participant_id' => 2,
            'dimension_date_created.month' => '2022-09',
            'first_dimension_date_created_date' => date
          }],
          [{
            'count_participant_id' => 2
          }]
        ]
      )
    end

    it 'counts each idea with no author as a separate user' do
      params = { start_at: date - 1.day, end_at: date + 28.days, project_id: project.id }
      expect(query.run_query(**params)).to eq(
        [
          [{
            'count_participant_id' => 4,
            'dimension_date_created.month' => '2022-09',
            'first_dimension_date_created_date' => date
          }],
          [{
            'count_participant_id' => 4
          }]
        ]
      )
    end
  end
end
