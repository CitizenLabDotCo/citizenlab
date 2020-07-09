require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "Topics" do

  explanation "E.g. mobility, health, culture..."

  before do
    header "Content-Type", "application/json"
    @topics = create_list(:topic, 5)
  end

  get "web_api/v1/topics" do
    with_options scope: :page do
      parameter :number, "Page number"
      parameter :size, "Number of topics per page"
    end
    parameter :code, 'Filter by code', required: false
    
    example_request "List all topics" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 5
    end

    example "List all topics by code" do
      @topics.first.update!(code: 'nature')
      do_request code: 'custom'
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 4
    end

    example "List all topics by code exclusion" do
      @topics.first.update!(code: 'nature')
      do_request exclude_code: 'custom'
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 1
    end

    example "List all topics sorted by newest first" do
      t1 = create(:topic, created_at: Time.now + 1.hour)

      do_request sort: 'new'
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 6
      expect(json_response[:data][0][:id]).to eq t1.id
    end

    example "List all topics sorted by custom ordering" do
      t1 = create(:topic)
      t1.insert_at!(0)
      t2 = create(:topic)
      t2.insert_at!(6)

      do_request sort: 'custom'
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 7
      expect(json_response[:data][0][:id]).to eq t1.id
      expect(json_response[:data][6][:id]).to eq t2.id
    end
  end

  get "web_api/v1/topics/:id" do
    let(:id) {@topics.first.id}

    example_request "Get one topic by id" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @topics.first.id
    end
  end

  context "when admin" do
    before do
      @admin = create(:admin)
      token = Knock::AuthToken.new(payload: @admin.to_token_payload).token
      header 'Authorization', "Bearer #{token}"
    end

    post "web_api/v1/topics" do
      with_options scope: :topic do
        parameter :title_multiloc, "The title of the topic, as a multiloc string", required: true
        parameter :description_multiloc, "The description of the topic, as a multiloc string", required: false
      end
      ValidationErrorHelper.new.error_fields(self, Topic)

      let(:topic) { build(:topic) }
      let(:title_multiloc) { topic.title_multiloc }

      example_request "Create a topic" do
        expect(response_status).to eq 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:attributes,:title_multiloc).stringify_keys).to match title_multiloc
      end
    end

    patch "web_api/v1/topics/:id" do
      with_options scope: :topic do
        parameter :title_multiloc, "The title of the topic, as a multiloc string"
        parameter :description_multiloc, "The description of the topic, as a multiloc string"
      end
      ValidationErrorHelper.new.error_fields(self, Topic)

      let(:topic) { create(:topic) }
      let(:id) { topic.id }
      let(:title_multiloc) { {'en' => "Comedy"} }
      let(:description_multiloc) { {'en' => "Stuff that tends to make you laugh"} }

      example_request "Update a topic" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:attributes,:title_multiloc).stringify_keys).to match title_multiloc
        expect(json_response.dig(:data,:attributes,:description_multiloc).stringify_keys).to match description_multiloc
      end

      context do
        let(:topic) { create(:topic, code: 'mobility', title_multiloc: {'en' => 'Drama'}) }
        let(:id) { topic.id }

        example_request "Rename a default topic does not work", example: false do
          expect(response_status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data,:attributes,:title_multiloc).stringify_keys).to match ({'en' => 'Drama'})
        end
      end
    end

    patch "web_api/v1/topics/:id/reorder" do
      with_options scope: :topic do
        parameter :ordering, "The position, starting from 0, where the field should be at. Fields after will move down.", required: true
      end

      let(:id) { create(:topic).id }
      let(:ordering) { 1 }

      example_request "Reorder a topic globally" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:attributes,:ordering)).to eq ordering
      end

      context do
        let(:topic) { create(:topic, code: 'mobility') }
        let(:id) { topic.id }

        example_request "Reorder a default topic", document: :false do
          expect(response_status).to eq 200
        end
      end
    end

    delete "web_api/v1/topics/:id" do

      let(:topic) { create(:topic) }
      let!(:id) { topic.id }

      example "Delete a topic" do
        old_count = Topic.count
        do_request
        expect(response_status).to eq 200
        expect{Topic.find(id)}.to raise_error(ActiveRecord::RecordNotFound)
        expect(Topic.count).to eq (old_count - 1)
      end

      context do
        let(:topic) { create(:topic, code: 'mobility') }
        let(:id) { topic.id }

        example_request "[error] Delete a default topic" do
          expect(response_status).to eq 401
        end
      end
    end
  end

  get "web_api/v1/projects/:project_id/topics" do
    with_options scope: :page do
      parameter :number, "Page number"
      parameter :size, "Number of topics per page"
    end

    let(:topics) { @topics.take(2) }
    let(:project_id) { create(:project, topics: topics).id }
    
    example_request "List all topics of a project" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
    end

    example "List all topics of a project sorted by custom ordering" do
      t1 = @topics.first
      t1.projects_topics.find_by(project_id: project_id).insert_at!(1)

      do_request sort: 'custom'
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
      expect(json_response[:data][1][:id]).to eq t1.id
    end
  end

end
