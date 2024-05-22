# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Queries::Analytics::Participation do
  subject(:query) { described_class.new(build(:user)) }

  describe '#run_query' do
    before_all do
      @date = Date.new(2022, 9, 1)
      create(:dimension_date, date: @date)

      create(:dimension_type, name: 'idea', parent: 'post')
      create(:dimension_type, name: 'comment', parent: 'idea')
      create(:dimension_type, name: 'basket')

      idea = create(:idea, created_at: @date)
      create(:comment, created_at: @date, post: idea)
      create(:basket, created_at: @date)
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
  end
end
