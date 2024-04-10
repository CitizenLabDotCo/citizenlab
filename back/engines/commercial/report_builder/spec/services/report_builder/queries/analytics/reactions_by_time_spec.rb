# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Queries::Analytics::ReactionsByTime do
  subject(:query) { described_class.new(build(:user)) }

  describe '#run_query' do
    let_it_be(:date) { Date.new(2022, 9, 1) }
    let_it_be(:project) { create(:project) }
    let_it_be(:activity) do
      create(:dimension_date, date: date)
      create(
        :activity,
        project_id: project.id,
        acted_at: date,
        item_type: 'Reaction',
        action: 'idea_liked',
        payload: {
          reactable_type: 'Idea',
          reactable_id: SecureRandom.uuid
        }
      )
    end

    it 'returns reactions by time' do
      params = { start_at: date - 1.day, end_at: date + 1.day, project_id: project.id }
      expect(query.run_query(**params)).to eq(
        [
          [
            {
              'count_reactable_id' => 1,
              'dimension_date_created.month' => '2022-09',
              'first_dimension_date_created_date' => date
            }
          ],
          [],
          [{ 'count_reactable_id' => 1 }]
        ]
      )
    end
  end
end
