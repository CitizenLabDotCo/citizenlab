# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Queries::Analytics::Participation do
  subject(:query) { described_class.new(build(:user)) }

  describe '#run_query' do
    before_all do
      @created_at = Time.utc(2022, 9, 1)
      @date = @created_at.to_date
      create(:dimension_date, date: @date)

      Analytics::PopulateDimensionsService.populate_types

      idea = create(:idea, created_at: @created_at)
      create(:comment, created_at: @created_at, idea: idea)
      create(:basket, created_at: @created_at)
    end

    it 'returns correct time series' do
      params = { start_at: @date - 1.day, end_at: @date + 1.day }
      expect(query.run_query(**params)).to eq(
        [
          [{
            'count' => 1,
            'dimension_date_created.month' => '2022-09',
            'first_dimension_date_created_date' => @date
          }],
          [{
            'count' => 1,
            'dimension_date_created.month' => '2022-09',
            'first_dimension_date_created_date' => @date
          }],
          [{
            'count' => 1,
            'dimension_date_created.month' => '2022-09',
            'first_dimension_date_created_date' => @date
          }]
        ]
      )
    end

    it 'returns correct compared period' do
      params = {
        start_at: @date - 1.day,
        end_at: @date + 1.day,
        compare_start_at: @date - 1.day,
        compare_end_at: @date + 1.day
      }
      expect(query.run_query(**params)).to eq(
        [
          [{
            'count' => 1,
            'dimension_date_created.month' => '2022-09',
            'first_dimension_date_created_date' => @date
          }],
          [{
            'count' => 1,
            'dimension_date_created.month' => '2022-09',
            'first_dimension_date_created_date' => @date
          }],
          [{
            'count' => 1,
            'dimension_date_created.month' => '2022-09',
            'first_dimension_date_created_date' => @date
          }],
          [{ 'count' => 1 }],
          [{ 'count' => 1 }],
          [{ 'count' => 1 }]
        ]
      )
    end
  end
end
