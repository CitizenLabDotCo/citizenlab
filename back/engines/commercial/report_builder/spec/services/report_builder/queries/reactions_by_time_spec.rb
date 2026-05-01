# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Queries::ReactionsByTime do
  subject(:query) { described_class.new(build(:user)) }

  describe '#run_query' do
    let(:created_at) { Time.utc(2022, 9, 1) }
    let(:date) { created_at.to_date }
    let(:idea) do
      create(:dimension_date, date: date)
      create(:idea, created_at: created_at)
    end

    before_all do
      Analytics::PopulateDimensionsService.populate_types
    end

    before do
      create(:reaction, created_at: created_at, reactable: idea)
    end

    it 'returns reactions by time' do
      params = { start_at: date - 1.day, end_at: date + 1.day, project_id: idea.project_id }
      expect(query.run_query(**params)).to eq(
        [
          [{
            'sum_dislikes_count' => 0,
            'sum_likes_count' => 1,
            'dimension_date_created.month' => '2022-09',
            'first_dimension_date_created_date' => date
          }],
          [{
            'sum_reactions_count' => 1
          }]
        ]
      )
    end
  end
end
