# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Analytics - FactRegistrations model' do
  explanation 'Queries to summarise registrations and invitations to register.'

  before do
    header 'Content-Type', 'application/json'
    admin_header_token
  end

  before_all do
    # Create associated date dimensions
    create(:dimension_date, date: Date.new(2022, 8, 1))
    create(:dimension_date, date: Date.new(2022, 8, 15))
    create(:dimension_date, date: Date.new(2022, 9, 1))
  end

  context 'fully complete registrations' do
    post 'web_api/v1/analytics' do
      before_all do
        # Create 3 users - 2 registered in Sept 2022 (admin & citizen) and 1 in Oct 2022 (citizen)
        create(:admin, registration_completed_at: '2022-08-01 10:15:00')
        create(:user, registration_completed_at: '2022-08-15 16:30:00')
        create(:user, registration_completed_at: '2022-09-1 16:30:00')
      end

      example 'group complete registrations by month' do
        do_request({
          query: {
            fact: 'registration',
            groups: 'dimension_date_registration.month',
            aggregations: {
              all: 'count'
            }
          }
        })
        assert_status 200
        expect(response_data[:attributes]).to contain_exactly({ 'dimension_date_registration.month': '2022-08', count: 2 }, { 'dimension_date_registration.month': '2022-09', count: 1 })
      end

      example 'filter complete registrations between dates and return citizens only' do
        do_request({
          query: {
            fact: 'registration',
            filters: {
              'dimension_date_registration.date': { from: '2022-08-01', to: '2022-08-31' },
              'dimension_user.role': 'citizen'
            },
            aggregations: {
              all: 'count'
            }
          }
        })
        assert_status 200
        expect(response_data[:attributes]).to contain_exactly({ count: 1 })
      end
    end
  end

  context 'invited users' do
    before_all do
      # Create 2 pending & 1 accepted invite
      create(:invite, created_at: '2022-08-1 12:10:00')
      create(:invite, created_at: '2022-09-1 13:22:00')
      create(:accepted_invite, created_at: '2022-09-1 13:22:00', accepted_at: '2022-09-1 17:22:00')
    end
    post 'web_api/v1/analytics' do
      example 'find pending invitations only' do
        do_request({
          query: {
            fact: 'registration',
            filters: {
              'dimension_user.invite_status': 'pending'
            },
            aggregations: {
              all: 'count'
            }
          }
        })
        assert_status 200
        expect(response_data[:attributes]).to contain_exactly({ count: 2 })
      end

      example 'group invitations by status' do
        # NOTE: Filtering by date invited as this ignores any other users created by the :invite factory
        do_request({
          query: {
            fact: 'registration',
            filters: {
              'dimension_date_invited.date': { from: '2022-08-01', to: '2022-09-30' }
            },
            groups: 'dimension_user.invite_status',
            aggregations: {
              all: 'count'
            }
          }
        })
        assert_status 200
        expect(response_data[:attributes]).to contain_exactly({ 'dimension_user.invite_status': 'pending', count: 2 }, { 'dimension_user.invite_status': 'accepted', count: 1 })
      end
    end
  end
end
