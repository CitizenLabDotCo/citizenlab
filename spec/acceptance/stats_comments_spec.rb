require 'rails_helper'
require 'rspec_api_documentation/dsl'


def time_boundary_parameters s
  s.parameter :start_at, "Date defining from where results should start", required: false
  s.parameter :end_at, "Date defining till when results should go", required: false
end

def time_series_parameters s
  time_boundary_parameters s
  s.parameter :interval, "Either day, week, month, year"
end

resource "Stats - Comments" do

  explanation "The various stats endpoints can be used to show certain properties of comments."

  before do
    @current_user = create(:admin)
    token = Knock::AuthToken.new(payload: { sub: @current_user.id }).token
    header 'Authorization', "Bearer #{token}"
    header "Content-Type", "application/json"
    @timezone = Tenant.settings('core','timezone')

    travel_to(Time.now.in_time_zone(@timezone).beginning_of_month - 1.day) do
      create(:comment)
    end
    travel_to(Time.now.in_time_zone(@timezone).beginning_of_month + 1.day) do
      create_list(:comment, 3)
    end

    travel_to(Time.now.in_time_zone(@timezone).end_of_month - 1.day) do
      create_list(:comment, 2)
    end
    travel_to(Time.now.in_time_zone(@timezone).end_of_month + 1.day) do
      create(:comment)
    end
  end

  get "web_api/v1/stats/comments_count" do
    time_boundary_parameters self

    example_request "Count all comments" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response[:count]).to eq Comment.published.count
    end
  end

  get "web_api/v1/stats/comments_by_time" do
    time_series_parameters self

    let(:start_at) { Time.now.in_time_zone(@timezone).beginning_of_month }
    let(:end_at) { Time.now.in_time_zone(@timezone).end_of_month }
    let(:interval) { 'day' }

    example_request "Comments by time" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.size).to eq start_at.end_of_month.day
      expect(json_response.values.map(&:class).uniq).to eq [Integer]
      expect(json_response.values.inject(&:+)).to eq 5
    end
  end

  get "web_api/v1/stats/comments_by_time_cumulative" do
    time_series_parameters self

    let(:start_at) { Time.now.in_time_zone(@timezone).beginning_of_month }
    let(:end_at) { Time.now.in_time_zone(@timezone).end_of_month }
    let(:interval) { 'day' }

    example_request "Comments by time (cumulative)" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.size).to eq start_at.end_of_month.day
      expect(json_response.values.map(&:class).uniq).to eq [Integer]
      expect(json_response.values.uniq).to eq json_response.values.uniq.sort
      expect(json_response.values.last).to eq 6
    end
  end
end
