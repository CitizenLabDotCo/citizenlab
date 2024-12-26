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
  s.parameter :topic, 'Topic ID. Only count comments on ideas that have the given topic assigned', required: false
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
    AppConfiguration.instance.update!(created_at: now - 3.months)
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
        initiative = create(:initiative)
        create(:comment, idea: initiative)
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
            @topic1 = create(:topic)
            @topic2 = create(:topic)
            @topic3 = create(:topic)
            project = create(:project, allowed_input_topics: [@topic1, @topic2, @topic3])
            idea1 = create(:idea, topics: [@topic1], project: project)
            idea2 = create(:idea, topics: [@topic2], project: project)
            idea3 = create(:idea, topics: [@topic1, @topic2], project: project)
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
            @topic1.id => 3,
            @topic2.id => 2
          })
          expect(json_attributes[:topics].keys.map(&:to_s)).to match_array [@topic1.id, @topic2.id, @topic3.id]
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
            @topic1 = create(:topic)
            @topic2 = create(:topic)
            topic3 = create(:topic)
            project = create(:project, allowed_input_topics: [@topic1, @topic2, topic3])
            idea1 = create(:idea, topics: [@topic1], project: project)
            idea2 = create(:idea, topics: [@topic2], project: project)
            idea3 = create(:idea, topics: [@topic1, @topic2], project: project)
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
          expect(topic_ids).to match_array [@topic1.id, @topic2.id]

          amount_col = worksheet.map { |col| col.cells[2].value }
          _header, *amounts = amount_col
          expect(amounts).to match_array [3, 2]
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
          expect(json_attributes[:projects].keys.map(&:to_s)).to match_array [@project1.id, @project2.id]
        end
      end

      describe 'filtered by topic' do
        let(:topic) { @topic.id }
        let(:start_at) { timezone.at(now - 1.month).beginning_of_month }
        let(:end_at) { timezone.at(now - 1.month).end_of_month }

        before do
          travel_to start_at + 17.days do
            @topic = create(:topic)
            project = create(:project, allowed_input_topics: [@topic])
            idea1 = create(:idea, topics: [@topic], project: project)
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
          expect(project_ids).to match_array [@project1.id, @project2.id]

          project_name_col = worksheet.map { |col| col.cells[0].value }
          _header, *project_names = project_name_col
          expect(project_names).to match_array [multiloc_service.t(@project1.title_multiloc), multiloc_service.t(@project2.title_multiloc)]

          comment_col = worksheet.map { |col| col.cells[2].value }
          _header, *comments = comment_col
          expect(comments).to match_array [3, 1]
        end
      end

      describe 'filtered by topic' do
        let(:topic) { @topic.id }
        let(:start_at) { timezone.at(now - 1.month).beginning_of_month }
        let(:end_at) { timezone.at(now - 1.month).end_of_month }

        before do
          travel_to start_at + 17.days do
            @topic = create(:topic)
            project = create(:project, allowed_input_topics: [@topic])
            idea1 = create(:idea, topics: [@topic], project: project)
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
