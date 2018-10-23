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

resource "Stats - Votes" do

  explanation "The various stats endpoints can be used to show how certain properties of votes."

  before do
    @current_user = create(:admin)
    token = Knock::AuthToken.new(payload: { sub: @current_user.id }).token
    header 'Authorization', "Bearer #{token}"
    header "Content-Type", "application/json"
    @timezone = Tenant.settings('core','timezone')

    TenantTemplateService.new.apply_template('base')
    CustomField.find_by(code: 'education').update(enabled: true)
    create_list(:vote, 6)
    create_list(:vote, 2, mode: 'down')
  end

  get "web_api/v1/stats/votes_count" do
    time_boundary_parameters self
    parameter :resource, "Either Idea or Comment. If not provided, all votes are taken.", required: false

    example "Count all votes" do
      create(:vote, votable: create(:comment))
      do_request resource: 'Idea'
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:up)).to eq 6
      expect(json_response.dig(:down)).to eq 2
      expect(json_response.dig(:count)).to eq Vote.count-1
    end
  end

  get "web_api/v1/stats/votes_by_birthyear" do
    before do
      @ideas = create_list(:idea, 5)
      @someone = create(:user, birthyear: 1984)
      create(:vote, mode: 'up', user: @someone, votable: @ideas.first)
      create(:vote, mode: 'down', user: @someone, votable: @ideas.last)
      [['up',1984],['up',1992],['down',1992],['up',nil]].each do |mode, birthyear|
        create(:vote, mode: mode, votable: @ideas.shuffle.first,
          user: (if birthyear then create(:user, birthyear: birthyear) else create(:user) end))
      end
    end
    time_boundary_parameters self
    parameter :ideas, "Array of idea ids to get the stats for.", required: false

    let(:start_at) { Time.now.in_time_zone(@timezone).beginning_of_year }
    let(:end_at) { Time.now.in_time_zone(@timezone).end_of_year }
    let(:ideas) { @ideas.map(&:id) }

    example_request "Votes by birthyear" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response).to match({
        up: {:"1984" => 2, :"1992" => 1, :"_blank" => 1}, 
        down: {:"1984" => 1, :"1992" => 1}, 
        total: {:"1984" => 3, :"1992" => 2, :"_blank" => 1}
      })
    end
  end

  get "web_api/v1/stats/votes_by_domicile" do
    before do
     @eversem = create(:area, title_multiloc: {'en' => 'Eversem'}).id
     @wolvertem = create(:area, title_multiloc: {'en' => 'Wolvertem'}).id
      @ideas = create_list(:idea, 5)
      @someone = create(:user, domicile: @eversem)
      create(:vote, mode: 'up', user: @someone, votable: @ideas.first)
      create(:vote, mode: 'down', user: @someone, votable: @ideas.last)
      [['up',@eversem],['up',@wolvertem],['down',@wolvertem],['up',nil]].each do |mode, domicile|
        create(:vote, mode: mode, votable: @ideas.shuffle.first,
          user: (if domicile then create(:user, domicile: domicile) else create(:user) end))
      end
    end
    time_boundary_parameters self
    parameter :ideas, "Array of idea ids to get the stats for.", required: false

    let(:start_at) { Time.now.in_time_zone(@timezone).beginning_of_year }
    let(:end_at) { Time.now.in_time_zone(@timezone).end_of_year }
    let(:ideas) { @ideas.map(&:id) }

    example_request "Votes by domicile" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response).to match({
        up: {@eversem.to_sym => 2, @wolvertem.to_sym => 1, :"_blank" => 1}, 
        down: {@eversem.to_sym => 1, @wolvertem.to_sym => 1}, 
        total: {@eversem.to_sym => 3, @wolvertem.to_sym => 2, :"_blank" => 1}
      })
    end
  end

  get "web_api/v1/stats/votes_by_education" do
    before do
      @ideas = create_list(:idea, 5)
      @someone = create(:user, education: '2')
      create(:vote, mode: 'up', user: @someone, votable: @ideas.first)
      create(:vote, mode: 'down', user: @someone, votable: @ideas.last)
      [['up','2'],['up','7'],['down','7'],['up',nil]].each do |mode, education|
        create(:vote, mode: mode, votable: @ideas.shuffle.first,
          user: (if education then create(:user, education: education) else create(:user) end))
      end
    end
    time_boundary_parameters self
    parameter :ideas, "Array of idea ids to get the stats for.", required: false

    let(:start_at) { Time.now.in_time_zone(@timezone).beginning_of_year }
    let(:end_at) { Time.now.in_time_zone(@timezone).end_of_year }
    let(:ideas) { @ideas.map(&:id) }

    example_request "Votes by education" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response).to match({
        up: {:"2" => 2, :"7" => 1, :"_blank" => 1}, 
        down: {:"2" => 1, :"7" => 1}, 
        total: {:"2" => 3, :"7" => 2, :"_blank" => 1}
      })
    end
  end

  get "web_api/v1/stats/votes_by_gender" do
    before do
      @ideas = create_list(:idea, 5)
      @someone = create(:user, gender: 'female')
      create(:vote, mode: 'up', user: @someone, votable: @ideas.first)
      create(:vote, mode: 'down', user: @someone, votable: @ideas.last)
      [['up','female'],['up','male'],['down','male'],['up',nil]].each do |mode, gender|
        create(:vote, mode: mode, votable: @ideas.shuffle.first,
          user: (if gender then create(:user, gender: gender) else create(:user) end))
      end
    end
    time_boundary_parameters self
    parameter :ideas, "Array of idea ids to get the stats for.", required: false

    let(:start_at) { Time.now.in_time_zone(@timezone).beginning_of_year }
    let(:end_at) { Time.now.in_time_zone(@timezone).end_of_year }
    let(:ideas) { @ideas.map(&:id) }

    example_request "Votes by gender" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response).to match({
        up: {:"female" => 2, :"male" => 1, :"_blank" => 1}, 
        down: {:"female" => 1, :"male" => 1}, 
        total: {:"female" => 3, :"male" => 2, :"_blank" => 1}
      })
    end
  end

  get "web_api/v1/stats/votes_by_custom_field" do
    before do
      @custom_field = create(:custom_field_select, key: 'politician')
      @opt1 = create(:custom_field_option, custom_field: @custom_field, key: 'passive_politician')
      @opt2 = create(:custom_field_option, custom_field: @custom_field, key: 'retarded_politician')
      @opt3 = create(:custom_field_option, custom_field: @custom_field, key: 'no')
      @ideas = create_list(:idea, 5)
      @someone = create(:user, custom_field_values: {@custom_field.key => @opt1.key})
      create(:vote, mode: 'up', user: @someone, votable: @ideas.first)
      create(:vote, mode: 'down', user: @someone, votable: @ideas.last)
      [['up',@opt1],['up',@opt2],['down',@opt2],['down',@opt3],['up',nil]].each do |mode, opt|
        create(:vote, mode: mode, votable: @ideas.shuffle.first,
          user: (if opt then create(:user, custom_field_values: {@custom_field.key => opt.key}) else create(:user) end))
      end
    end
    time_boundary_parameters self
    parameter :ideas, "Array of idea ids to get the stats for.", required: false
    parameter :custom_field, "The custom field id which should serve as dimensions of the stats.", required: true

    let(:custom_field) { @custom_field.id }
    let(:start_at) { Time.now.in_time_zone(@timezone).beginning_of_year }
    let(:end_at) { Time.now.in_time_zone(@timezone).end_of_year }
    let(:ideas) { @ideas.map(&:id) }

    example_request "Votes by custom field" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response).to match({
        up: {@opt1.key.to_sym => 2, @opt2.key.to_sym => 1, :"_blank" => 1}, 
        down: {@opt1.key.to_sym => 1, @opt2.key.to_sym => 1, @opt3.key.to_sym => 1}, 
        total: {@opt1.key.to_sym => 3, @opt2.key.to_sym => 2, @opt3.key.to_sym => 1, :"_blank" => 1}
      })
    end
  end

  get "web_api/v1/stats/votes_by_time" do
    time_series_parameters self
    parameter :resource, "Either Idea or Comment. If not provided, all votes are taken.", required: false

    let(:start_at) { Time.now.in_time_zone(@timezone).beginning_of_week }
    let(:end_at) { Time.now.in_time_zone(@timezone).end_of_week }
    let(:interval) { 'day' }

    example_request "Votes by time" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.size).to eq 7
      expect(json_response.values.map(&:class).uniq).to eq [Integer]
      expect(json_response.values.inject(&:+)).to eq 8
    end
  end

  get "web_api/v1/stats/votes_by_time_cumulative" do
    time_series_parameters self
    parameter :resource, "Either Idea or Comment. If not provided, all votes are taken.", required: false

    let(:start_at) { Time.now.in_time_zone(@timezone).beginning_of_week }
    let(:end_at) { Time.now.in_time_zone(@timezone).end_of_week }
    let(:interval) { 'day' }

    example_request "Votes by time (cumulative)" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.size).to eq 7
      expect(json_response.values.map(&:class).uniq).to eq [Integer]
      expect(json_response.values.uniq).to eq json_response.values.uniq.sort
      expect(json_response.values.last).to eq 8
    end
  end
end
