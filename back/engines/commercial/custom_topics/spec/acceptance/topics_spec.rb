require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "Topics" do

  explanation "E.g. mobility, health, culture..."

  before do
    header "Content-Type", "application/json"
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

      let(:topic) { create(:custom_topic) }
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
        let(:topic) { create(:custom_topic, code: 'mobility', title_multiloc: {'en' => 'Drama'}) }
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

      let(:topic) { create(:custom_topic) }
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

end
