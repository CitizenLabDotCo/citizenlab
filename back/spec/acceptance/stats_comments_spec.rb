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
  s.parameter :project, 'Project ID. Only count comments on ideas in the given project', required: false
end

def group_filter_parameter(s)
  s.parameter :group, 'Group ID. Only count comments posted by users in the given group', required: false
end

def topic_filter_parameter(s)
  s.parameter :input_topic, 'Topic ID. Only count comments on ideas that have the given topic assigned', required: false
end

resource 'Stats - Comments' do
  before { header 'Content-Type', 'application/json' }

  let(:json_response) { json_parse(response_body) }

  shared_examples 'unauthorized requests' do
    context 'when visitor' do
      example 'unauthorized', document: false do
        do_request
        expect(status).to eq(401)
      end
    end

    context 'when resident' do
      before { resident_header_token }

      example 'unauthorized', document: false do
        do_request
        expect(status).to eq(401)
      end
    end
  end

  explanation 'The various stats endpoints can be used to show certain properties of comments.'

  let(:timezone) { AppConfiguration.timezone }
  let!(:now) { timezone.now }

  before do
    AppConfiguration.instance.update!(created_at: now - 3.months, platform_start_at: now - 3.months)
    create(:comment, publication_status: 'deleted')
  end

  get 'web_api/v1/stats/comments_count' do
    before do
      travel_to(timezone.at(now - 1.month).beginning_of_month - 1.day) do
        create_list(:comment, 2)
      end

      travel_to(timezone.at(now - 5.months).beginning_of_month + 1.day) do
        create(:comment)
      end
    end

    time_boundary_parameters self

    context 'when admin' do
      before { admin_header_token }

      example_request 'Count all comments' do
        assert_status 200
        expect(json_response.dig(:data, :attributes, :count)).to eq 2
      end
    end

    context 'as a moderator' do
      before do
        header_token_for create(:project_moderator)
        create(:comment, idea: create(:idea, project: create(:private_admins_project)))
      end

      example 'Count all comments (as a moderator)', document: false do
        do_request
        assert_status 200
        expect(json_response.dig(:data, :attributes, :count)).to eq 2
      end
    end

    include_examples 'unauthorized requests'
  end

  get 'web_api/v1/stats/comments_by_topic' do
    time_boundary_parameters self
    project_filter_parameter self
    group_filter_parameter self
    parameter :limit, 'Limit the number of topics returned to the given number, ordered by comment count descending', required: false

    context 'when admin' do
      before { admin_header_token }

      describe 'without time filters' do
        example 'Comments by topic', document: false do
          do_request
          assert_status 200
        end
      end

      describe 'with time filtering only' do
        let(:start_at) { timezone.at(now - 1.month).beginning_of_month }
        let(:end_at) { timezone.at(now - 1.month).end_of_month }

        before do
          travel_to start_at + 1.day do
            project = create(:project)
            @input_topic1 = create(:input_topic, project: project)
            @input_topic2 = create(:input_topic, project: project)
            @input_topic3 = create(:input_topic, project: project)
            idea1 = create(:idea, input_topics: [@input_topic1], project: project)
            idea2 = create(:idea, input_topics: [@input_topic2], project: project)
            idea3 = create(:idea, input_topics: [@input_topic1, @input_topic2], project: project)
            create(:idea)
            create(:comment, idea: idea1)
            create(:comment, idea: idea1)
            create(:comment, idea: idea2)
            create(:comment, idea: idea3)
          end
          create(:comment)
        end

        example_request 'Comments by topic' do
          assert_status 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :type)).to eq 'comments_by_topic'
          json_attributes = json_response.dig(:data, :attributes)
          expect(json_attributes[:series][:comments].stringify_keys).to match({
            @input_topic1.id => 3,
            @input_topic2.id => 2
          })
          expect(json_attributes[:topics].keys.map(&:to_s)).to contain_exactly(@input_topic1.id, @input_topic2.id)
        end
      end

      describe 'filtered by project' do
        before do
          travel_to start_at + 5.days do
            @project = create(:project)
            idea = create(:idea_with_topics, topics_count: 2, project: @project)
            create(:comment, idea: idea)
            create(:comment, idea: create(:idea_with_topics))
          end
        end

        let(:start_at) { timezone.at(now - 1.month).beginning_of_month }

        let(:end_at) { timezone.at(now - 1.month).end_of_month }
        let(:project) { @project.id }

        example_request 'Comments by topic filtered by project' do
          assert_status 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :type)).to eq 'comments_by_topic'
          json_attributes = json_response.dig(:data, :attributes)
          expect(json_attributes[:series][:comments].values.sum).to eq 2
        end
      end

      describe 'filtered by group' do
        let(:group) { @group.id }
        let(:start_at) { timezone.at(now - 1.month).beginning_of_month }
        let(:end_at) { timezone.at(now - 1.month).end_of_month }

        before do
          travel_to start_at + 3.days do
            @group = create(:group)
            idea = create(:idea_with_topics, topics_count: 2)
            create(:comment, idea: idea, author: create(:user, manual_groups: [@group]))
            create(:comment, idea: create(:idea_with_topics))
          end
        end

        example_request 'Comments by topic filtered by group' do
          assert_status 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :type)).to eq 'comments_by_topic'
          json_attributes = json_response.dig(:data, :attributes)
          expect(json_attributes[:series][:comments].values.sum).to eq 2
        end
      end

      describe 'with limit' do
        let(:start_at) { timezone.at(now - 1.month).beginning_of_month }
        let(:end_at) { timezone.at(now - 1.month).end_of_month }
        let(:limit) { 2 }

        before do
          travel_to start_at + 5.days do
            project = create(:project)
            @input_topic1 = create(:input_topic, project: project)
            @input_topic2 = create(:input_topic, project: project)
            @input_topic3 = create(:input_topic, project: project)
            idea1 = create(:idea, input_topics: [@input_topic1], project: project)
            idea2 = create(:idea, input_topics: [@input_topic2], project: project)
            idea3 = create(:idea, input_topics: [@input_topic3], project: project)
            create_list(:comment, 3, idea: idea1)
            create_list(:comment, 2, idea: idea2)
            create(:comment, idea: idea3)
          end
        end

        example_request 'Comments by topic with a limit' do
          assert_status 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :type)).to eq 'comments_by_topic'
          json_attributes = json_response.dig(:data, :attributes)
          expect(json_attributes[:series][:comments].length).to eq 2
          # Expect descending values
          expect(json_attributes[:series][:comments].values).to eq json_attributes[:series][:comments].values.sort.reverse
        end
      end

      describe 'with subtopics' do
        let(:start_at) { timezone.at(now - 1.month).beginning_of_month }
        let(:end_at) { timezone.at(now - 1.month).end_of_month }

        before do
          travel_to start_at + 5.days do
            project = create(:project)
            @parent_topic = create(:input_topic, project: project)
            @child_topic = create(:input_topic, project: project, parent: @parent_topic)
            idea_parent = create(:idea, input_topics: [@parent_topic], project: project)
            idea_child = create(:idea, input_topics: [@child_topic], project: project)
            create(:comment, idea: idea_parent)
            create(:comment, idea: idea_child)
          end
        end

        example 'Comments by topic aggregates child counts into parent' do
          do_request
          assert_status 200
          json_attributes = json_response.dig(:data, :attributes)
          expect(json_attributes[:series][:comments][@parent_topic.id.to_sym]).to eq 2
          expect(json_attributes[:series][:comments][@child_topic.id.to_sym]).to eq 1
        end
      end
    end

    include_examples 'unauthorized requests'
  end

  get 'web_api/v1/stats/comments_by_topic_as_xlsx' do
    time_boundary_parameters self
    project_filter_parameter self
    group_filter_parameter self

    context 'when admin' do
      before { admin_header_token }

      describe 'without time filters' do
        example 'Comments by topic', document: false do
          do_request
          assert_status 200
        end
      end

      describe 'with time filtering only' do
        let(:start_at) { timezone.at(now - 1.month).beginning_of_month }
        let(:end_at) { timezone.at(now - 1.month).end_of_month }

        before do
          travel_to start_at + 1.day do
            project = create(:project)
            @input_topic1 = create(:input_topic, project: project)
            @input_topic2 = create(:input_topic, project: project)
            _input_topic3 = create(:input_topic, project: project)
            idea1 = create(:idea, input_topics: [@input_topic1], project: project)
            idea2 = create(:idea, input_topics: [@input_topic2], project: project)
            idea3 = create(:idea, input_topics: [@input_topic1, @input_topic2], project: project)
            create(:idea)
            create(:comment, idea: idea1)
            create(:comment, idea: idea1)
            create(:comment, idea: idea2)
            create(:comment, idea: idea3)
          end
          create(:comment)
        end

        example_request 'Comments by topic' do
          assert_status 200
          worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
          expect(worksheet[0].cells.map(&:value)).to match %w[topic topic_id comments]

          topic_ids_col = worksheet.map { |col| col.cells[1].value }
          _header, *topic_ids = topic_ids_col
          expect(topic_ids).to contain_exactly(@input_topic1.id, @input_topic2.id)

          amount_col = worksheet.map { |col| col.cells[2].value }
          _header, *amounts = amount_col
          expect(amounts).to contain_exactly(3, 2)
        end
      end

      describe 'filtered by project' do
        before do
          travel_to start_at + 5.days do
            @project = create(:project)
            idea = create(:idea_with_topics, topics_count: 2, project: @project)
            create(:comment, idea: idea)
            create(:comment, idea: create(:idea_with_topics))
          end
        end

        let(:start_at) { timezone.at(now - 1.month).beginning_of_month }
        let(:end_at) { timezone.at(now - 1.month).end_of_month }
        let(:project) { @project.id }

        example_request 'Comments by topic filtered by project' do
          assert_status 200
          worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
          expect(worksheet[0].cells.map(&:value)).to match %w[topic topic_id comments]

          amount_col = worksheet.map { |col| col.cells[2].value }
          _header, *amounts = amount_col
          expect(amounts.sum).to eq 2
        end
      end

      describe 'filtered by group' do
        let(:group) { @group.id }
        let(:start_at) { timezone.at(now - 1.month).beginning_of_month }
        let(:end_at) { timezone.at(now - 1.month).end_of_month }

        before do
          travel_to start_at + 3.days do
            @group = create(:group)
            idea = create(:idea_with_topics, topics_count: 2)
            create(:comment, idea: idea, author: create(:user, manual_groups: [@group]))
            create(:comment, idea: create(:idea_with_topics))
          end
        end

        example_request 'Comments by topic filtered by group' do
          assert_status 200
          worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
          expect(worksheet[0].cells.map(&:value)).to match %w[topic topic_id comments]

          amount_col = worksheet.map { |col| col.cells[2].value }
          _header, *amounts = amount_col
          expect(amounts.sum).to eq 2
        end
      end
    end

    include_examples 'unauthorized requests'
  end

  get 'web_api/v1/stats/comments_by_project' do
    time_boundary_parameters self
    topic_filter_parameter self
    group_filter_parameter self

    context 'when admin' do
      before { admin_header_token }

      describe 'with time filtering only' do
        let(:start_at) { timezone.at(now - 1.month).beginning_of_month }
        let(:end_at) { timezone.at(now - 1.month).end_of_month }

        before do
          travel_to start_at + 14.days do
            @project1 = create(:project)
            @project2 = create(:project)
            idea1 = create(:idea, project: @project1)
            idea2 = create(:idea, project: @project1)
            idea3 = create(:idea, project: @project2)
            create(:idea)
            create(:comment, idea: idea1)
            create(:comment, idea: idea1)
            create(:comment, idea: idea2)
            create(:comment, idea: idea3)
          end
        end

        example_request 'Comments by project' do
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :type)).to eq 'comments_by_project'
          json_attributes = json_response.dig(:data, :attributes)
          expect(json_attributes[:series][:comments].stringify_keys).to match({
            @project1.id => 3,
            @project2.id => 1
          })
          expect(json_attributes[:projects].keys.map(&:to_s)).to contain_exactly(@project1.id, @project2.id)
        end
      end

      describe 'filtered by topic' do
        let(:input_topic) { @input_topic.id }
        let(:start_at) { timezone.at(now - 1.month).beginning_of_month }
        let(:end_at) { timezone.at(now - 1.month).end_of_month }

        before do
          travel_to start_at + 17.days do
            project = create(:project)
            @input_topic = create(:input_topic, project: project)
            idea1 = create(:idea, input_topics: [@input_topic], project: project)
            idea2 = create(:idea_with_topics)
            create(:comment, idea: idea1)
            create(:comment, idea: idea2)
          end
        end

        example_request 'Comments by project filtered by topic' do
          assert_status 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :type)).to eq 'comments_by_project'
          json_attributes = json_response.dig(:data, :attributes)
          expect(json_attributes[:series][:comments].values.sum).to eq 1
        end
      end

      describe 'filtered by parent topic includes child topic ideas' do
        let(:start_at) { timezone.at(now - 1.month).beginning_of_month }
        let(:input_topic) { @parent_topic.id }
        let(:end_at) { timezone.at(now - 1.month).end_of_month }

        before do
          travel_to start_at + 17.days do
            project = create(:project)
            @parent_topic = create(:input_topic, project: project)
            @child_topic = create(:input_topic, project: project, parent: @parent_topic)
            idea_child = create(:idea, input_topics: [@child_topic], project: project)
            create(:comment, idea: idea_child)
          end
        end

        example 'Comments by project filtered by parent topic includes child topic ideas' do
          do_request
          assert_status 200
          json_attributes = json_response.dig(:data, :attributes)
          expect(json_attributes[:series][:comments].values.sum).to eq 1
        end
      end

      describe 'filtered by group' do
        let(:group) { @group.id }
        let(:start_at) { timezone.at(now - 1.month).beginning_of_month }
        let(:end_at) { timezone.at(now - 1.month).end_of_month }

        before do
          travel_to start_at + 12.days do
            @group = create(:group)
            project = create(:project)
            idea = create(:idea, project: project)
            create(:comment, idea: idea, author: create(:user, manual_groups: [@group]))
            create(:comment, idea: idea)
          end
        end

        example_request 'Comments by project filtered by group' do
          assert_status 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :type)).to eq 'comments_by_project'
          json_attributes = json_response.dig(:data, :attributes)
          expect(json_attributes[:series][:comments].values.sum).to eq 1
        end
      end
    end

    include_examples 'unauthorized requests'
  end

  get 'web_api/v1/stats/comments_by_project_as_xlsx' do
    time_boundary_parameters self
    topic_filter_parameter self
    group_filter_parameter self

    context 'when admin' do
      before { admin_header_token }

      describe 'with time filtering only' do
        let(:start_at) { timezone.at(now - 1.month).beginning_of_month }
        let(:end_at) { timezone.at(now - 1.month).end_of_month }

        before do
          travel_to start_at + 14.days do
            @project1 = create(:project)
            @project2 = create(:project)
            idea1 = create(:idea, project: @project1)
            idea2 = create(:idea, project: @project1)
            idea3 = create(:idea, project: @project2)
            create(:idea)
            create(:comment, idea: idea1)
            create(:comment, idea: idea1)
            create(:comment, idea: idea2)
            create(:comment, idea: idea3)
          end
        end

        example_request 'Comments by project' do
          assert_status 200
          worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
          expect(worksheet[0].cells.map(&:value)).to match %w[project project_id comments]
          project_id_col = worksheet.map { |col| col.cells[1].value }
          _header, *project_ids = project_id_col
          expect(project_ids).to contain_exactly(@project1.id, @project2.id)

          project_name_col = worksheet.map { |col| col.cells[0].value }
          _header, *project_names = project_name_col
          expect(project_names).to contain_exactly(multiloc_service.t(@project1.title_multiloc), multiloc_service.t(@project2.title_multiloc))

          comment_col = worksheet.map { |col| col.cells[2].value }
          _header, *comments = comment_col
          expect(comments).to contain_exactly(3, 1)
        end
      end

      describe 'filtered by topic' do
        let(:input_topic) { @input_topic.id }
        let(:start_at) { timezone.at(now - 1.month).beginning_of_month }
        let(:end_at) { timezone.at(now - 1.month).end_of_month }

        before do
          travel_to start_at + 17.days do
            project = create(:project)
            @input_topic = create(:input_topic, project: project)
            idea1 = create(:idea, input_topics: [@input_topic], project: project)
            idea2 = create(:idea_with_topics)
            create(:comment, idea: idea1)
            create(:comment, idea: idea2)
          end
        end

        example_request 'Comments by project filtered by topic' do
          assert_status 200
          worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
          expect(worksheet[0].cells.map(&:value)).to match %w[project project_id comments]

          amount_col = worksheet.map { |col| col.cells[2].value }
          _header, *amounts = amount_col
          expect(amounts.sum).to eq 1
        end
      end

      describe 'filtered by group' do
        let(:group) { @group.id }
        let(:start_at) { timezone.at(now - 1.month).beginning_of_month }
        let(:end_at) { timezone.at(now - 1.month).end_of_month }

        before do
          travel_to start_at + 12.days do
            @group = create(:group)
            project = create(:project)
            idea = create(:idea, project: project)
            create(:comment, idea: idea, author: create(:user, manual_groups: [@group]))
            create(:comment, idea: idea)
          end
        end

        example_request 'Comments by project filtered by group' do
          assert_status 200
          worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
          expect(worksheet[0].cells.map(&:value)).to match %w[project project_id comments]

          amount_col = worksheet.map { |col| col.cells[2].value }
          _header, *amounts = amount_col
          expect(amounts.sum).to eq 1
        end
      end
    end

    include_examples 'unauthorized requests'
  end
end
