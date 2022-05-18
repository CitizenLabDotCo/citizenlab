# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'OfficialFeedback' do
  explanation 'Official feedback is input from moderators on content (i.e. ideas), separated from comments.'

  before do
    header 'Content-Type', 'application/json'
    @initiative = create(:initiative)
    @feedbacks = create_list(:official_feedback, 2, post: @initiative)
  end

  get 'web_api/v1/initiatives/:initiative_id/official_feedback' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of official feedback per page'
    end

    let(:initiative_id) { @initiative.id }

    example_request 'List all official feedback of an initiative' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
      expect(json_response.dig(:data, 0, :attributes, :body_multiloc)).to be_present
      expect(json_response.dig(:data, 0, :attributes, :author_multiloc)).to be_present
    end
  end

  get 'web_api/v1/official_feedback/:id' do
    let(:id) { @feedbacks.first.id }

    example_request 'Get one official feedback on an initiative by id' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @feedbacks.first.id
    end
  end

  context 'when authenticated' do
    before do
      @user = create(:admin)
      token = Knock::AuthToken.new(payload: @user.to_token_payload).token
      header 'Authorization', "Bearer #{token}"
    end

    post 'web_api/v1/initiatives/:initiative_id/official_feedback' do
      with_options scope: :official_feedback do
        parameter :body_multiloc, 'Multi-locale field with the feedback body', required: true
        parameter :author_multiloc, 'Multi-locale field with describing the author', required: true
      end
      ValidationErrorHelper.new.error_fields(self, OfficialFeedback)

      let(:initiative_id) { @initiative.id }
      let(:feedback) { build(:official_feedback) }
      let(:body_multiloc) { feedback.body_multiloc }
      let(:author_multiloc) { feedback.author_multiloc }

      example_request 'Create an official feedback on an initiative' do
        assert_status 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :relationships, :user, :data, :id)).to eq @user.id
        expect(json_response.dig(:data, :attributes, :body_multiloc).stringify_keys).to match body_multiloc
        expect(json_response.dig(:data, :attributes, :author_multiloc).stringify_keys).to match author_multiloc
        expect(json_response.dig(:data, :relationships, :post, :data, :id)).to eq initiative_id
        expect(@initiative.reload.official_feedbacks_count).to eq 3
      end

      describe do
        let(:body_multiloc) { { 'en' => '' } }

        example_request '[error] Create an invalid official feedback on an initiative' do
          assert_status 422
          json_response = json_parse response_body
          expect(json_response).to include_response_error(:body_multiloc, 'blank')
        end
      end
    end

    patch 'web_api/v1/official_feedback/:id' do
      with_options scope: :official_feedback do
        parameter :body_multiloc, 'Multi-locale field with the feedback body', required: true
        parameter :author_multiloc, 'Multi-locale field with describing the author', required: true
      end
      ValidationErrorHelper.new.error_fields(self, OfficialFeedback)

      let(:official_feedback) { create(:official_feedback, user: @user, post: @initiative) }
      let(:id) { official_feedback.id }
      let(:body_multiloc) { { 'en' => "His hair is not blond, it's orange. Get your facts straight!" } }

      example_request 'Update an official feedback for an initiative' do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :body_multiloc).stringify_keys).to match body_multiloc
        expect(@initiative.reload.official_feedbacks_count).to eq 3
      end
    end

    delete 'web_api/v1/official_feedback/:id' do
      let(:official_feedback) { create(:official_feedback, user: @user, post: @initiative) }
      let(:id) { official_feedback.id }
      example_request 'Delete an official feedback from an initiative' do
        expect(response_status).to eq 200
        expect { OfficialFeedback.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
        expect(@initiative.reload.official_feedbacks_count).to eq 2
      end
    end
  end

  context 'when authenticated as normal user' do
    before do
      @user = create(:user)
      token = Knock::AuthToken.new(payload: @user.to_token_payload).token
      header 'Authorization', "Bearer #{token}"
    end

    post 'web_api/v1/initiatives/:initiative_id/official_feedback' do
      with_options scope: :official_feedback do
        parameter :body_multiloc, 'Multi-locale field with the feedback body', required: true
        parameter :author_multiloc, 'Multi-locale field with describing the author', required: true
      end
      ValidationErrorHelper.new.error_fields(self, OfficialFeedback)

      let(:initiative_id) { @initiative.id }
      let(:feedback) { build(:official_feedback) }
      let(:body_multiloc) { feedback.body_multiloc }
      let(:author_multiloc) { feedback.author_multiloc }

      example_request '[error] Create an official feedback on an initiative' do
        expect(response_status).to eq 401
      end
    end
  end
end
