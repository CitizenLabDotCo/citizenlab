# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

multiloc_service = MultilocService.new

def time_boundary_parameters(s)
  s.parameter :start_at, 'Date defining from where results should start', required: false
  s.parameter :end_at, 'Date defining till when results should go', required: false
end

def time_series_parameters(s)
  time_boundary_parameters s
  s.parameter :interval, 'Either day, week, month, year', required: true
end

def project_filter_parameter(s)
  s.parameter :project, 'Project ID. Only count ideas that are in the given project', required: false
end

def group_filter_parameter(s)
  s.parameter :group, 'Group ID. Only count ideas posted by users in the given group', required: false
end

def topic_filter_parameter(s)
  s.parameter :input_topic, 'Input topic ID. Only count ideas that have the given input topic assigned', required: false
end

def feedback_needed_filter_parameter(s)
  s.parameter :feedback_needed, 'Only count ideas that need feedback', required: false
end

resource 'Stats - Ideas' do
  explanation 'The various stats endpoints can be used to show certain properties of ideas.'
  header 'Content-Type', 'application/json'

  let_it_be(:now) { AppConfiguration.timezone.now }
  let_it_be(:start_at) { (now - 1.year).beginning_of_year }
  let_it_be(:end_at) { (now - 1.year).end_of_year }

  before { admin_header_token }

  before_all do
    AppConfiguration.instance.update!(created_at: now - 3.years, platform_start_at: now - 3.years)

    @project1 = create(:single_phase_ideation_project)
    @project2 = create(:single_phase_proposals_project)
    @proposed = create(:idea_status, code: 'proposed')
    @ideas_with_topics = []
    @ideas_with_status = []

    travel_to(start_at - 1.month) do
      i = create(:proposal, project: @project2, idea_status: @proposed)
      create(:official_feedback, idea: i)
    end
    travel_to(start_at + 2.months) do
      @ideas_with_topics += create_list(:idea_with_topics, 2, project: @project1, idea_status: @proposed)
    end
    travel_to(start_at + 5.months) do
      @ideas_with_topics += create_list(:idea_with_topics, 3, project: @project1, idea_status: @proposed)
      create(:proposal, project: @project2, idea_status: @proposed)
    end

    native_survey_project = create(:single_phase_native_survey_project)
    create(:idea, project: native_survey_project, creation_phase: native_survey_project.phases.first)
  end

  get 'web_api/v1/stats/ideas_count' do
    time_boundary_parameters self
    project_filter_parameter self
    group_filter_parameter self
    topic_filter_parameter self
    feedback_needed_filter_parameter self

    # Remove time-boundary query parameters
    let(:start_at) { nil }
    let(:end_at) { nil }

    example_request 'Count all public inputs (default behaviour)' do
      assert_status 200
      json_response = json_parse response_body
      expect(json_response.dig(:data, :type)).to eq 'ideas_count'
      expect(json_response.dig(:data, :attributes, :count)).to eq 7
    end

    describe 'with feedback_needed filter' do
      let(:feedback_needed) { true }

      example_request 'Count all ideas that need feedback' do
        assert_status 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :type)).to eq 'ideas_count'
        expect(json_response.dig(:data, :attributes, :count)).to eq 6
      end

      example 'Count all ideas that need feedback for a specific assignee' do
        assignee = create(:admin)
        create(:idea, idea_status: @proposed, assignee: assignee)
        do_request assignee: assignee.id

        assert_status 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :type)).to eq 'ideas_count'
        expect(json_response.dig(:data, :attributes, :count)).to eq 1
      end

      example 'Count is not limited by pagination' do
        do_request(page: { size: 2, number: 1 })

        assert_status 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :type)).to eq 'ideas_count'
        expect(json_response.dig(:data, :attributes, :count)).to eq 6
      end
    end
  end

  get 'web_api/v1/stats/ideas_by_topic' do
    time_boundary_parameters self
    project_filter_parameter self
    group_filter_parameter self
    feedback_needed_filter_parameter self
    parameter :limit, 'Limit the number of topics returned to the given number, ordered by idea count descending', required: false

    describe 'with time filters only' do
      example_request 'Ideas by topic' do
        assert_status 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :type)).to eq 'ideas_by_topic'
        json_attributes = json_response.dig(:data, :attributes)
        expected_topics = @ideas_with_topics.flat_map { |i| i.ideas_input_topics.map(&:input_topic_id) }.uniq
        expect(json_attributes[:series][:ideas].keys.map(&:to_s).uniq - expected_topics).to eq []
        expect(json_attributes[:series][:ideas].values.map(&:class).uniq).to eq [Integer]
      end
    end

    describe 'with project filter' do
      let(:project) { @project.id }

      before do
        @project = create(:single_phase_ideation_project)
        input_topic = create(:input_topic, project: @project)
        travel_to start_at + 2.months do
          create(:idea, project: @project, input_topics: [input_topic])
          create(:idea)
        end
      end

      example_request 'Ideas by topic filtered by project' do
        assert_status 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :type)).to eq 'ideas_by_topic'
        expect(json_response.dig(:data, :attributes, :series, :ideas).values.sum).to eq 1
      end
    end

    describe 'with group filter' do
      let(:group) { @group.id }

      before do
        travel_to start_at + 2.months do
          @group = create(:group)
          create(:idea_with_topics, topics_count: 2, author: create(:user, manual_groups: [@group]))
        end
      end

      example_request 'Ideas by topic filtered by group' do
        assert_status 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :type)).to eq 'ideas_by_topic'
        expect(json_response.dig(:data, :attributes, :series, :ideas).values.sum).to eq 2
      end
    end

    describe 'with limit' do
      let(:limit) { 2 }

      before do
        travel_to(start_at + 2.months) do
          create(:idea, input_topics: @ideas_with_topics.first.input_topics.take(1))
        end
      end

      example_request 'Ideas by topic with a limit' do
        assert_status 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :type)).to eq 'ideas_by_topic'
        json_attributes = json_response.dig(:data, :attributes)
        expect(json_attributes[:series][:ideas].length).to eq 2
        # Expect descending values
        expect(json_attributes[:series][:ideas].values).to eq json_attributes[:series][:ideas].values.sort.reverse
      end
    end

    describe 'with subtopics' do
      before do
        travel_to start_at + 2.months do
          @project = create(:project)
          @parent_topic = create(:input_topic, project: @project)
          @child_topic = create(:input_topic, project: @project, parent: @parent_topic)
          create(:idea, project: @project, input_topics: [@parent_topic])
          create(:idea, project: @project, input_topics: [@child_topic])
        end
      end

      example 'Ideas by topic aggregates child counts into parent' do
        do_request
        assert_status 200
        json_attributes = json_parse(response_body).dig(:data, :attributes)
        # Parent should include its own count (1) + child count (1) = 2
        expect(json_attributes[:series][:ideas][@parent_topic.id.to_sym]).to eq 2
        expect(json_attributes[:series][:ideas][@child_topic.id.to_sym]).to eq 1
      end
    end
  end

  get 'web_api/v1/stats/ideas_by_topic_as_xlsx' do
    time_boundary_parameters self
    project_filter_parameter self
    group_filter_parameter self
    feedback_needed_filter_parameter self

    describe 'with project filter' do
      let(:project) { @project.id }

      before do
        @project = create(:single_phase_ideation_project)
        input_topic = create(:input_topic, project: @project)
        travel_to start_at + 2.months do
          create(:idea, project: @project, input_topics: [input_topic])
          create(:idea)
        end
      end

      example_request 'Ideas by topic filtered by project' do
        assert_status 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet[0].cells.map(&:value)).to match %w[topic topic_id ideas]
        amount_col = worksheet.map { |col| col.cells[2].value }
        _header, *amounts = amount_col
        expect(amounts.sum).to eq 1
      end
    end

    describe 'with group filter' do
      let(:group) { @group.id }

      before do
        travel_to start_at + 2.months do
          @group = create(:group)
          create(:idea_with_topics, topics_count: 2, author: create(:user, manual_groups: [@group]))
        end
      end

      example_request 'Ideas by topic filtered by group' do
        assert_status 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet[0].cells.map(&:value)).to match %w[topic topic_id ideas]
        amount_col = worksheet.map { |col| col.cells[2].value }
        _header, *amounts = amount_col
        expect(amounts.sum).to eq 2
      end
    end
  end

  get 'web_api/v1/stats/ideas_by_project' do
    time_boundary_parameters self
    topic_filter_parameter self
    group_filter_parameter self
    feedback_needed_filter_parameter self

    describe 'with time filters only' do
      example_request 'Ideas by project' do
        assert_status 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :type)).to eq 'ideas_by_project'
        json_attributes = json_response.dig(:data, :attributes)
        expect(json_attributes[:series][:ideas].stringify_keys).to match({
          @project1.id => 5,
          @project2.id => 1
        })
        expect(json_attributes[:projects].keys.map(&:to_s)).to contain_exactly(@project1.id, @project2.id)
      end
    end

    describe 'with topic filter' do
      let(:input_topic) { @topic.id }

      before do
        travel_to start_at + 4.months do
          idea = create(:idea_with_topics)
          create(:idea)
          @topic = idea.input_topics.first
        end
      end

      example_request 'Ideas by project filtered by topic' do
        assert_status 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :type)).to eq 'ideas_by_project'
        expect(json_response.dig(:data, :attributes, :series, :ideas).values.sum).to eq 1
      end
    end

    describe 'with group filter' do
      let(:group) { @group.id }

      before do
        travel_to start_at + 8.months do
          @group = create(:group)
          user = create(:user, manual_groups: [@group])
          create(:idea, author: user)
          create(:idea)
        end
      end

      example_request 'Ideas by project filtered by group' do
        assert_status 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :type)).to eq 'ideas_by_project'
        expect(json_response.dig(:data, :attributes, :series, :ideas).values.sum).to eq 1
      end
    end
  end

  get 'web_api/v1/stats/ideas_by_project_as_xlsx' do
    time_boundary_parameters self
    topic_filter_parameter self
    group_filter_parameter self
    feedback_needed_filter_parameter self

    describe 'with time filters only' do
      example_request 'Ideas by project' do
        assert_status 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet[0].cells.map(&:value)).to match %w[project project_id ideas]
        project_col = worksheet.map { |col| col.cells[1].value }
        _header, *projects = project_col
        expect(projects).to contain_exactly(@project1.id, @project2.id)

        project_name_col = worksheet.map { |col| col.cells[0].value }
        _header, *project_names = project_name_col
        expect(project_names).to contain_exactly(multiloc_service.t(@project1.title_multiloc), multiloc_service.t(@project2.title_multiloc))

        idea_col = worksheet.map { |col| col.cells[2].value }
        _header, *ideas = idea_col
        expect(ideas).to contain_exactly(5, 1)
      end
    end

    describe 'with topic filter' do
      let(:input_topic) { @topic.id }

      before do
        travel_to start_at + 4.months do
          idea = create(:idea_with_topics)
          create(:idea)
          @topic = idea.input_topics.first
        end
      end

      example_request 'Ideas by project filtered by topic' do
        assert_status 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet[0].cells.map(&:value)).to match %w[project project_id ideas]
        idea_col = worksheet.map { |col| col.cells[2].value }
        _header, *ideas = idea_col
        expect(ideas.sum).to eq 1
      end
    end

    describe 'with group filter' do
      let(:group) { @group.id }

      before do
        travel_to start_at + 8.months do
          @group = create(:group)
          user = create(:user, manual_groups: [@group])
          create(:idea, author: user)
          create(:idea)
        end
      end

      example_request 'Ideas by project filtered by group' do
        assert_status 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet[0].cells.map(&:value)).to match %w[project project_id ideas]
        idea_col = worksheet.map { |col| col.cells[2].value }
        _header, *ideas = idea_col
        expect(ideas.sum).to eq 1
      end
    end
  end
end
