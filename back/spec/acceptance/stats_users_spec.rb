# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

def time_boundary_parameters(s)
  s.parameter :start_at, 'Date defining from where results should start', required: false
  s.parameter :end_at, 'Date defining till when results should go', required: false
end

resource 'Stats - Users' do
  explanation 'The various stats endpoints can be used to show how certain properties of users.'

  let!(:now) { Time.now.in_time_zone(@timezone) }

  before do
    admin_header_token
    header 'Content-Type', 'application/json'
    AppConfiguration.instance.update!(created_at: now - 2.years)
    @timezone = AppConfiguration.instance.settings('core', 'timezone')

    travel_to((now - 1.month).in_time_zone(@timezone).beginning_of_month - 1.day) do
      create(:user)
    end

    travel_to((now - 1.month).in_time_zone(@timezone).beginning_of_month + 10.days) do
      create(:user)
      create(:user)
      create(:admin)
      create(:user)
      create(:invited_user)
    end
    travel_to((now - 1.month).in_time_zone(@timezone).beginning_of_month + 25.days) do
      create_list(:user, 4)
    end
  end

  get 'web_api/v1/stats/users_count' do
    time_boundary_parameters self

    example_request 'Count all users' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:data].dig(:attributes, :count)).to eq User.active.count
    end
  end
end
