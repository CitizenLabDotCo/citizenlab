# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Analytics - FactPosts model' do
  explanation 'Queries to summarise posts - ideas & initiatives/proposals.'

  example 'group registrations by month' do
    # do_request({
    #              query: {
    #                fact: 'registration',
    #                groups: 'dimension_date_registration.month',
    #                aggregations: {
    #                  all: 'count'
    #                }
    #              }
    #            })
    # assert_status 200
    # expect(response_data).to match_array([
    #                                        { 'dimension_date_registration.month': '2022-09', count: 2 },
    #                                        { 'dimension_date_registration.month': '2022-10', count: 1 }
    #                                      ])
  end
end
