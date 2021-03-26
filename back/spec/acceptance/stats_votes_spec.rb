require 'rails_helper'
require 'rspec_api_documentation/dsl'


def time_boundary_parameters s
  s.parameter :start_at, "Date defining from where results should start", required: false
  s.parameter :end_at, "Date defining till when results should go", required: false
end

def time_series_parameters s
  time_boundary_parameters s
  s.parameter :interval, "Either day, week, month, year", required: true
end

def project_filter_parameter s
  s.parameter :project, "Project ID. Only count votes on ideas in the given project", required: false
end

def group_filter_parameter s
  s.parameter :group, "Group ID. Only count votes by users in the given group", required: false
end

def topic_filter_parameter s
  s.parameter :topic, "Topic ID. Only count votes on ideas that have the given topic assigned", required: false
end

resource "Stats - Votes" do

  explanation "The various stats endpoints can be used to show how certain properties of votes."

  let!(:now) { Time.now.in_time_zone(@timezone) }

  before do
    @current_user = create(:admin)
    token = Knock::AuthToken.new(payload: @current_user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
    header "Content-Type", "application/json"
    Tenant.current.update!(created_at: now - 3.month)
    @timezone = AppConfiguration.instance.settings('core','timezone')
    @idea_status = create(:idea_status)
  end

  get "web_api/v1/stats/votes_count" do
    time_boundary_parameters self

    before do
      i1, i2 = create_list(:idea, 2, idea_status: @idea_status, project: create(:project), author: create(:user))
      create_list(:vote, 3, votable: i1)
      create_list(:vote, 2, mode: 'down', votable: i2)
    end

    example "Count all votes" do
      do_request
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:up)).to eq 3
      expect(json_response.dig(:down)).to eq 2
      expect(json_response.dig(:total)).to eq 5
    end
  end

  context "with dependency on custom_fields" do
    before(:all) do
      Apartment::Tenant.switch!('example_org')
      TenantTemplateService.new.resolve_and_apply_template('base', external_subfolder: false)
      CustomField.find_by(code: 'education').update(enabled: true)
    end

    after(:all) do
      Apartment::Tenant.reset
      Tenant.find_by(host: 'example.org').destroy
      create(:test_tenant)
    end

    get "web_api/v1/stats/votes_by_birthyear" do
      before do
        @ideas = create_list(:idea, 3, idea_status: @idea_status)
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

      let(:start_at) { now.in_time_zone(@timezone).beginning_of_year }
      let(:end_at) { now.in_time_zone(@timezone).end_of_year }
      let(:ideas) { @ideas.map(&:id) }

      example_request "Votes by birthyear" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response).to match({
          series: {
            up: {:"1984" => 2, :"1992" => 1, :"_blank" => 1},
            down: {:"1984" => 1, :"1992" => 1},
            total: {:"1984" => 3, :"1992" => 2, :"_blank" => 1}
          }
        })
      end
    end

    get "web_api/v1/stats/votes_by_domicile" do
      before do
       @eversem = create(:area, title_multiloc: {'en' => 'Eversem'}).id
       @wolvertem = create(:area, title_multiloc: {'en' => 'Wolvertem'}).id
        @ideas = create_list(:idea, 3, idea_status: @idea_status)
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

      let(:start_at) { now.in_time_zone(@timezone).beginning_of_year }
      let(:end_at) { now.in_time_zone(@timezone).end_of_year }
      let(:ideas) { @ideas.map(&:id) }

      example_request "Votes by domicile" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response).to match({
          series: {
            up: {@eversem.to_sym => 2, @wolvertem.to_sym => 1, :"_blank" => 1},
            down: {@eversem.to_sym => 1, @wolvertem.to_sym => 1},
            total: {@eversem.to_sym => 3, @wolvertem.to_sym => 2, :"_blank" => 1}
          }
        })
      end
    end

    get "web_api/v1/stats/votes_by_education" do
      before do
        @ideas = create_list(:idea, 3, idea_status: @idea_status)
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

      let(:start_at) { now.in_time_zone(@timezone).beginning_of_year }
      let(:end_at) { now.in_time_zone(@timezone).end_of_year }
      let(:ideas) { @ideas.map(&:id) }

      example_request "Votes by education" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response).to match({
          series: {
            up: {:"2" => 2, :"7" => 1, :"_blank" => 1},
            down: {:"2" => 1, :"7" => 1},
            total: {:"2" => 3, :"7" => 2, :"_blank" => 1}
          }
        })
      end
    end

    get "web_api/v1/stats/votes_by_gender" do
      before do
        @ideas = create_list(:idea, 3, idea_status: @idea_status)
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

      let(:start_at) { now.in_time_zone(@timezone).beginning_of_year }
      let(:end_at) { now.in_time_zone(@timezone).end_of_year }
      let(:ideas) { @ideas.map(&:id) }

      example_request "Votes by gender" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response).to match({
          series: {
            up: {:"female" => 2, :"male" => 1, :"_blank" => 1},
            down: {:"female" => 1, :"male" => 1},
            total: {:"female" => 3, :"male" => 2, :"_blank" => 1}
          }
        })
      end
    end

    get "web_api/v1/stats/votes_by_custom_field" do
      before do
        @custom_field = create(:custom_field_select, key: 'politician')
        @opt1 = create(:custom_field_option, custom_field: @custom_field, key: 'passive_politician')
        @opt2 = create(:custom_field_option, custom_field: @custom_field, key: 'retarded_politician')
        @opt3 = create(:custom_field_option, custom_field: @custom_field, key: 'no')
        @ideas = create_list(:idea, 5, idea_status: @idea_status)
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
      let(:start_at) { now.in_time_zone(@timezone).beginning_of_year }
      let(:end_at) { now.in_time_zone(@timezone).end_of_year }
      let(:ideas) { @ideas.map(&:id) }

      example_request "Votes by custom field" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response).to match({
          series: {
            up: {@opt1.key.to_sym => 2, @opt2.key.to_sym => 1, :"_blank" => 1},
            down: {@opt1.key.to_sym => 1, @opt2.key.to_sym => 1, @opt3.key.to_sym => 1},
            total: {@opt1.key.to_sym => 3, @opt2.key.to_sym => 2, @opt3.key.to_sym => 1, :"_blank" => 1}
          }
        })
      end
    end
  end

  context "by time" do

    before do
      project = create(:project)
      i1, i2 = create_list(:idea, 2, idea_status: @idea_status, project: project)
      create_list(:vote, 3, votable: i1)
      create_list(:vote, 2, mode: 'down', votable: i2)
    end

    get "web_api/v1/stats/votes_by_time" do
      time_series_parameters self
      project_filter_parameter self
      group_filter_parameter self
      topic_filter_parameter self

      let(:interval) { 'day' }

      describe "filtered by time" do
        let(:start_at) { now.in_time_zone(@timezone).beginning_of_week }
        let(:end_at) { now.in_time_zone(@timezone).end_of_week }

        example_request "Votes by time" do
          expect(response_status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response[:series].map{|mode, values| values.size}.uniq.first).to eq ((now.in_time_zone(@timezone).to_date-start_at.in_time_zone(@timezone).to_date).to_i+1)
          expect(json_response[:series][:up].values.inject(&:+)).to eq 3
          expect(json_response[:series][:down].values.inject(&:+)).to eq 2
          expect(json_response[:series][:total].values.inject(&:+)).to eq 5
        end
      end

      describe "filtered by time outside of the tenant lifecycle" do
        let(:start_at) { (now-1.year).in_time_zone(@timezone).beginning_of_week }
        let(:end_at) { (now-1.year).in_time_zone(@timezone).end_of_week }

        it "returns no results" do
          do_request
          expect(response_status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response).to match({
            series: {
              up: {},
              down: {},
              total: {}
            }
          })
        end
      end
    end

    get "web_api/v1/stats/votes_by_time_as_xlsx" do
      time_series_parameters self
      project_filter_parameter self
      group_filter_parameter self
      topic_filter_parameter self

      let(:interval) { 'day' }

      describe "filtered by time" do
        let(:start_at) { now.in_time_zone(@timezone).beginning_of_week }
        let(:end_at) { now.in_time_zone(@timezone).end_of_week }

        example_request "Votes by time" do
          expect(response_status).to eq 200
          worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
          expect(worksheet.count).to eq ((now.in_time_zone(@timezone).to_date-start_at.in_time_zone(@timezone).to_date).to_i+2)


          expect(worksheet[0].cells.map(&:value)).to match ['date', 'up', 'down', 'total']
          up_col = worksheet.map {|col| col.cells[1].value}
          header, *ups = up_col
          expect(ups.inject(&:+)).to eq 3
          down_col = worksheet.map {|col| col.cells[2].value}
          header, *downs = down_col
          expect(downs.inject(&:+)).to eq 2
          total_col = worksheet.map {|col| col.cells[3].value}
          header, *totals = total_col
          expect(totals.inject(&:+)).to eq 5
        end
      end

      describe "filtered by time outside of the tenant lifecycle" do
        let(:start_at) { (now-1.year).in_time_zone(@timezone).beginning_of_week }
        let(:end_at) { (now-1.year).in_time_zone(@timezone).end_of_week }

        it "returns no results" do
          do_request
          expect(response_status).to eq 422
        end
      end
    end

    get "web_api/v1/stats/votes_by_time_cumulative" do
      time_series_parameters self
      project_filter_parameter self
      group_filter_parameter self
      topic_filter_parameter self

      let(:start_at) { now.in_time_zone(@timezone).beginning_of_week }
      let(:end_at) { now.in_time_zone(@timezone).end_of_week }
      let(:interval) { 'day' }
      let!(:vote_before) { travel_to(now.in_time_zone(@timezone).beginning_of_week - 5.day){ create(:vote) }}

      example_request "Votes by time (cumulative)" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:up].values.last).to eq 4
        expect(json_response[:series][:down].values.last).to eq 2
        expect(json_response[:series][:total].values.last).to eq 6
      end
    end

    get "web_api/v1/stats/votes_by_time_cumulative_as_xlsx" do
      time_series_parameters self
      project_filter_parameter self
      group_filter_parameter self
      topic_filter_parameter self

      let(:start_at) { now.in_time_zone(@timezone).beginning_of_week }
      let(:end_at) { now.in_time_zone(@timezone).end_of_week }
      let(:interval) { 'day' }
      let!(:vote_before) { travel_to(now.in_time_zone(@timezone).beginning_of_week - 4.day){ create(:vote, mode: 'down') }}

      example_request "Votes by time (cumulative)" do
        expect(response_status).to eq 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet.count).to eq ((now.in_time_zone(@timezone).to_date-start_at.in_time_zone(@timezone).to_date).to_i+2)


        expect(worksheet[0].cells.map(&:value)).to match ['date', 'up', 'down', 'total']
        up_col = worksheet.map {|col| col.cells[1].value}
        header, *ups = up_col
        expect(ups.last).to eq 3
        down_col = worksheet.map {|col| col.cells[2].value}
        header, *downs = down_col
        expect(downs.last).to eq 3
        total_col = worksheet.map {|col| col.cells[3].value}
        header, *totals = total_col
        expect(totals.last).to eq 6
      end
    end
  end


  get "web_api/v1/stats/votes_by_topic" do
    time_boundary_parameters self
    project_filter_parameter self
    group_filter_parameter self

    describe "with time filtering only" do
      let(:start_at) { now.in_time_zone(@timezone).beginning_of_week }
      let(:end_at) { now.in_time_zone(@timezone).end_of_week }

      let!(:topic1) { create(:topic) }
      let!(:topic2) { create(:topic) }
      let!(:topic3) { create(:topic) }
      let!(:project1) { create(:project, topics: [topic1, topic2, topic3]) }
      let!(:idea1) { create(:idea, idea_status: @idea_status, topics: [topic1], project: project1)}
      let!(:idea2) { create(:idea, idea_status: @idea_status, topics: [topic2], project: project1)}
      let!(:idea3) { create(:idea, idea_status: @idea_status, topics: [topic1, topic2], project: project1)}
      let!(:idea4) { create(:idea, idea_status: @idea_status)}
      let!(:vote1) { create(:vote, votable: idea1) }
      let!(:vote2) { create(:vote, votable: idea1, mode: 'down') }
      let!(:vote3) { create(:vote, votable: idea2) }
      let!(:vote4) { create(:vote, votable: idea3) }

      example_request "Votes by topic" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:total].stringify_keys).to match({
          topic1.id => 3,
          topic2.id => 2
        })
        expect(json_response[:topics].keys.map(&:to_s)).to eq [topic1.id, topic2.id, topic3.id]
      end
    end

    describe "filtered by project" do
      before do
        @project = create(:project)
        idea = create(:idea_with_topics, idea_status: @idea_status, topics_count: 2, project: @project)
        create(:vote, votable: idea)
        create(:vote, votable: create(:idea_with_topics, idea_status: @idea_status))
      end

      let(:start_at) { now.in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { now.in_time_zone(@timezone).end_of_month }
      let(:project) { @project.id }

      example_request "Votes by topic filtered by project" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:total].values.inject(&:+)).to eq 2
      end
    end

    describe "filtered by group" do
      before do
        @group = create(:group)
        idea = create(:idea_with_topics, idea_status: @idea_status, topics_count: 2)
        create(:vote, votable: idea, user: create(:user, manual_groups: [@group]))
        create(:vote, votable: create(:idea_with_topics, idea_status: @idea_status))
      end

      let(:start_at) { now.in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { now.in_time_zone(@timezone).end_of_month }
      let(:group) { @group.id }

      example_request "Votes by topic filtered by group" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:total].values.inject(&:+)).to eq 2
      end
    end
  end

  get "web_api/v1/stats/votes_by_topic_as_xlsx" do
    time_boundary_parameters self
    project_filter_parameter self
    group_filter_parameter self

    describe "with time filtering only" do
      let(:start_at) { now.in_time_zone(@timezone).beginning_of_week }
      let(:end_at) { now.in_time_zone(@timezone).end_of_week }

      let!(:topic1) { create(:topic) }
      let!(:topic2) { create(:topic) }
      let!(:topic3) { create(:topic) }
      let!(:project1) { create(:project, topics: [topic1, topic2, topic3]) }
      let!(:idea1) { create(:idea, idea_status: @idea_status, topics: [topic1], project: project1)}
      let!(:idea2) { create(:idea, idea_status: @idea_status, topics: [topic2], project: project1)}
      let!(:idea3) { create(:idea, idea_status: @idea_status, topics: [topic1, topic2], project: project1)}
      let!(:idea4) { create(:idea, idea_status: @idea_status)}
      let!(:vote1) { create(:vote, votable: idea1) }
      let!(:vote2) { create(:vote, votable: idea1, mode: 'down') }
      let!(:vote3) { create(:vote, votable: idea2) }
      let!(:vote4) { create(:vote, votable: idea3) }

      example_request "Votes by topic" do
        expect(response_status).to eq 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet[0].cells.map(&:value)).to match ['topic', 'topic_id', 'votes']

        topic_ids_col = worksheet.map {|col| col.cells[1].value}
        header, *topic_ids = topic_ids_col
        expect(topic_ids).to match_array [topic1.id, topic2.id]

        amount_col = worksheet.map {|col| col.cells[2].value}
        header, *amounts = amount_col
        expect(amounts).to match_array [3, 2]
      end
    end

    describe "filtered by project" do
      before do
        @project = create(:project)
        idea = create(:idea_with_topics, idea_status: @idea_status, topics_count: 2, project: @project)
        create(:vote, votable: idea)
        create(:vote, votable: create(:idea_with_topics, idea_status: @idea_status))
      end

      let(:start_at) { now.in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { now.in_time_zone(@timezone).end_of_month }
      let(:project) { @project.id }

      example_request "Votes by topic filtered by project" do
        expect(response_status).to eq 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet[0].cells.map(&:value)).to match ['topic', 'topic_id', 'votes']

        amount_col = worksheet.map {|col| col.cells[2].value}
        header, *amounts = amount_col
        expect(amounts.inject(&:+)).to eq 2
      end
    end

    describe "filtered by group" do
      before do
        @group = create(:group)
        idea = create(:idea_with_topics, idea_status: @idea_status, topics_count: 2)
        create(:vote, votable: idea, user: create(:user, manual_groups: [@group]))
        create(:vote, votable: create(:idea_with_topics, idea_status: @idea_status))
      end

      let(:start_at) { now.in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { now.in_time_zone(@timezone).end_of_month }
      let(:group) { @group.id }

      example_request "Votes by topic filtered by group" do
        expect(response_status).to eq 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet[0].cells.map(&:value)).to match ['topic', 'topic_id', 'votes']

        amount_col = worksheet.map {|col| col.cells[2].value}
        header, *amounts = amount_col
        expect(amounts.inject(&:+)).to eq 2
      end
    end
  end

  get "web_api/v1/stats/votes_by_project" do
    time_boundary_parameters self
    topic_filter_parameter self
    group_filter_parameter self

    describe "with time filtering only" do
      let(:start_at) { now.in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { now.in_time_zone(@timezone).end_of_month }

      let!(:project1) { create(:project) }
      let!(:project2) { create(:project) }
      let!(:idea1) { create(:idea, idea_status: @idea_status, project: project1) }
      let!(:idea2) { create(:idea, idea_status: @idea_status, project: project1) }
      let!(:idea3) { create(:idea, idea_status: @idea_status, project: project2) }
      let!(:idea4) { create(:idea, idea_status: @idea_status) }
      let!(:vote1) { create(:vote, votable: idea1) }
      let!(:vote2) { create(:vote, votable: idea1, mode: 'down') }
      let!(:vote3) { create(:vote, votable: idea2) }
      let!(:vote4) { create(:vote, votable: idea3) }

      example_request "Votes by project" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:total].stringify_keys).to match({
          project1.id => 3,
          project2.id => 1
        })
        expect(json_response[:projects].keys.map(&:to_s)).to match_array [project1.id, project2.id]
      end
    end


    describe "filtered by topic" do
      before do
        @topic = create(:topic)
        project = create(:project, topics: [@topic])
        idea1 = create(:idea, idea_status: @idea_status, topics: [@topic], project: project)
        idea2 = create(:idea_with_topics, idea_status: @idea_status)
        create(:vote, votable: idea1)
        create(:vote, votable: idea2)
      end

      let(:start_at) { now.in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { now.in_time_zone(@timezone).end_of_month }
      let(:topic) { @topic.id }

      example_request "Votes by project filtered by topic" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:total].values.inject(&:+)).to eq 1
      end
    end

    describe "filtered by group" do
      before do
        @group = create(:group)
        project = create(:project)
        idea = create(:idea, idea_status: @idea_status, project: project)
        create(:vote, votable: idea, user: create(:user, manual_groups: [@group]))
        create(:vote, votable: idea)
      end

      let(:start_at) { now.in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { now.in_time_zone(@timezone).end_of_month }
      let(:group) { @group.id }

      example_request "Votes by project filtered by group" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:total].values.inject(&:+)).to eq 1
      end
    end
  end

  get "web_api/v1/stats/votes_by_project_as_xlsx" do
    time_boundary_parameters self
    topic_filter_parameter self
    group_filter_parameter self

    describe "with time filtering only" do
      let(:start_at) { now.in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { now.in_time_zone(@timezone).end_of_month }

      let!(:project1) { create(:project) }
      let!(:project2) { create(:project) }
      let!(:idea1) { create(:idea, idea_status: @idea_status, project: project1) }
      let!(:idea2) { create(:idea, idea_status: @idea_status, project: project1) }
      let!(:idea3) { create(:idea, idea_status: @idea_status, project: project2) }
      let!(:idea4) { create(:idea, idea_status: @idea_status) }
      let!(:vote1) { create(:vote, votable: idea1) }
      let!(:vote2) { create(:vote, votable: idea1, mode: 'down') }
      let!(:vote3) { create(:vote, votable: idea2) }
      let!(:vote4) { create(:vote, votable: idea3) }

      example_request "Votes by project" do
        expect(response_status).to eq 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet[0].cells.map(&:value)).to match ['project', 'project_id', 'votes']

        project_ids_col = worksheet.map {|col| col.cells[1].value}
        header, *project_ids = project_ids_col
        expect(project_ids).to match_array [project1.id, project2.id]

        amount_col = worksheet.map {|col| col.cells[2].value}
        header, *amounts = amount_col
        expect(amounts).to match_array [3, 1]
      end
    end


    describe "filtered by topic" do
      before do
        @topic = create(:topic)
        project = create(:project, topics: [@topic])
        idea1 = create(:idea, idea_status: @idea_status, topics: [@topic], project: project)
        idea2 = create(:idea_with_topics, idea_status: @idea_status)
        create(:vote, votable: idea1)
        create(:vote, votable: idea2)
      end

      let(:start_at) { now.in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { now.in_time_zone(@timezone).end_of_month }
      let(:topic) { @topic.id }

      example_request "Votes by project filtered by topic" do
        expect(response_status).to eq 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet[0].cells.map(&:value)).to match ['project', 'project_id', 'votes']

        amount_col = worksheet.map {|col| col.cells[2].value}
        header, *amounts = amount_col
        expect(amounts.inject(&:+)).to eq 1
      end
    end

    describe "filtered by group" do
      before do
        @group = create(:group)
        project = create(:project)
        idea = create(:idea, idea_status: @idea_status, project: project)
        create(:vote, votable: idea, user: create(:user, manual_groups: [@group]))
        create(:vote, votable: idea)
      end

      let(:start_at) { now.in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { now.in_time_zone(@timezone).end_of_month }
      let(:group) { @group.id }

      example_request "Votes by project filtered by group" do
        expect(response_status).to eq 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet[0].cells.map(&:value)).to match ['project', 'project_id', 'votes']

        amount_col = worksheet.map {|col| col.cells[2].value}
        header, *amounts = amount_col
        expect(amounts.inject(&:+)).to eq 1
      end
    end
  end
end
