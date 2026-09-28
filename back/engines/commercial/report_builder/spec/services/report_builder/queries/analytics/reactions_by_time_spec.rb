# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Queries::Analytics::ReactionsByTime do
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

    context 'with exclude_admins_and_moderators' do
      before do
        create_admins_and_moderators.each_with_index do |user, i|
          create(:reaction, created_at: created_at, reactable: idea, user: user, mode: i.even? ? 'up' : 'down')
        end
      end

      let(:params) { { start_at: date - 1.day, end_at: date + 1.day, project_id: idea.project_id } }

      it 'includes reactions of admins and moderators by default' do
        result = query.run_query(**params)

        expect(result.first.first).to include('sum_likes_count' => 4, 'sum_dislikes_count' => 2)
        expect(result.last).to eq([{ 'sum_reactions_count' => 6 }])
      end

      it 'excludes reactions of admins and moderators' do
        result = query.run_query(**params, exclude_admins_and_moderators: true)

        expect(result.first.first).to include('sum_likes_count' => 1, 'sum_dislikes_count' => 0)
        expect(result.last).to eq([{ 'sum_reactions_count' => 1 }])
      end
    end
  end
end
