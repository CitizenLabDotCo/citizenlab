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

def project_filter_parameter(s)
  s.parameter :project, 'Project ID. Only count reactions on ideas in the given project', required: false
end

def group_filter_parameter(s)
  s.parameter :group, 'Group ID. Only count reactions by users in the given group', required: false
end

def topic_filter_parameter(s)
  s.parameter :topic, 'Topic ID. Only count reactions on ideas that have the given topic assigned', required: false
end

resource 'Stats - Reactions' do
  explanation 'The various stats endpoints can be used to show how certain properties of reactions.'
  header 'Content-Type', 'application/json'

  let(:timezone) { AppConfiguration.timezone }
  let(:now) { timezone.now }

  before do
    admin_header_token
    AppConfiguration.instance.update!(created_at: now - 3.months)
    @idea_status = create(:idea_status)
  end

  get 'web_api/v1/stats/reactions_count' do
    time_boundary_parameters self

    before do
      i1, i2 = create_list(:idea, 2, idea_status: @idea_status, project: create(:project), author: create(:user))
      create_list(:reaction, 3, reactable: i1)
      create_list(:reaction, 2, mode: 'down', reactable: i2)
    end

    example 'Count all reactions' do
      do_request
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:up]).to eq 3
      expect(json_response[:down]).to eq 2
      expect(json_response[:total]).to eq 5
    end
  end

  get 'web_api/v1/stats/reactions_by_topic' do
    time_boundary_parameters self
    project_filter_parameter self
    group_filter_parameter self

    describe 'with time filtering only' do
      let(:start_at) { now.beginning_of_week }
      let(:end_at) { now.end_of_week }

      let!(:topic1) { create(:topic) }
      let!(:topic2) { create(:topic) }
      let!(:topic3) { create(:topic) }
      let!(:project1) { create(:project, allowed_input_topics: [topic1, topic2, topic3]) }
      let!(:idea1) { create(:idea, idea_status: @idea_status, topics: [topic1], project: project1) }
      let!(:idea2) { create(:idea, idea_status: @idea_status, topics: [topic2], project: project1) }
      let!(:idea3) { create(:idea, idea_status: @idea_status, topics: [topic1, topic2], project: project1) }
      let!(:idea4) { create(:idea, idea_status: @idea_status) }
      let!(:reaction1) { create(:reaction, reactable: idea1) }
      let!(:reaction2) { create(:reaction, reactable: idea1, mode: 'down') }
      let!(:reaction3) { create(:reaction, reactable: idea2) }
      let!(:reaction4) { create(:reaction, reactable: idea3) }

      example_request 'Reactions by topic' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :type)).to eq 'reactions_by_topic'
        json_attributes = json_response.dig(:data, :attributes)
        expect(json_attributes[:series][:total].stringify_keys).to match({
          topic1.id => 3,
          topic2.id => 2
        })
        expect(json_attributes[:topics].keys.map(&:to_s)).to eq [topic1.id, topic2.id, topic3.id]
      end
    end

    describe 'filtered by project' do
      before do
        @project = create(:project)
        idea = create(:idea_with_topics, idea_status: @idea_status, topics_count: 2, project: @project)
        create(:reaction, reactable: idea)
        create(:reaction, reactable: create(:idea_with_topics, idea_status: @idea_status))
      end

      let(:start_at) { now.beginning_of_month }
      let(:end_at) { now.end_of_month }
      let(:project) { @project.id }

      example_request 'Reactions by topic filtered by project' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :type)).to eq 'reactions_by_topic'
        json_attributes = json_response.dig(:data, :attributes)
        expect(json_attributes[:series][:total].values.sum).to eq 2
      end
    end

    describe 'filtered by group' do
      before do
        @group = create(:group)
        idea = create(:idea_with_topics, idea_status: @idea_status, topics_count: 2)
        create(:reaction, reactable: idea, user: create(:user, manual_groups: [@group]))
        create(:reaction, reactable: create(:idea_with_topics, idea_status: @idea_status))
      end

      let(:start_at) { now.beginning_of_month }
      let(:end_at) { now.end_of_month }
      let(:group) { @group.id }

      example_request 'Reactions by topic filtered by group' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :type)).to eq 'reactions_by_topic'
        json_attributes = json_response.dig(:data, :attributes)
        expect(json_attributes[:series][:total].values.sum).to eq 2
      end
    end
  end

  get 'web_api/v1/stats/reactions_by_topic_as_xlsx' do
    time_boundary_parameters self
    project_filter_parameter self
    group_filter_parameter self

    describe 'with time filtering only' do
      let(:start_at) { now.beginning_of_week }
      let(:end_at) { now.end_of_week }

      let!(:topic1) { create(:topic) }
      let!(:topic2) { create(:topic) }
      let!(:topic3) { create(:topic) }
      let!(:project1) { create(:project, allowed_input_topics: [topic1, topic2, topic3]) }
      let!(:idea1) { create(:idea, idea_status: @idea_status, topics: [topic1], project: project1) }
      let!(:idea2) { create(:idea, idea_status: @idea_status, topics: [topic2], project: project1) }
      let!(:idea3) { create(:idea, idea_status: @idea_status, topics: [topic1, topic2], project: project1) }
      let!(:idea4) { create(:idea, idea_status: @idea_status) }
      let!(:reaction1) { create(:reaction, reactable: idea1) }
      let!(:reaction2) { create(:reaction, reactable: idea1, mode: 'down') }
      let!(:reaction3) { create(:reaction, reactable: idea2) }
      let!(:reaction4) { create(:reaction, reactable: idea3) }

      example_request 'Reactions by topic' do
        assert_status 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet[0].cells.map(&:value)).to match %w[topic topic_id reactions]

        topic_ids_col = worksheet.map { |col| col.cells[1].value }
        _header, *topic_ids = topic_ids_col
        expect(topic_ids).to match_array [topic1.id, topic2.id]

        amount_col = worksheet.map { |col| col.cells[2].value }
        _header, *amounts = amount_col
        expect(amounts).to match_array [3, 2]
      end
    end

    describe 'filtered by project' do
      before do
        @project = create(:project)
        idea = create(:idea_with_topics, idea_status: @idea_status, topics_count: 2, project: @project)
        create(:reaction, reactable: idea)
        create(:reaction, reactable: create(:idea_with_topics, idea_status: @idea_status))
      end

      let(:start_at) { now.beginning_of_month }
      let(:end_at) { now.end_of_month }
      let(:project) { @project.id }

      example_request 'Reactions by topic filtered by project' do
        assert_status 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet[0].cells.map(&:value)).to match %w[topic topic_id reactions]

        amount_col = worksheet.map { |col| col.cells[2].value }
        _header, *amounts = amount_col
        expect(amounts.sum).to eq 2
      end
    end

    describe 'filtered by group' do
      before do
        @group = create(:group)
        idea = create(:idea_with_topics, idea_status: @idea_status, topics_count: 2)
        create(:reaction, reactable: idea, user: create(:user, manual_groups: [@group]))
        create(:reaction, reactable: create(:idea_with_topics, idea_status: @idea_status))
      end

      let(:start_at) { now.beginning_of_month }
      let(:end_at) { now.end_of_month }
      let(:group) { @group.id }

      example_request 'Reactions by topic filtered by group' do
        assert_status 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet[0].cells.map(&:value)).to match %w[topic topic_id reactions]

        amount_col = worksheet.map { |col| col.cells[2].value }
        _header, *amounts = amount_col
        expect(amounts.sum).to eq 2
      end
    end
  end

  get 'web_api/v1/stats/reactions_by_project' do
    time_boundary_parameters self
    topic_filter_parameter self
    group_filter_parameter self

    describe 'with time filtering only' do
      let(:start_at) { now.beginning_of_month }
      let(:end_at) { now.end_of_month }

      let!(:project1) { create(:project) }
      let!(:project2) { create(:project) }
      let!(:idea1) { create(:idea, idea_status: @idea_status, project: project1) }
      let!(:idea2) { create(:idea, idea_status: @idea_status, project: project1) }
      let!(:idea3) { create(:idea, idea_status: @idea_status, project: project2) }
      let!(:idea4) { create(:idea, idea_status: @idea_status) }
      let!(:reaction1) { create(:reaction, reactable: idea1) }
      let!(:reaction2) { create(:reaction, reactable: idea1, mode: 'down') }
      let!(:reaction3) { create(:reaction, reactable: idea2) }
      let!(:reaction4) { create(:reaction, reactable: idea3) }

      example_request 'Reactions by project' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :type)).to eq 'reactions_by_project'
        json_attributes = json_response.dig(:data, :attributes)
        expect(json_attributes[:series][:total].stringify_keys).to match({
          project1.id => 3,
          project2.id => 1
        })
        expect(json_attributes[:projects].keys.map(&:to_s)).to match_array [project1.id, project2.id]
      end
    end

    describe 'filtered by topic' do
      before do
        @topic = create(:topic)
        project = create(:project, allowed_input_topics: [@topic])
        idea1 = create(:idea, idea_status: @idea_status, topics: [@topic], project: project)
        idea2 = create(:idea_with_topics, idea_status: @idea_status)
        create(:reaction, reactable: idea1)
        create(:reaction, reactable: idea2)
      end

      let(:start_at) { now.beginning_of_month }
      let(:end_at) { now.end_of_month }
      let(:topic) { @topic.id }

      example_request 'Reactions by project filtered by topic' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :type)).to eq 'reactions_by_project'
        json_attributes = json_response.dig(:data, :attributes)
        expect(json_attributes[:series][:total].values.sum).to eq 1
      end
    end

    describe 'filtered by group' do
      before do
        @group = create(:group)
        project = create(:project)
        idea = create(:idea, idea_status: @idea_status, project: project)
        create(:reaction, reactable: idea, user: create(:user, manual_groups: [@group]))
        create(:reaction, reactable: idea)
      end

      let(:start_at) { now.beginning_of_month }
      let(:end_at) { now.end_of_month }
      let(:group) { @group.id }

      example_request 'Reactions by project filtered by group' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :type)).to eq 'reactions_by_project'
        json_attributes = json_response.dig(:data, :attributes)
        expect(json_attributes[:series][:total].values.sum).to eq 1
      end
    end
  end

  get 'web_api/v1/stats/reactions_by_project_as_xlsx' do
    time_boundary_parameters self
    topic_filter_parameter self
    group_filter_parameter self

    describe 'with time filtering only' do
      let(:start_at) { now.beginning_of_month }
      let(:end_at) { now.end_of_month }

      let!(:project1) { create(:project) }
      let!(:project2) { create(:project) }
      let!(:idea1) { create(:idea, idea_status: @idea_status, project: project1) }
      let!(:idea2) { create(:idea, idea_status: @idea_status, project: project1) }
      let!(:idea3) { create(:idea, idea_status: @idea_status, project: project2) }
      let!(:idea4) { create(:idea, idea_status: @idea_status) }
      let!(:reaction1) { create(:reaction, reactable: idea1) }
      let!(:reaction2) { create(:reaction, reactable: idea1, mode: 'down') }
      let!(:reaction3) { create(:reaction, reactable: idea2) }
      let!(:reaction4) { create(:reaction, reactable: idea3) }

      example_request 'Reactions by project' do
        assert_status 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet[0].cells.map(&:value)).to match %w[project project_id reactions]

        project_ids_col = worksheet.map { |col| col.cells[1].value }
        _header, *project_ids = project_ids_col
        expect(project_ids).to match_array [project1.id, project2.id]

        amount_col = worksheet.map { |col| col.cells[2].value }
        _header, *amounts = amount_col
        expect(amounts).to match_array [3, 1]
      end
    end

    describe 'filtered by topic' do
      before do
        @topic = create(:topic)
        project = create(:project, allowed_input_topics: [@topic])
        idea1 = create(:idea, idea_status: @idea_status, topics: [@topic], project: project)
        idea2 = create(:idea_with_topics, idea_status: @idea_status)
        create(:reaction, reactable: idea1)
        create(:reaction, reactable: idea2)
      end

      let(:start_at) { now.beginning_of_month }
      let(:end_at) { now.end_of_month }
      let(:topic) { @topic.id }

      example_request 'Reactions by project filtered by topic' do
        assert_status 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet[0].cells.map(&:value)).to match %w[project project_id reactions]

        amount_col = worksheet.map { |col| col.cells[2].value }
        _header, *amounts = amount_col
        expect(amounts.sum).to eq 1
      end
    end

    describe 'filtered by group' do
      before do
        @group = create(:group)
        project = create(:project)
        idea = create(:idea, idea_status: @idea_status, project: project)
        create(:reaction, reactable: idea, user: create(:user, manual_groups: [@group]))
        create(:reaction, reactable: idea)
      end

      let(:start_at) { now.beginning_of_month }
      let(:end_at) { now.end_of_month }
      let(:group) { @group.id }

      example_request 'Reactions by project filtered by group' do
        assert_status 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet[0].cells.map(&:value)).to match %w[project project_id reactions]

        amount_col = worksheet.map { |col| col.cells[2].value }
        _header, *amounts = amount_col
        expect(amounts.sum).to eq 1
      end
    end
  end
end
