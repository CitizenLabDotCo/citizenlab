# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

def time_boundary_parameters(s)
  s.parameter :start_at, 'Date defining from where results should start', required: false
  s.parameter :end_at, 'Date defining till when results should go', required: false
end

def time_series_parameters(s)
  time_boundary_parameters s
  s.parameter :interval, 'Either day, week, month, year', required: true
end

def group_filter_parameter(s)
  s.parameter :group, 'Group ID. Only return users that are a member of the given group', required: false
end

def topic_filter_parameter(s)
  s.parameter :topic, 'Topic ID. Only returns users that have posted or commented on ideas in a given topic', required: false
end

resource 'Stats - Users' do
  explanation 'The various stats endpoints can be used to show how certain properties of users.'

  let(:multiloc_service) { MultilocService.new }
  let!(:now) { AppConfiguration.timezone.now }

  before do
    admin_header_token
    header 'Content-Type', 'application/json'
    AppConfiguration.instance.update!(created_at: now - 2.years)

    travel_to((now - 1.month).beginning_of_month - 1.day) do
      create(:user)
    end

    travel_to((now - 1.month).beginning_of_month + 10.days) do
      create(:user)
      create(:user)
      create(:admin)
      create(:user)
      create(:invited_user)
    end
    travel_to((now - 1.month).beginning_of_month + 25.days) do
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

  get 'web_api/v1/stats/users_by_time' do
    time_series_parameters self
    group_filter_parameter self
    topic_filter_parameter self
    parameter :project, 'Project ID. Only return users that can access the given project.', required: false

    describe 'with time filter outside of platform lifetime' do
      let(:start_at) { now - 10.years }
      let(:end_at) { now - 10.years + 1.day }

      it 'returns no entries' do
        do_request
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response).to eq({ series: { users: {} } })
      end
    end

    describe 'without time range filters' do
      let(:interval) { 'day' }

      example 'without filters', document: false do
        do_request
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:users].values.sum).to eq 11
      end
    end

    describe 'with time filters only' do
      let(:start_at) { (now - 1.month).beginning_of_month }
      let(:end_at) { (now - 1.month).end_of_month }
      let(:interval) { 'day' }

      example_request 'Users by time' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:users].size).to eq start_at.end_of_month.day
        expect(json_response[:series][:users].values.sum).to eq 9
      end
    end

    describe 'with project filter' do
      let(:start_at) { (now - 1.month).beginning_of_month }
      let(:project) { @project.id }
      let(:end_at) { (now - 1.month).end_of_month }
      let(:interval) { 'day' }

      before do
        travel_to start_at + 5.days do
          create_list(:admin, 2)
          @project = create(:private_admins_project)
        end
      end

      example_request 'Users by time filtered by project' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:users].size).to eq start_at.end_of_month.day
        expect(json_response[:series][:users].values.sum).to eq 3
      end
    end

    describe 'with group filter' do
      let(:start_at) { (now - 1.month).beginning_of_month }
      let(:group) { @group1.id }
      let(:end_at) { (now - 1.month).end_of_month }
      let(:interval) { 'day' }

      before do
        travel_to start_at + 8.days do
          @group1 = create(:group)
          @group2 = create(:group)
          @user1 = create(:user, manual_groups: [@group1])
          @user2 = create(:user, manual_groups: [@group2])
        end
      end

      example_request 'Users by time filtered by group' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:users].size).to eq start_at.end_of_month.day
        expect(json_response[:series][:users].values.sum).to eq 1
      end
    end

    describe 'with topic filter' do
      let(:start_at) { (now - 1.month).beginning_of_month }
      let(:topic) { @topic1.id }
      let(:end_at) { (now - 1.month).end_of_month }
      let(:interval) { 'day' }

      before do
        travel_to start_at + 26.days do
          @topic1 = create(:topic)
          @topic2 = create(:topic)
          project = create(:project, allowed_input_topics: [@topic1, @topic2])
          @user1 = create(:user)
          @user2 = create(:user)
          @idea1 = create(:idea, author: @user1, topics: [@topic1], project: project)
          @idea2 = create(:idea, topics: [@topic2], project: project)
          @idea3 = create(:idea)
          @comment1 = create(:comment, author: @user2, idea: @idea1)
          @comment2 = create(:comment, post: @idea2)
          create(:reaction, reactable: @idea1)
        end
      end

      example_request 'Users by time filtered by topic' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:users].size).to eq start_at.end_of_month.day
        expect(json_response[:series][:users].values.sum).to eq 3
      end
    end
  end

  get 'web_api/v1/stats/users_by_time_as_xlsx' do
    time_series_parameters self
    group_filter_parameter self
    topic_filter_parameter self
    parameter :project, 'Project ID. Only return users that can access the given project.', required: false

    describe 'without time range filters' do
      let(:interval) { 'day' }

      example 'without filters', document: false do
        do_request

        assert_status 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]

        amount_col = worksheet.map { |col| col.cells[1].value }
        _header, *amounts = amount_col
        expect(amounts.sum).to eq 11
      end
    end

    describe 'with time filter outside of platform lifetime' do
      let(:start_at) { now - 10.years }
      let(:end_at) { now - 10.years + 1.day }
      let(:interval) { 'day' }

      it 'returns no entries' do
        do_request
        assert_status 422
      end
    end

    describe 'with time filters only' do
      let(:start_at) { (now - 1.month).beginning_of_month }
      let(:end_at) { (now - 1.month).end_of_month }
      let(:interval) { 'day' }

      example_request 'Users by time' do
        assert_status 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet.count).to eq start_at.end_of_month.day + 1

        amount_col = worksheet.map { |col| col.cells[1].value }
        _header, *amounts = amount_col
        expect(amounts.sum).to eq 9
      end
    end

    describe 'with project filter' do
      let(:start_at) { (now - 1.month).beginning_of_month }
      let(:project) { @project.id }
      let(:end_at) { (now - 1.month).end_of_month }
      let(:interval) { 'day' }

      before do
        travel_to start_at + 5.days do
          create_list(:admin, 2)
          @project = create(:private_admins_project)
        end
      end

      example_request 'Users by time filtered by project' do
        assert_status 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet.count).to eq start_at.end_of_month.day + 1

        amount_col = worksheet.map { |col| col.cells[1].value }
        _header, *amounts = amount_col
        expect(amounts.sum).to eq 3
      end
    end

    describe 'with group filter' do
      let(:start_at) { (now - 1.month).beginning_of_month }
      let(:group) { @group1.id }
      let(:end_at) { (now - 1.month).end_of_month }
      let(:interval) { 'day' }

      before do
        travel_to start_at + 8.days do
          @group1 = create(:group)
          @group2 = create(:group)
          @user1 = create(:user, manual_groups: [@group1])
          @user2 = create(:user, manual_groups: [@group2])
        end
      end

      example_request 'Users by time filtered by group' do
        assert_status 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet.count).to eq start_at.end_of_month.day + 1

        amount_col = worksheet.map { |col| col.cells[1].value }
        _header, *amounts = amount_col
        expect(amounts.sum).to eq 1
      end
    end

    describe 'with topic filter' do
      let(:start_at) { (now - 1.month).beginning_of_month }
      let(:topic) { @topic1.id }
      let(:end_at) { (now - 1.month).end_of_month }
      let(:interval) { 'day' }

      before do
        travel_to start_at + 26.days do
          @topic1 = create(:topic)
          @topic2 = create(:topic)
          project = create(:project, allowed_input_topics: [@topic1, @topic2])
          @user1 = create(:user)
          @user2 = create(:user)
          @idea1 = create(:idea, author: @user1, topics: [@topic1], project: project)
          @idea2 = create(:idea, topics: [@topic2], project: project)
          @idea3 = create(:idea)
          @comment1 = create(:comment, author: @user2, idea: @idea1)
          @comment2 = create(:comment, post: @idea2)
          create(:reaction, reactable: @idea1)
        end
      end

      example_request 'Users by time filtered by topic' do
        assert_status 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet.count).to eq start_at.end_of_month.day + 1

        amount_col = worksheet.map { |col| col.cells[1].value }
        _header, *amounts = amount_col
        expect(amounts.sum).to eq 3
      end
    end
  end

  get 'web_api/v1/stats/users_by_time_cumulative' do
    time_series_parameters self
    group_filter_parameter self
    topic_filter_parameter self
    parameter :project, 'Project ID. Only return users that can access the given project.', required: false

    describe 'with time filters only' do
      let(:start_at) { (now - 1.month).beginning_of_month }
      let(:end_at) { (now - 1.month).end_of_month }
      let(:interval) { 'day' }

      example_request 'Users by time (cumulative)' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:users].size).to eq start_at.end_of_month.day
        # monotonically increasing
        expect(json_response[:series][:users].values.uniq).to eq json_response[:series][:users].values.uniq.sort
        expect(json_response[:series][:users].values.last).to eq 10
      end
    end

    describe 'with project filter' do
      let(:start_at) { (now - 1.month).beginning_of_month }
      let(:project) { @project.id }
      let(:end_at) { (now - 1.month).end_of_month }
      let(:interval) { 'day' }

      before do
        travel_to start_at + 7.days do
          create_list(:admin, 4)
          @project = create(:private_admins_project)
        end
      end

      example_request 'Users by time (cumulative) filtered by project' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:users].size).to eq start_at.end_of_month.day
        # monotonically increasing
        expect(json_response[:series][:users].values.uniq).to eq json_response[:series][:users].values.uniq.sort
        expect(json_response[:series][:users].values.last).to eq 5
      end
    end

    describe 'with group filter' do
      let(:start_at) { (now - 1.month).beginning_of_month }
      let(:group) { @group1.id }
      let(:end_at) { (now - 1.month).end_of_month }
      let(:interval) { 'day' }

      before do
        travel_to start_at + 14.days do
          @group1 = create(:group)
          @group2 = create(:group)
          @user1 = create(:user, manual_groups: [@group1])
          @user2 = create(:user, manual_groups: [@group2])
        end
      end

      example_request 'Users by time (cumulative) filtered by group' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:users].size).to eq start_at.end_of_month.day
        # monotonically increasing
        expect(json_response[:series][:users].values.uniq).to eq json_response[:series][:users].values.uniq.sort
        expect(json_response[:series][:users].values.last).to eq 1
      end
    end

    describe 'with topic filter' do
      let(:start_at) { (now - 1.month).beginning_of_month }
      let(:topic) { @topic1.id }
      let(:end_at) { (now - 1.month).end_of_month }
      let(:interval) { 'day' }

      before do
        travel_to start_at + 5.days do
          @topic1 = create(:topic)
          @topic2 = create(:topic)
          project = create(:project, allowed_input_topics: [@topic1, @topic2])
          @user1 = create(:user)
          @user2 = create(:user)
          @idea1 = create(:idea, author: @user1, topics: [@topic1], project: project)
          @idea2 = create(:idea, topics: [@topic2], project: project)
          @idea3 = create(:idea)
          @comment1 = create(:comment, author: @user2, idea: @idea1)
          @comment2 = create(:comment, post: @idea2)
          create(:reaction, reactable: @idea1)
        end
      end

      example_request 'Users by time (cumulative) filtered by topic' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:users].size).to eq start_at.end_of_month.day
        # monotonically increasing
        expect(json_response[:series][:users].values.uniq).to eq json_response[:series][:users].values.uniq.sort
        expect(json_response[:series][:users].values.last).to eq 3
      end
    end
  end

  get 'web_api/v1/stats/users_by_time_cumulative_as_xlsx' do
    time_series_parameters self
    group_filter_parameter self
    topic_filter_parameter self
    parameter :project, 'Project ID. Only return users that can access the given project.', required: false

    describe 'with time filters only' do
      let(:start_at) { (now - 1.month).beginning_of_month }
      let(:end_at) { (now - 1.month).end_of_month }
      let(:interval) { 'day' }

      example_request 'Users by time (cumulative) as xlsx' do
        assert_status 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet.count).to eq start_at.end_of_month.day + 1
        # monotonically increasing
        expect(worksheet[0].cells.map(&:value)).to match %w[date amount]
        amount_col = worksheet.map { |col| col.cells[1].value }
        _header, *amounts = amount_col
        expect(amounts.sort).to eq amounts
        expect(amount_col.last).to eq 10
      end
    end

    describe 'with project filter' do
      let(:start_at) { (now - 1.month).beginning_of_month }
      let(:project) { @project.id }
      let(:end_at) { (now - 1.month).end_of_month }
      let(:interval) { 'day' }

      before do
        travel_to start_at + 7.days do
          create_list(:admin, 4)
          @project = create(:private_admins_project)
        end
      end

      example_request 'Users by time (cumulative) filtered by project as xlsx' do
        assert_status 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet.count).to eq start_at.end_of_month.day + 1
        # monotonically increasing
        expect(worksheet[0].cells.map(&:value)).to match %w[date amount]
        amount_col = worksheet.map { |col| col.cells[1].value }
        _header, *amounts = amount_col
        expect(amounts.sort).to eq amounts
        expect(amount_col.last).to eq 5
      end
    end

    describe 'with group filter' do
      let(:start_at) { (now - 1.month).beginning_of_month }
      let(:group) { @group1.id }
      let(:end_at) { (now - 1.month).end_of_month }
      let(:interval) { 'day' }

      before do
        travel_to start_at + 14.days do
          @group1 = create(:group)
          @group2 = create(:group)
          @user1 = create(:user, manual_groups: [@group1])
          @user2 = create(:user, manual_groups: [@group2])
        end
      end

      example_request 'Users by time (cumulative) filtered by group as xlsx' do
        assert_status 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet.count).to eq start_at.end_of_month.day + 1
        # monotonically increasing
        expect(worksheet[0].cells.map(&:value)).to match %w[date amount]
        amount_col = worksheet.map { |col| col.cells[1].value }
        _header, *amounts = amount_col
        expect(amounts.sort).to eq amounts
        expect(amount_col.last).to eq 1
      end
    end

    describe 'with topic filter' do
      let(:start_at) { (now - 1.month).beginning_of_month }
      let(:topic) { @topic1.id }
      let(:end_at) { (now - 1.month).end_of_month }
      let(:interval) { 'day' }

      before do
        travel_to start_at + 5.days do
          @topic1 = create(:topic)
          @topic2 = create(:topic)
          project = create(:project, allowed_input_topics: [@topic1, @topic2])
          @user1 = create(:user)
          @user2 = create(:user)
          @idea1 = create(:idea, author: @user1, topics: [@topic1], project: project)
          @idea2 = create(:idea, topics: [@topic2], project: project)
          @idea3 = create(:idea)
          @comment1 = create(:comment, author: @user2, idea: @idea1)
          @comment2 = create(:comment, post: @idea2)
          create(:reaction, reactable: @idea1)
        end
      end

      example_request 'Users by time (cumulative) filtered by topic as xlsx' do
        assert_status 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet.count).to eq start_at.end_of_month.day + 1
        # monotonically increasing
        expect(worksheet[0].cells.map(&:value)).to match %w[date amount]
        amount_col = worksheet.map { |col| col.cells[1].value }
        _header, *amounts = amount_col
        expect(amounts.sort).to eq amounts
        expect(amount_col.last).to eq 3
      end
    end
  end

  get 'web_api/v1/stats/active_users_by_time' do
    explanation 'Active users are users that have generated some activity within the given interval window'
    time_series_parameters self
    group_filter_parameter self
    parameter :project, 'Project ID. Only return users that have participated in the given project.', required: false

    describe 'with time filters only' do
      let(:start_at) { (now - 1.month).beginning_of_month }
      let(:end_at) { (now - 1.month).end_of_month }
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

      example_request 'Active users by time' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data][:attributes][:series][:users].size).to eq start_at.end_of_month.day
        expect(json_response[:data][:attributes][:series][:users].values.sum).to eq 4
      end
    end

    describe 'with project filter' do
      let(:start_at) { (now - 1.month).beginning_of_month }
      let(:project) { @project.id }
      let(:end_at) { (now - 1.month).end_of_month }
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

      example_request 'Active users by time filtered by project' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data][:attributes][:series][:users].size).to eq start_at.end_of_month.day
        expect(json_response[:data][:attributes][:series][:users].values.sum).to eq 1
      end
    end

    describe 'with group filter' do
      let(:start_at) { (now - 1.month).beginning_of_month }
      let(:group) { @group1.id }
      let(:end_at) { (now - 1.month).end_of_month }
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

      example_request 'Active users by time filtered by group' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data][:attributes][:series][:users].size).to eq start_at.end_of_month.day
        expect(json_response[:data][:attributes][:series][:users].values.map(&:class).uniq).to eq [Integer]
        expect(json_response[:data][:attributes][:series][:users].values.sum).to eq 1
      end
    end

    describe 'with topic filter' do
      let(:start_at) { (now - 1.month).beginning_of_month }
      let(:topic) { @topic1.id }
      let(:end_at) { (now - 1.month).end_of_month }
      let(:interval) { 'day' }

      before do
        travel_to start_at + 3.weeks do
          @topic1 = create(:topic)
          @topic2 = create(:topic)
          project = create(:project, allowed_input_topics: [@topic1, @topic2])
          @user1 = create(:user)
          @user2 = create(:user)
          @idea1 = create(:idea, author: @user1, topics: [@topic1], project: project)
          @idea2 = create(:idea, topics: [@topic2], project: project)
          @idea3 = create(:idea)
          @comment1 = create(:comment, author: @user2, idea: @idea1)
          @comment2 = create(:comment, post: @idea2)
          create(:reaction, reactable: @idea1)
          create(:activity, user: @user1)
          create(:activity, user: @user2)
        end
      end

      example_request 'Active users by time filtered by topic' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data][:attributes][:series][:users].size).to eq start_at.end_of_month.day
        expect(json_response[:data][:attributes][:series][:users].values.map(&:class).uniq).to eq [Integer]
        expect(json_response[:data][:attributes][:series][:users].values.sum).to eq 2
      end
    end
  end

  get 'web_api/v1/stats/active_users_by_time_as_xlsx' do
    explanation 'Active users are users that have generated some activity within the given interval window'
    time_series_parameters self
    group_filter_parameter self
    parameter :project, 'Project ID. Only return users that have participated in the given project.', required: false

    describe 'with time filters only' do
      let(:start_at) { (now - 1.month).beginning_of_month }
      let(:end_at) { (now - 1.month).end_of_month }
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

      example_request 'Active users by time' do
        assert_status 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet.count).to eq start_at.end_of_month.day + 1
        expect(worksheet[0].cells.map(&:value)).to match %w[date amount]
        amount_col = worksheet.map { |col| col.cells[1].value }
        _header, *amounts = amount_col
        expect(amounts.sum).to eq 4
      end
    end
  end

  get 'web_api/v1/stats/active_users_by_time_cumulative' do
    explanation 'Active users are users that have generated some activity within the given interval window'
    time_series_parameters self
    group_filter_parameter self
    parameter :project, 'Project ID. Only return users that have participated in the given project.', required: false

    describe 'with time filters only' do
      let(:start_at) { (now - 1.month).beginning_of_month }
      let(:end_at) { (now - 1.month).end_of_month }
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

      example_request 'Active users by time' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:users].size).to eq start_at.end_of_month.day
        expect(json_response[:series][:users].values.last).to eq 4
      end
    end

    describe 'with project filter' do
      let(:start_at) { (now - 1.month).beginning_of_month }
      let(:project) { @project.id }
      let(:end_at) { (now - 1.month).end_of_month }
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

      example_request 'Active users by time filtered by project' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:users].size).to eq start_at.end_of_month.day
        expect(json_response[:series][:users].values.last).to eq 1
      end
    end

    describe 'with group filter' do
      let(:start_at) { (now - 1.month).beginning_of_month }
      let(:group) { @group1.id }
      let(:end_at) { (now - 1.month).end_of_month }
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

      example_request 'Active users by time filtered by group' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:users].size).to eq start_at.end_of_month.day
        expect(json_response[:series][:users].values.map(&:class).uniq).to eq [Integer]
        expect(json_response[:series][:users].values.last).to eq 1
      end
    end

    describe 'with topic filter' do
      let(:start_at) { (now - 1.month).beginning_of_month }
      let(:topic) { @topic1.id }
      let(:end_at) { (now - 1.month).end_of_month }
      let(:interval) { 'day' }

      before do
        travel_to start_at + 3.weeks do
          @topic1 = create(:topic)
          @topic2 = create(:topic)
          project = create(:project, allowed_input_topics: [@topic1, @topic2])
          @user1 = create(:user)
          @user2 = create(:user)
          @idea1 = create(:idea, author: @user1, topics: [@topic1], project: project)
          @idea2 = create(:idea, topics: [@topic2], project: project)
          @idea3 = create(:idea)
          @comment1 = create(:comment, author: @user2, idea: @idea1)
          @comment2 = create(:comment, post: @idea2)
          create(:reaction, reactable: @idea1)
          create(:activity, user: @user1)
          create(:activity, user: @user2)
        end
      end

      example_request 'Active users by time filtered by topic' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:users].size).to eq start_at.end_of_month.day
        expect(json_response[:series][:users].values.map(&:class).uniq).to eq [Integer]
        expect(json_response[:series][:users].values.last).to eq 2
      end
    end
  end
end
