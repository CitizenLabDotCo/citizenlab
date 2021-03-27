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

def project_filter_parameter s
  s.parameter :project, "Project ID. Only count comments on ideas in the given project", required: false
end

def group_filter_parameter s
  s.parameter :group, "Group ID. Only count comments posted by users in the given group", required: false
end

def topic_filter_parameter s
  s.parameter :topic, "Topic ID. Only count comments on ideas that have the given topic assigned", required: false
end


resource "Stats - Comments" do

  explanation "The various stats endpoints can be used to show certain properties of comments."

  let!(:now) { Time.now.in_time_zone(@timezone) }

  before do
    @current_user = create(:admin)
    token = Knock::AuthToken.new(payload: @current_user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
    header "Content-Type", "application/json"
    @timezone = AppConfiguration.instance.settings('core','timezone')
    Tenant.current.update!(created_at: now - 3.month)
    create_list(:comment, 2)
    create(:comment, publication_status: 'deleted')
  end


  get "web_api/v1/stats/comments_count" do
    time_boundary_parameters self

    example_request "Count all comments" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response[:count]).to eq Comment.published.count
    end

    context "as a moderator" do
      before do
        token = Knock::AuthToken.new(payload: create(:moderator).to_token_payload).token
        header 'Authorization', "Bearer #{token}"
        initiative = create(:initiative)
        create(:comment, post: initiative)
        create(:comment, post: create(:idea, project: create(:private_admins_project)))
      end
      example_request "Count all comments (as a moderator)", document: false do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:count]).to eq Comment.published.count - 2
      end
    end

    context "as a user" do
      before do
        token = Knock::AuthToken.new(payload: create(:user).to_token_payload).token
        header 'Authorization', "Bearer #{token}"
      end
      example_request "[error] Count all comments (as a user)", document: false do
        expect(response_status).to eq 401
      end
    end
  end

  context "with activity over time" do
    before do
      travel_to((now-1.month).in_time_zone(@timezone).beginning_of_month - 1.day) do
        create(:comment)
      end
      travel_to((now-1.month).in_time_zone(@timezone).beginning_of_month + 1.day) do
        create_list(:comment, 3)
      end

      travel_to((now-1.month).in_time_zone(@timezone).end_of_month - 1.day) do
        create_list(:comment, 2)
      end
      travel_to((now-1.month).in_time_zone(@timezone).end_of_month + 1.day) do
        create(:comment)
      end
    end

    get "web_api/v1/stats/comments_by_time" do
      time_series_parameters self
      project_filter_parameter self
      group_filter_parameter self
      topic_filter_parameter self

      let(:interval) { 'day' }

      describe "with time filter outside of platform lifetime" do
        let(:start_at) { now - 1.year }
        let(:end_at) { now - 1.year + 1.day}

        it "returns no entries" do
          do_request
          expect(response_status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response).to eq({series: {comments: {}}})
        end
      end

      describe "with time filter" do
        let(:start_at) { (now-1.month).in_time_zone(@timezone).beginning_of_month }
        let(:end_at) { (now-1.month).in_time_zone(@timezone).end_of_month }

        example_request "Comments by time" do
          expect(response_status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response[:series][:comments].size).to eq start_at.in_time_zone(@timezone).end_of_month.day
          expect(json_response[:series][:comments].values.inject(&:+)).to eq 5
        end
      end
    end

    get "web_api/v1/stats/comments_by_time_cumulative" do
      time_series_parameters self
      project_filter_parameter self
      group_filter_parameter self
      topic_filter_parameter self

      let(:interval) { 'day' }
      describe "with time filter outside of platform lifetime" do
        let(:start_at) { now - 1.year }
        let(:end_at) { now - 1.year + 1.day}

        it "returns no entries" do
          do_request
          expect(response_status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response).to eq({series: { comments: {} }})
        end
      end

      describe "with time filter" do
        let(:start_at) { (now-1.month).in_time_zone(@timezone).beginning_of_month }
        let(:end_at) { (now-1.month).in_time_zone(@timezone).end_of_month }

        example_request "Comments by time (cumulative)" do
          expect(response_status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response[:series][:comments].size).to eq start_at.in_time_zone(@timezone).end_of_month.day
          expect(json_response[:series][:comments].values.uniq).to eq json_response[:series][:comments].values.uniq.sort
          expect(json_response[:series][:comments].values.last).to eq 6
        end
      end

      context "as a moderator" do
        before do
          token = Knock::AuthToken.new(payload: create(:moderator).to_token_payload).token
          header 'Authorization', "Bearer #{token}"
          initiative = create(:initiative)
          @project = create(:project)
          create(:comment, post: initiative)
          create(:comment, post: create(:idea, project: @project))
        end

        let(:project) { @project.id }

        example_request "Count all comments filtered by project", document: false do
          expect(response_status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response[:series][:comments].values.last).to eq 1
        end
      end
    end

    get "web_api/v1/stats/comments_by_time_as_xlsx" do
      time_series_parameters self
      project_filter_parameter self
      group_filter_parameter self
      topic_filter_parameter self

      let(:interval) { 'day' }

      describe "with time filter" do
        let(:start_at) { (now-1.month).in_time_zone(@timezone).beginning_of_month }
        let(:end_at) { (now-1.month).in_time_zone(@timezone).end_of_month }

        example_request "Comments by time" do
          expect(response_status).to eq 200
          worksheets = RubyXL::Parser.parse_buffer(response_body)
          worksheet = worksheets.worksheets[0]
          expect(worksheet.count).to eq start_at.in_time_zone(@timezone).end_of_month.day + 1
          expect(worksheet[0].cells.map(&:value)).to match ['date', 'amount']
          amount_col = worksheet.map {|col| col.cells[1].value}
          header, *amounts = amount_col
          expect(amounts.inject(&:+)).to eq 5
        end
      end

      describe "with time filter outside of platform lifetime" do
        let(:start_at) { now - 1.year }
        let(:end_at) { now - 1.year + 1.day}

        it "returns no entries" do
          do_request
          expect(response_status).to eq 422
        end
      end
    end

    get "web_api/v1/stats/comments_by_time_cumulative_as_xlsx" do
      time_series_parameters self
      project_filter_parameter self
      group_filter_parameter self
      topic_filter_parameter self

      let(:interval) { 'day' }

      describe "with time filter" do
        let(:start_at) { (now-1.month).in_time_zone(@timezone).beginning_of_month }
        let(:end_at) { (now-1.month).in_time_zone(@timezone).end_of_month }

        example_request "Comments by time (cumulative)" do
          expect(response_status).to eq 200
          worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
          expect(worksheet.count).to eq start_at.in_time_zone(@timezone).end_of_month.day + 1
          # monotonically increasing
          expect(worksheet[0].cells.map(&:value)).to match ['date', 'amount']
          amount_col = worksheet.map {|col| col.cells[1].value}
          header, *amounts = amount_col
          expect(amounts.sort).to eq amounts
          expect(amounts.last).to eq 6
        end
      end

      describe "with time filter outside of platform lifetime" do
        let(:start_at) { now - 1.year }
        let(:end_at) { now - 1.year + 1.day}

        it "returns no entries" do
          do_request
          expect(response_status).to eq 422
        end
      end

      context "as a moderator" do
        before do
          token = Knock::AuthToken.new(payload: create(:moderator).to_token_payload).token
          header 'Authorization', "Bearer #{token}"
          initiative = create(:initiative)
          @project = create(:project)
          create(:comment, post: initiative)
          create(:comment, post: create(:idea, project: @project))
        end

        let(:project) { @project.id }

        example_request "Count all comments filtered by project", document: false do
          expect(response_status).to eq 200
          worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
          expect(worksheet[0].cells.map(&:value)).to match ['date', 'amount']
          amount_col = worksheet.map {|col| col.cells[1].value}
          header, *amounts = amount_col
          expect(amounts.last).to eq 1
        end
      end

    end
  end


  get "web_api/v1/stats/comments_by_topic" do
    time_boundary_parameters self
    project_filter_parameter self
    group_filter_parameter self

    describe "without time filters" do

      example "Comments by topic", document: false do
        do_request
        expect(response_status).to eq 200
      end
    end

    describe "with time filtering only" do
      let(:start_at) { (now-1.month).in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { (now-1.month).in_time_zone(@timezone).end_of_month }

      before do
        travel_to start_at + 1.day do
          @topic1 = create(:topic)
          @topic2 = create(:topic)
          @topic3 = create(:topic)
          project = create(:project, topics: [@topic1, @topic2, @topic3])
          idea1 = create(:idea, topics: [@topic1], project: project)
          idea2 = create(:idea, topics: [@topic2], project: project)
          idea3 = create(:idea, topics: [@topic1, @topic2], project: project)
          idea4 = create(:idea)
          comment1 = create(:comment, post: idea1)
          comment2 = create(:comment, post: idea1)
          comment3 = create(:comment, post: idea2)
          comment4 = create(:comment, post: idea3)
        end
        comment5 = create(:comment)
      end

      example_request "Comments by topic" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:comments].stringify_keys).to match({
          @topic1.id => 3,
          @topic2.id => 2
        })
        expect(json_response[:topics].keys.map(&:to_s)).to match_array [@topic1.id, @topic2.id, @topic3.id]
      end

    end

    describe "filtered by project" do
      before do
        travel_to start_at + 5.day do
          @project = create(:project)
          idea = create(:idea_with_topics, topics_count: 2, project: @project)
          create(:comment, post: idea)
          create(:comment, post: create(:idea_with_topics))
        end
      end

      let(:start_at) { (now-1.month).in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { (now-1.month).in_time_zone(@timezone).end_of_month }
      let(:project) { @project.id }

      example_request "Comments by topic filtered by project" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:comments].values.inject(&:+)).to eq 2
      end
    end

    describe "filtered by group" do
      let(:start_at) { (now-1.month).in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { (now-1.month).in_time_zone(@timezone).end_of_month }

      before do
        travel_to start_at + 3.day do
          @group = create(:group)
          idea = create(:idea_with_topics, topics_count: 2)
          create(:comment, post: idea, author: create(:user, manual_groups: [@group]))
          create(:comment, post: create(:idea_with_topics))
        end
      end

      let(:group) { @group.id }

      example_request "Comments by topic filtered by group" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:comments].values.inject(&:+)).to eq 2
      end
    end

  end

  get "web_api/v1/stats/comments_by_topic_as_xlsx" do
    time_boundary_parameters self
    project_filter_parameter self
    group_filter_parameter self

    describe "without time filters" do

      example "Comments by topic", document: false do
        do_request
        expect(response_status).to eq 200
      end
    end

    describe "with time filtering only" do
      let(:start_at) { (now-1.month).in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { (now-1.month).in_time_zone(@timezone).end_of_month }

      before do
        travel_to start_at + 1.day do
          @topic1 = create(:topic)
          @topic2 = create(:topic)
          topic3 = create(:topic)
          project = create(:project, topics: [@topic1, @topic2, topic3])
          idea1 = create(:idea, topics: [@topic1], project: project)
          idea2 = create(:idea, topics: [@topic2], project: project)
          idea3 = create(:idea, topics: [@topic1, @topic2], project: project)
          idea4 = create(:idea)
          comment1 = create(:comment, post: idea1)
          comment2 = create(:comment, post: idea1)
          comment3 = create(:comment, post: idea2)
          comment4 = create(:comment, post: idea3)
        end
        comment5 = create(:comment)
      end

      example_request "Comments by topic" do
        expect(response_status).to eq 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet[0].cells.map(&:value)).to match ['topic', 'topic_id', 'comments']

        topic_ids_col = worksheet.map {|col| col.cells[1].value}
        header, *topic_ids = topic_ids_col
        expect(topic_ids).to match_array [@topic1.id, @topic2.id]

        amount_col = worksheet.map {|col| col.cells[2].value}
        header, *amounts = amount_col
        expect(amounts).to match_array [3, 2]
      end

    end

    describe "filtered by project" do
      before do
        travel_to start_at + 5.day do
          @project = create(:project)
          idea = create(:idea_with_topics, topics_count: 2, project: @project)
          create(:comment, post: idea)
          create(:comment, post: create(:idea_with_topics))
        end
      end

      let(:start_at) { (now-1.month).in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { (now-1.month).in_time_zone(@timezone).end_of_month }
      let(:project) { @project.id }

      example_request "Comments by topic filtered by project" do
        expect(response_status).to eq 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet[0].cells.map(&:value)).to match ['topic', 'topic_id', 'comments']

        amount_col = worksheet.map {|col| col.cells[2].value}
        header, *amounts = amount_col
        expect(amounts.inject(&:+)).to eq 2
      end
    end

    describe "filtered by group" do
      let(:start_at) { (now-1.month).in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { (now-1.month).in_time_zone(@timezone).end_of_month }

      before do
        travel_to start_at + 3.day do
          @group = create(:group)
          idea = create(:idea_with_topics, topics_count: 2)
          create(:comment, post: idea, author: create(:user, manual_groups: [@group]))
          create(:comment, post: create(:idea_with_topics))
        end
      end

      let(:group) { @group.id }

      example_request "Comments by topic filtered by group" do
        expect(response_status).to eq 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet[0].cells.map(&:value)).to match ['topic', 'topic_id', 'comments']

        amount_col = worksheet.map {|col| col.cells[2].value}
        header, *amounts = amount_col
        expect(amounts.inject(&:+)).to eq 2
      end
    end

  end

  get "web_api/v1/stats/comments_by_project" do
    time_boundary_parameters self
    topic_filter_parameter self
    group_filter_parameter self

    describe "with time filtering only" do
      let(:start_at) { (now-1.month).in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { (now-1.month).in_time_zone(@timezone).end_of_month }

      before do
        travel_to start_at + 14.day do
          @project1 = create(:project)
          @project2 = create(:project)
          idea1 = create(:idea, project: @project1)
          idea2 = create(:idea, project: @project1)
          idea3 = create(:idea, project: @project2)
          idea4 = create(:idea)
          comment1 = create(:comment, post: idea1)
          comment2 = create(:comment, post: idea1)
          comment3 = create(:comment, post: idea2)
          comment4 = create(:comment, post: idea3)
        end
      end

      example_request "Comments by project" do
        json_response = json_parse(response_body)
        expect(json_response[:series][:comments].stringify_keys).to match({
          @project1.id => 3,
          @project2.id => 1
        })
        expect(json_response[:projects].keys.map(&:to_s)).to match_array [@project1.id, @project2.id]
      end

    end

    describe "filtered by topic" do
      let(:start_at) { (now-1.month).in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { (now-1.month).in_time_zone(@timezone).end_of_month }

      before do
        travel_to start_at + 17.day do
          @topic = create(:topic)
          project = create(:project, topics: [@topic])
          idea1 = create(:idea, topics: [@topic], project: project)
          idea2 = create(:idea_with_topics)
          create(:comment, post: idea1)
          create(:comment, post: idea2)
        end
      end

      let(:topic) { @topic.id }

      example_request "Comments by project filtered by topic" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:comments].values.inject(&:+)).to eq 1
      end
    end

    describe "filtered by group" do
      let(:start_at) { (now-1.month).in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { (now-1.month).in_time_zone(@timezone).end_of_month }

      before do
        travel_to start_at + 12.day do
          @group = create(:group)
          project = create(:project)
          idea = create(:idea, project: project)
          create(:comment, post: idea, author: create(:user, manual_groups: [@group]))
          create(:comment, post: idea)
        end
      end

      let(:group) { @group.id }

      example_request "Comments by project filtered by group" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:comments].values.inject(&:+)).to eq 1
      end
    end
  end

  get "web_api/v1/stats/comments_by_project_as_xlsx" do
    time_boundary_parameters self
    topic_filter_parameter self
    group_filter_parameter self

    describe "with time filtering only" do
      let(:start_at) { (now-1.month).in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { (now-1.month).in_time_zone(@timezone).end_of_month }

      before do
        travel_to start_at + 14.day do
          @project1 = create(:project)
          @project2 = create(:project)
          idea1 = create(:idea, project: @project1)
          idea2 = create(:idea, project: @project1)
          idea3 = create(:idea, project: @project2)
          idea4 = create(:idea)
          comment1 = create(:comment, post: idea1)
          comment2 = create(:comment, post: idea1)
          comment3 = create(:comment, post: idea2)
          comment4 = create(:comment, post: idea3)
        end
      end

      example_request "Comments by project" do
        expect(response_status).to eq 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet[0].cells.map(&:value)).to match ['project', 'project_id', 'comments']
        project_id_col = worksheet.map {|col| col.cells[1].value}
        header, *project_ids = project_id_col
        expect(project_ids).to match_array [@project1.id, @project2.id]

        project_name_col = worksheet.map {|col| col.cells[0].value}
        header, *project_names = project_name_col
        expect(project_names).to match_array [multiloc_service.t(@project1.title_multiloc), multiloc_service.t(@project2.title_multiloc)]

        comment_col = worksheet.map {|col| col.cells[2].value}
        header, *comments = comment_col
        expect(comments).to match_array [3,1]
      end

    end

    describe "filtered by topic" do
      let(:start_at) { (now-1.month).in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { (now-1.month).in_time_zone(@timezone).end_of_month }

      before do
        travel_to start_at + 17.day do
          @topic = create(:topic)
          project = create(:project, topics: [@topic])
          idea1 = create(:idea, topics: [@topic], project: project)
          idea2 = create(:idea_with_topics)
          create(:comment, post: idea1)
          create(:comment, post: idea2)
        end
      end

      let(:topic) { @topic.id }

      example_request "Comments by project filtered by topic" do
        expect(response_status).to eq 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet[0].cells.map(&:value)).to match ['project', 'project_id', 'comments']

        amount_col = worksheet.map {|col| col.cells[2].value}
        header, *amounts = amount_col
        expect(amounts.inject(&:+)).to eq 1
      end
    end

    describe "filtered by group" do
      let(:start_at) { (now-1.month).in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { (now-1.month).in_time_zone(@timezone).end_of_month }

      before do
        travel_to start_at + 12.day do
          @group = create(:group)
          project = create(:project)
          idea = create(:idea, project: project)
          create(:comment, post: idea, author: create(:user, manual_groups: [@group]))
          create(:comment, post: idea)
        end
      end

      let(:group) { @group.id }

      example_request "Comments by project filtered by group" do
        expect(response_status).to eq 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet[0].cells.map(&:value)).to match ['project', 'project_id', 'comments']

        amount_col = worksheet.map {|col| col.cells[2].value}
        header, *amounts = amount_col
        expect(amounts.inject(&:+)).to eq 1
      end
    end
  end
end
