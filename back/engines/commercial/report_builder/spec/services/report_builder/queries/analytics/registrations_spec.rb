# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Queries::Analytics::Registrations do
  subject(:query) { described_class.new(build(:user)) }

  describe '#run_query' do
    september = Date.new(2022, 9, 10)
    let!(:dimension_date_september) { create(:dimension_date, date: september) }

    it 'returns correct data' do
      create(:user, invite_status: nil, registration_completed_at: september)
      create(:user, invite_status: nil, registration_completed_at: september)

      params = {
        start_at: (september - 10.days).to_s,
        end_at: (september + 10.days).to_s
      }

      expect(query.run_query(**params)).to eq(
        [
          [{
            'count' => 2,
            'dimension_date_registration.month' => '2022-09',
            'first_dimension_date_registration_date' => september
          }],
          [{
            'count' => 2
          }],
          [{
            'count_visitor_id' => 0
          }],
          [{
            'count' => 0
          }]
        ]
      )
    end

    it 'returns visitors and a separate count for registrations filtered by has_visits' do
      u1, _, __, ___ = create_list(:user, 4, invite_status: nil, registration_completed_at: september)

      create(:fact_visit, dimension_date_first_action: dimension_date_september, dimension_user_id: u1.id)
      create(:fact_visit, dimension_date_first_action: dimension_date_september)

      params = {
        start_at: (september - 10.days).to_s,
        end_at: (september + 10.days).to_s
      }

      expect(query.run_query(**params)).to eq(
        [
          [{
            'count' => 4,
            'dimension_date_registration.month' => '2022-09',
            'first_dimension_date_registration_date' => september
          }],
          [{
            'count' => 4
          }],
          [{
            'count_visitor_id' => 2
          }],
          [{
            'count' => 1
          }]
        ]
      )
    end

    it 'returns visitors and a separate count for registrations filtered by has_visits in compared period' do
      october = Date.new(2022, 10, 10)
      dimension_date_october = create(:dimension_date, date: october)

      # OCTOBER
      u1, = create_list(:user, 4, invite_status: nil, registration_completed_at: october)

      create(:fact_visit, dimension_date_first_action: dimension_date_october, dimension_user_id: u1.id)
      create(:fact_visit, dimension_date_first_action: dimension_date_october)

      # SEPTEMBER
      u2, u3, = create_list(:user, 5, invite_status: nil, registration_completed_at: september)
      create(:fact_visit, dimension_date_first_action: dimension_date_september, dimension_user_id: u2.id)
      create(:fact_visit, dimension_date_first_action: dimension_date_september, dimension_user_id: u3.id)
      create(:fact_visit, dimension_date_first_action: dimension_date_september)
      create(:fact_visit, dimension_date_first_action: dimension_date_september)

      params = {
        start_at: (october - 10.days).to_s,
        end_at: (october + 10.days).to_s,
        compare_start_at: (september - 10.days).to_s,
        compare_end_at: (september + 10.days).to_s
      }

      expect(query.run_query(**params)).to eq(
        [
          [{
            'count' => 4,
            'dimension_date_registration.month' => '2022-10',
            'first_dimension_date_registration_date' => october
          }],
          [{
            'count' => 4
          }],
          [{
            'count_visitor_id' => 2
          }],
          [{
            'count' => 1
          }],
          [{
            'count' => 5
          }],
          [{
            'count_visitor_id' => 4
          }],
          [{
            'count' => 2
          }]
        ]
      )
    end
  end
end
