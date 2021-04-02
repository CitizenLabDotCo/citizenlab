require 'rails_helper'
require 'rspec_api_documentation/dsl'

multiloc_service = MultilocService.new

def time_boundary_parameters s
  s.parameter :start_at, "Date defining from where results should start", required: false
  s.parameter :end_at, "Date defining till when results should go", required: false
end

def time_series_parameters s
  time_boundary_parameters s
  s.parameter :interval, "Either day, week, month, year", required: true
end

def group_filter_parameter s
  s.parameter :group, "Group ID. Only return users that are a member of the given group", required: false
end

def topic_filter_parameter s
  s.parameter :topic, "Topic ID. Only returns users that have posted or commented on ideas in a given topic", required: false
end

resource "Stats - Users" do

  explanation "The various stats endpoints can be used to show how certain properties of users."

  let!(:now) { Time.now.in_time_zone(@timezone) }

  before do
    @current_user = create(:admin)
    token = Knock::AuthToken.new(payload: @current_user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
    header "Content-Type", "application/json"
    AppConfiguration.instance.update!(created_at: now - 2.year)
    @timezone = AppConfiguration.instance.settings('core','timezone')

    travel_to((now-1.month).in_time_zone(@timezone).beginning_of_month - 1.days) do
      create(:user)
    end

    travel_to((now-1.month).in_time_zone(@timezone).beginning_of_month + 10.days) do
      create(:user)
      create(:user)
      create(:admin)
      create(:user)
      create(:invited_user)
    end
    travel_to((now-1.month).in_time_zone(@timezone).beginning_of_month + 25.days) do
      create_list(:user, 4)
    end
  end

  get "web_api/v1/stats/users_count" do
    time_boundary_parameters self

    example_request "Count all users" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response[:count]).to eq User.active.count
    end
  end

  get "web_api/v1/stats/users_by_time" do
    time_series_parameters self
    group_filter_parameter self
    topic_filter_parameter self
    parameter :project, "Project ID. Only return users that can access the given project.", required: false

    describe "with time filter outside of platform lifetime" do
      let(:start_at) { now - 10.year }
      let(:end_at) { now - 10.year + 1.day}

      it "returns no entries" do
        do_request
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response).to eq({series: { users: {} }})
      end
    end

    describe "without time range filters" do
      let(:interval) { 'day' }

      example "without filters", document: false do
        do_request
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:users].values.inject(&:+)).to eq 11
      end
    end

    describe "with time filters only" do
      let(:start_at) { (now-1.month).in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { (now-1.month).in_time_zone(@timezone).end_of_month }
      let(:interval) { 'day' }

      example_request "Users by time" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:users].size).to eq start_at.end_of_month.day
        expect(json_response[:series][:users].values.inject(&:+)).to eq 9
      end
    end

    describe "with project filter" do
      let(:start_at) { (now-1.month).in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { (now-1.month).in_time_zone(@timezone).end_of_month }
      let(:interval) { 'day' }

      before do
        travel_to start_at + 5.day do
          create_list(:admin, 2)
          @project = create(:private_admins_project)
        end
      end

      let(:project) { @project.id }

      example_request "Users by time filtered by project" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:users].size).to eq start_at.end_of_month.day
        expect(json_response[:series][:users].values.inject(&:+)).to eq 3
      end
    end

    describe "with group filter" do
      let(:start_at) { (now-1.month).in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { (now-1.month).in_time_zone(@timezone).end_of_month }
      let(:interval) { 'day' }

      before do
        travel_to start_at + 8.days do
          @group1 = create(:group)
          @group2 = create(:group)
          @user1 = create(:user, manual_groups: [@group1])
          @user2 = create(:user, manual_groups: [@group2])
        end
      end

      let(:group) { @group1.id }

      example_request "Users by time filtered by group" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:users].size).to eq start_at.end_of_month.day
        expect(json_response[:series][:users].values.inject(&:+)).to eq 1
      end
    end

    describe "with topic filter" do
      let(:start_at) { (now-1.month).in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { (now-1.month).in_time_zone(@timezone).end_of_month }
      let(:interval) { 'day' }

      before do
        travel_to start_at + 26.days do
          @topic1 = create(:topic)
          @topic2 = create(:topic)
          project = create(:project, topics: [@topic1, @topic2])
          @user1 = create(:user)
          @user2 = create(:user)
          @idea1 = create(:idea, author: @user1, topics: [@topic1], project: project)
          @idea2 = create(:idea, topics: [@topic2], project: project)
          @idea3 = create(:idea)
          @comment1 = create(:comment, author: @user2, idea: @idea1)
          @comment2 = create(:comment, post: @idea2)
          create(:vote, votable: @idea1)
        end
      end

      let(:topic) { @topic1.id }

      example_request "Users by time filtered by topic" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:users].size).to eq start_at.end_of_month.day
        expect(json_response[:series][:users].values.inject(&:+)).to eq 3
      end
    end
  end

  get "web_api/v1/stats/users_by_time_as_xlsx" do
    time_series_parameters self
    group_filter_parameter self
    topic_filter_parameter self
    parameter :project, "Project ID. Only return users that can access the given project.", required: false

    describe "without time range filters" do
      let(:interval) { 'day' }

      example "without filters", document: false do
        do_request

        expect(response_status).to eq 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]

        amount_col = worksheet.map {|col| col.cells[1].value}
        header, *amounts = amount_col
        expect(amounts.inject(&:+)).to eq 11
      end
    end

    describe "with time filter outside of platform lifetime" do
      let(:start_at) { now - 10.year }
      let(:end_at) { now - 10.year + 1.day}
      let(:interval) { 'day' }

      it "returns no entries" do
        do_request
        expect(response_status).to eq 422
      end
    end

    describe "with time filters only" do
      let(:start_at) { (now-1.month).in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { (now-1.month).in_time_zone(@timezone).end_of_month }
      let(:interval) { 'day' }

      example_request "Users by time" do
        expect(response_status).to eq 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet.count).to eq start_at.end_of_month.day + 1

        amount_col = worksheet.map {|col| col.cells[1].value}
        header, *amounts = amount_col
        expect(amounts.inject(&:+)).to eq 9
      end
    end

    describe "with project filter" do
      let(:start_at) { (now-1.month).in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { (now-1.month).in_time_zone(@timezone).end_of_month }
      let(:interval) { 'day' }

      before do
        travel_to start_at + 5.day do
          create_list(:admin, 2)
          @project = create(:private_admins_project)
        end
      end

      let(:project) { @project.id }

      example_request "Users by time filtered by project" do
        expect(response_status).to eq 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet.count).to eq start_at.end_of_month.day + 1

        amount_col = worksheet.map {|col| col.cells[1].value}
        header, *amounts = amount_col
        expect(amounts.inject(&:+)).to eq 3
      end
    end

    describe "with group filter" do
      let(:start_at) { (now-1.month).in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { (now-1.month).in_time_zone(@timezone).end_of_month }
      let(:interval) { 'day' }

      before do
        travel_to start_at + 8.days do
          @group1 = create(:group)
          @group2 = create(:group)
          @user1 = create(:user, manual_groups: [@group1])
          @user2 = create(:user, manual_groups: [@group2])
        end
      end

      let(:group) { @group1.id }

      example_request "Users by time filtered by group" do
        expect(response_status).to eq 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet.count).to eq start_at.end_of_month.day + 1

        amount_col = worksheet.map {|col| col.cells[1].value}
        header, *amounts = amount_col
        expect(amounts.inject(&:+)).to eq 1
      end
    end

    describe "with topic filter" do
      let(:start_at) { (now-1.month).in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { (now-1.month).in_time_zone(@timezone).end_of_month }
      let(:interval) { 'day' }

      before do
        travel_to start_at + 26.days do
          @topic1 = create(:topic)
          @topic2 = create(:topic)
          project = create(:project, topics: [@topic1, @topic2])
          @user1 = create(:user)
          @user2 = create(:user)
          @idea1 = create(:idea, author: @user1, topics: [@topic1], project: project)
          @idea2 = create(:idea, topics: [@topic2], project: project)
          @idea3 = create(:idea)
          @comment1 = create(:comment, author: @user2, idea: @idea1)
          @comment2 = create(:comment, post: @idea2)
          create(:vote, votable: @idea1)
        end
      end

      let(:topic) { @topic1.id }

      example_request "Users by time filtered by topic" do
        expect(response_status).to eq 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet.count).to eq start_at.end_of_month.day + 1

        amount_col = worksheet.map {|col| col.cells[1].value}
        header, *amounts = amount_col
        expect(amounts.inject(&:+)).to eq 3
      end
    end
  end

  get "web_api/v1/stats/users_by_time_cumulative" do
    time_series_parameters self
    group_filter_parameter self
    topic_filter_parameter self
    parameter :project, "Project ID. Only return users that can access the given project.", required: false

    describe "with time filters only" do
      let(:start_at) { (now-1.month).in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { (now-1.month).in_time_zone(@timezone).end_of_month }
      let(:interval) { 'day' }

      example_request "Users by time (cumulative)" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:users].size).to eq start_at.end_of_month.day
        # monotonically increasing
        expect(json_response[:series][:users].values.uniq).to eq json_response[:series][:users].values.uniq.sort
        expect(json_response[:series][:users].values.last).to eq 10
      end
    end

    describe "with project filter" do
      let(:start_at) { (now-1.month).in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { (now-1.month).in_time_zone(@timezone).end_of_month }
      let(:interval) { 'day' }

      before do
        travel_to start_at + 7.days do
          create_list(:admin, 4)
          @project = create(:private_admins_project)
        end
      end

      let(:project) { @project.id }

      example_request "Users by time (cumulative) filtered by project" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:users].size).to eq start_at.end_of_month.day
        # monotonically increasing
        expect(json_response[:series][:users].values.uniq).to eq json_response[:series][:users].values.uniq.sort
        expect(json_response[:series][:users].values.last).to eq 5
      end
    end

    describe "with group filter" do
      let(:start_at) { (now-1.month).in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { (now-1.month).in_time_zone(@timezone).end_of_month }
      let(:interval) { 'day' }

      before do
        travel_to start_at + 14.days do
          @group1 = create(:group)
          @group2 = create(:group)
          @user1 = create(:user, manual_groups: [@group1])
          @user2 = create(:user, manual_groups: [@group2])
        end
      end

      let(:group) { @group1.id }

      example_request "Users by time (cumulative) filtered by group" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:users].size).to eq start_at.end_of_month.day
        # monotonically increasing
        expect(json_response[:series][:users].values.uniq).to eq json_response[:series][:users].values.uniq.sort
        expect(json_response[:series][:users].values.last).to eq 1
      end
    end

    describe "with topic filter" do
      let(:start_at) { (now-1.month).in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { (now-1.month).in_time_zone(@timezone).end_of_month }
      let(:interval) { 'day' }

      before do
        travel_to start_at + 5.days do
          @topic1 = create(:topic)
          @topic2 = create(:topic)
          project = create(:project, topics: [@topic1, @topic2])
          @user1 = create(:user)
          @user2 = create(:user)
          @idea1 = create(:idea, author: @user1, topics: [@topic1], project: project)
          @idea2 = create(:idea, topics: [@topic2], project: project)
          @idea3 = create(:idea)
          @comment1 = create(:comment, author: @user2, idea: @idea1)
          @comment2 = create(:comment, post: @idea2)
          create(:vote, votable: @idea1)
        end
      end

      let(:topic) { @topic1.id }

      example_request "Users by time (cumulative) filtered by topic" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:users].size).to eq start_at.end_of_month.day
        # monotonically increasing
        expect(json_response[:series][:users].values.uniq).to eq json_response[:series][:users].values.uniq.sort
        expect(json_response[:series][:users].values.last).to eq 3
      end
    end
  end

  get "web_api/v1/stats/users_by_time_cumulative_as_xlsx" do
    time_series_parameters self
    group_filter_parameter self
    topic_filter_parameter self
    parameter :project, "Project ID. Only return users that can access the given project.", required: false

    describe "with time filters only" do
      let(:start_at) { (now-1.month).in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { (now-1.month).in_time_zone(@timezone).end_of_month }
      let(:interval) { 'day' }

      example_request "Users by time (cumulative) as xlsx" do
        expect(response_status).to eq 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet.count).to eq start_at.end_of_month.day + 1
        # monotonically increasing
        expect(worksheet[0].cells.map(&:value)).to match ['date', 'amount']
        amount_col = worksheet.map {|col| col.cells[1].value}
        header, *amounts = amount_col
        expect(amounts.sort).to eq amounts
        expect(amount_col.last).to eq 10
      end
    end

    describe "with project filter" do
      let(:start_at) { (now-1.month).in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { (now-1.month).in_time_zone(@timezone).end_of_month }
      let(:interval) { 'day' }

      before do
        travel_to start_at + 7.days do
          create_list(:admin, 4)
          @project = create(:private_admins_project)
        end
      end

      let(:project) { @project.id }

      example_request "Users by time (cumulative) filtered by project as xlsx" do
        expect(response_status).to eq 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet.count).to eq start_at.end_of_month.day + 1
        # monotonically increasing
        expect(worksheet[0].cells.map(&:value)).to match ['date', 'amount']
        amount_col = worksheet.map {|col| col.cells[1].value}
        header, *amounts = amount_col
        expect(amounts.sort).to eq amounts
        expect(amount_col.last).to eq 5
      end
    end

    describe "with group filter" do
      let(:start_at) { (now-1.month).in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { (now-1.month).in_time_zone(@timezone).end_of_month }
      let(:interval) { 'day' }

      before do
        travel_to start_at + 14.days do
          @group1 = create(:group)
          @group2 = create(:group)
          @user1 = create(:user, manual_groups: [@group1])
          @user2 = create(:user, manual_groups: [@group2])
        end
      end

      let(:group) { @group1.id }

      example_request "Users by time (cumulative) filtered by group as xlsx" do
        expect(response_status).to eq 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet.count).to eq start_at.end_of_month.day + 1
        # monotonically increasing
        expect(worksheet[0].cells.map(&:value)).to match ['date', 'amount']
        amount_col = worksheet.map {|col| col.cells[1].value}
        header, *amounts = amount_col
        expect(amounts.sort).to eq amounts
        expect(amount_col.last).to eq 1
      end
    end

    describe "with topic filter" do
      let(:start_at) { (now-1.month).in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { (now-1.month).in_time_zone(@timezone).end_of_month }
      let(:interval) { 'day' }

      before do
        travel_to start_at + 5.days do
          @topic1 = create(:topic)
          @topic2 = create(:topic)
          project = create(:project, topics: [@topic1, @topic2])
          @user1 = create(:user)
          @user2 = create(:user)
          @idea1 = create(:idea, author: @user1, topics: [@topic1], project: project)
          @idea2 = create(:idea, topics: [@topic2], project: project)
          @idea3 = create(:idea)
          @comment1 = create(:comment, author: @user2, idea: @idea1)
          @comment2 = create(:comment, post: @idea2)
          create(:vote, votable: @idea1)
        end
      end

      let(:topic) { @topic1.id }

      example_request "Users by time (cumulative) filtered by topic as xlsx" do
        expect(response_status).to eq 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet.count).to eq start_at.end_of_month.day + 1
        # monotonically increasing
        expect(worksheet[0].cells.map(&:value)).to match ['date', 'amount']
        amount_col = worksheet.map {|col| col.cells[1].value}
        header, *amounts = amount_col
        expect(amounts.sort).to eq amounts
        expect(amount_col.last).to eq 3
    end
  end
  end

  get "web_api/v1/stats/active_users_by_time" do
    explanation "Active users are users that have generated some activity within the given interval window"
    time_series_parameters self
    group_filter_parameter self
    parameter :project, "Project ID. Only return users that have participated in the given project.", required: false

    describe "with time filters only" do
      let(:start_at) { (now-1.month).in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { (now-1.month).in_time_zone(@timezone).end_of_month }
      let(:interval) { 'day' }

      before do
        travel_to(start_at + 3.days) do
          user = create(:user)
          create_list(:activity, 2, user: user)
          create(:activity)
          non_active_user = create(:user)
          create(:changed_title_activity, user: non_active_user)
        end
        travel_to(start_at + 8.days) do
          create_list(:activity, 2)
        end
      end


      example_request "Active users by time" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:users].size).to eq start_at.end_of_month.day
        expect(json_response[:series][:users].values.inject(&:+)).to eq 4
      end
    end

    describe "with project filter" do
      let(:start_at) { (now-1.month).in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { (now-1.month).in_time_zone(@timezone).end_of_month }
      let(:interval) { 'day' }

      before do
        travel_to start_at + 18.days do
          @project = create(:project)
          @idea1 = create(:idea, project: @project)
          create(:published_activity, item: @idea1, user: @idea1.author)
          @idea2 = create(:idea)
          create(:published_activity, item: @idea2, user: @idea2.author)
        end
      end

      let(:project) { @project.id }

      example_request "Active users by time filtered by project" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:users].size).to eq start_at.end_of_month.day
        expect(json_response[:series][:users].values.inject(&:+)).to eq 1
      end
    end

    describe "with group filter" do
      let(:start_at) { (now-1.month).in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { (now-1.month).in_time_zone(@timezone).end_of_month }
      let(:interval) { 'day' }

      before do
        travel_to start_at + 17.days do
          @group1 = create(:group)
          @group2 = create(:group)
          @user1 = create(:user, manual_groups: [@group1])
          @user2 = create(:user, manual_groups: [@group2])
          create(:activity, user: @user1)
          create(:activity, user: @user2)
          create(:activity)
        end
      end

      let(:group) { @group1.id }

      example_request "Active users by time filtered by group" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:users].size).to eq start_at.end_of_month.day
        expect(json_response[:series][:users].values.map(&:class).uniq).to eq [Integer]
        expect(json_response[:series][:users].values.inject(&:+)).to eq 1
      end
    end

    describe "with topic filter" do
      let(:start_at) { (now-1.month).in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { (now-1.month).in_time_zone(@timezone).end_of_month }
      let(:interval) { 'day' }

      before do
        travel_to start_at + 3.weeks do
          @topic1 = create(:topic)
          @topic2 = create(:topic)
          project = create(:project, topics: [@topic1, @topic2])
          @user1 = create(:user)
          @user2 = create(:user)
          @idea1 = create(:idea, author: @user1, topics: [@topic1], project: project)
          @idea2 = create(:idea, topics: [@topic2], project: project)
          @idea3 = create(:idea)
          @comment1 = create(:comment, author: @user2, idea: @idea1)
          @comment2 = create(:comment, post: @idea2)
          create(:vote, votable: @idea1)
          create(:activity, user: @user1)
          create(:activity, user: @user2)
        end
      end

      let(:topic) { @topic1.id }

      example_request "Active users by time filtered by topic" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:users].size).to eq start_at.end_of_month.day
        expect(json_response[:series][:users].values.map(&:class).uniq).to eq [Integer]
        expect(json_response[:series][:users].values.inject(&:+)).to eq 2
      end
    end
  end

  get "web_api/v1/stats/active_users_by_time_as_xlsx" do
    explanation "Active users are users that have generated some activity within the given interval window"
    time_series_parameters self
    group_filter_parameter self
    parameter :project, "Project ID. Only return users that have participated in the given project.", required: false

    describe "with time filters only" do
      let(:start_at) { (now-1.month).in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { (now-1.month).in_time_zone(@timezone).end_of_month }
      let(:interval) { 'day' }

      before do
        travel_to(start_at + 3.days) do
          user = create(:user)
          create_list(:activity, 2, user: user)
          create(:activity)
          non_active_user = create(:user)
          create(:changed_title_activity, user: non_active_user)
        end
        travel_to(start_at + 8.days) do
          create_list(:activity, 2)
        end
      end


      example_request "Active users by time" do
        expect(response_status).to eq 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet.count).to eq start_at.end_of_month.day + 1
        expect(worksheet[0].cells.map(&:value)).to match ['date', 'amount']
        amount_col = worksheet.map {|col| col.cells[1].value}
        header, *amounts = amount_col
        expect(amounts.inject(&:+)).to eq 4
      end
    end
  end

  get "web_api/v1/stats/users_engagement_scores" do
    time_boundary_parameters self
    group_filter_parameter self

    let(:start_at) { (now-1.month).in_time_zone(@timezone).beginning_of_month }
    let(:end_at) { (now-1.month).in_time_zone(@timezone).end_of_month }

    before do
      @u1, @u2, @u3 = create_list(:user, 3)
      travel_to(start_at - 1.day) do
        create(:published_activity, user: @u2)
      end

      travel_to start_at + 4.days do
        @group = create(:group)
        create(:membership, user: @u1, group: @group)
        create(:membership, user: @u2, group: @group)

        create(:comment_created_activity, user: @u1)
        create(:idea_upvoted_activity, user: @u1)
        create(:published_activity, user: @u2)
        create(:idea_downvoted_activity, user: @u2)
        create(:comment_created_activity, user: @u3)
      end
    end

    let(:group) { @group.id }

    example_request "List 10 best user engagement scores" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response[:data].map{|d| d[:attributes][:sum_score]}).to eq([6, 4])
      expect(json_response[:data].map{|d| d[:relationships][:user][:data][:id]}).to eq([@u2.id, @u1.id])
      expect(json_response[:included].size).to eq 2
    end
  end
  get "web_api/v1/stats/active_users_by_time_cumulative" do
    explanation "Active users are users that have generated some activity within the given interval window"
    time_series_parameters self
    group_filter_parameter self
    parameter :project, "Project ID. Only return users that have participated in the given project.", required: false

    describe "with time filters only" do
      let(:start_at) { (now-1.month).in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { (now-1.month).in_time_zone(@timezone).end_of_month }
      let(:interval) { 'day' }

      before do
        travel_to(start_at + 3.days) do
          user = create(:user)
          create_list(:activity, 2, user: user)
          create(:activity)
          non_active_user = create(:user)
          create(:changed_title_activity, user: non_active_user)
        end
        travel_to(start_at + 8.days) do
          create_list(:activity, 2)
        end
      end


      example_request "Active users by time" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:users].size).to eq start_at.end_of_month.day
        expect(json_response[:series][:users].values.last()).to eq 4
      end
    end

    describe "with project filter" do
      let(:start_at) { (now-1.month).in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { (now-1.month).in_time_zone(@timezone).end_of_month }
      let(:interval) { 'day' }

      before do
        travel_to start_at + 18.days do
          @project = create(:project)
          @idea1 = create(:idea, project: @project)
          create(:published_activity, item: @idea1, user: @idea1.author)
          @idea2 = create(:idea)
          create(:published_activity, item: @idea2, user: @idea2.author)
        end
      end

      let(:project) { @project.id }

      example_request "Active users by time filtered by project" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:users].size).to eq start_at.end_of_month.day
        expect(json_response[:series][:users].values.last()).to eq 1
      end
    end

    describe "with group filter" do
      let(:start_at) { (now-1.month).in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { (now-1.month).in_time_zone(@timezone).end_of_month }
      let(:interval) { 'day' }

      before do
        travel_to start_at + 17.days do
          @group1 = create(:group)
          @group2 = create(:group)
          @user1 = create(:user, manual_groups: [@group1])
          @user2 = create(:user, manual_groups: [@group2])
          create(:activity, user: @user1)
          create(:activity, user: @user2)
          create(:activity)
        end
      end

      let(:group) { @group1.id }

      example_request "Active users by time filtered by group" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:users].size).to eq start_at.end_of_month.day
        expect(json_response[:series][:users].values.map(&:class).uniq).to eq [Integer]
        expect(json_response[:series][:users].values.last()).to eq 1
      end
    end

    describe "with topic filter" do
      let(:start_at) { (now-1.month).in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { (now-1.month).in_time_zone(@timezone).end_of_month }
      let(:interval) { 'day' }

      before do
        travel_to start_at + 3.weeks do
          @topic1 = create(:topic)
          @topic2 = create(:topic)
          project = create(:project, topics: [@topic1, @topic2])
          @user1 = create(:user)
          @user2 = create(:user)
          @idea1 = create(:idea, author: @user1, topics: [@topic1], project: project)
          @idea2 = create(:idea, topics: [@topic2], project: project)
          @idea3 = create(:idea)
          @comment1 = create(:comment, author: @user2, idea: @idea1)
          @comment2 = create(:comment, post: @idea2)
          create(:vote, votable: @idea1)
          create(:activity, user: @user1)
          create(:activity, user: @user2)
        end
      end

      let(:topic) { @topic1.id }

      example_request "Active users by time filtered by topic" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:users].size).to eq start_at.end_of_month.day
        expect(json_response[:series][:users].values.map(&:class).uniq).to eq [Integer]
        expect(json_response[:series][:users].values.last()).to eq 2
      end
    end
  end

  get "web_api/v1/stats/users_engagement_scores" do
    time_boundary_parameters self
    group_filter_parameter self

    let(:start_at) { (now-1.month).in_time_zone(@timezone).beginning_of_month }
    let(:end_at) { (now-1.month).in_time_zone(@timezone).end_of_month }

    before do
      @u1, @u2, @u3 = create_list(:user, 3)
      travel_to(start_at - 1.day) do
        create(:published_activity, user: @u2)
      end

      travel_to start_at + 4.days do
        @group = create(:group)
        create(:membership, user: @u1, group: @group)
        create(:membership, user: @u2, group: @group)

        create(:comment_created_activity, user: @u1)
        create(:idea_upvoted_activity, user: @u1)
        create(:published_activity, user: @u2)
        create(:idea_downvoted_activity, user: @u2)
        create(:comment_created_activity, user: @u3)
      end
    end

    let(:group) { @group.id }

    example_request "List 10 best user engagement scores" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response[:data].map{|d| d[:attributes][:sum_score]}).to eq([6, 4])
      expect(json_response[:data].map{|d| d[:relationships][:user][:data][:id]}).to eq([@u2.id, @u1.id])
      expect(json_response[:included].size).to eq 2
    end
  end
end
