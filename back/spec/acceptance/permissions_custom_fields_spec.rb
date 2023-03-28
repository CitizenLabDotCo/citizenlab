# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'PermissionsCustomField' do
  explanation 'Associations between permissions and registration fields that should be specified to be granted permission.'

  before do
    header 'Content-Type', 'application/json'
    admin_header_token
  end

  let(:permission) { create :permission, permission_scope: permission_scope }
  let(:action) { permission.action }

  get 'web_api/v1/ideas/:idea_id/permissions/:action/permissions_custom_fields' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of permissions custom fields per page'
    end

    let(:permission_scope) { create :continuous_project }
    let(:idea_id) { create(:idea, project: permission_scope).id }

    example 'List all permission custom fields of a permission' do
      field1, field2 = create_list :custom_field, 2
      [{ required: true, custom_field: field1 }, { required: false, custom_field: field2 }].each do |attributes|
        create :permissions_custom_field, attributes.merge(permission: permission)
      end

      do_request

      assert_status 200
      json_response = json_parse response_body
      expect(json_response[:data].size).to eq 2
      expect(json_response[:data].map { |d| d.dig(:attributes, :required) }).to eq [true, false]
      expect(json_response[:data].map { |d| d.dig(:relationships, :custom_field) }).to eq([
        { data: { id: field1.id, type: 'custom_field' } },
        { data: { id: field2.id, type: 'custom_field' } }
      ])
    end
  end

  # get 'web_api/v1/official_feedback/:id' do
  #   let(:id) { @feedbacks.first.id }

  #   example_request 'Get one official feedback on an idea by id' do
  #     expect(status).to eq 200

  #     expect(json_response.dig(:data, :id)).to eq @feedbacks.first.id
  #     expect(json_response.dig(:data, :type)).to eq 'official_feedback'
  #     expect(json_response.dig(:data, :attributes, :created_at)).to be_present
  #     expect(json_response.dig(:data, :relationships)).to include(
  #       post: {
  #         data: { id: @feedbacks.first.post_id, type: 'idea' }
  #       },
  #       user: {
  #         data: { id: @feedbacks.first.user_id, type: 'user' }
  #       }
  #     )
  #   end
  # end

  # context 'when authenticated as normal user' do
  #   before do
  #     @user = create(:user)
  #     token = Knock::AuthToken.new(payload: @user.to_token_payload).token
  #     header 'Authorization', "Bearer #{token}"
  #   end

  #   post 'web_api/v1/ideas/:idea_id/official_feedback' do
  #     with_options scope: :official_feedback do
  #       parameter :body_multiloc, 'Multi-locale field with the feedback body', required: true
  #       parameter :author_multiloc, 'Multi-locale field with describing the author', required: true
  #     end
  #     ValidationErrorHelper.new.error_fields(self, OfficialFeedback)

  #     let(:idea_id) { @idea.id }
  #     let(:feedback) { build(:official_feedback) }
  #     let(:body_multiloc) { feedback.body_multiloc }
  #     let(:author_multiloc) { feedback.author_multiloc }

  #     example_request '[error] Create an official feedback on an idea' do
  #       expect(response_status).to eq 401
  #     end
  #   end
  # end

  # post 'web_api/v1/ideas/:idea_id/official_feedback' do
  #   with_options scope: :official_feedback do
  #     parameter :body_multiloc, 'Multi-locale field with the feedback body', required: true
  #     parameter :author_multiloc, 'Multi-locale field with describing the author', required: true
  #   end
  #   ValidationErrorHelper.new.error_fields(self, OfficialFeedback)

  #   let(:idea_id) { @idea.id }
  #   let(:feedback) { build(:official_feedback) }
  #   let(:body_multiloc) { feedback.body_multiloc }
  #   let(:author_multiloc) { feedback.author_multiloc }

  #   example_request 'Create an official feedback on an idea' do
  #     assert_status 201
  #     expect(json_response.dig(:data, :relationships, :user, :data, :id)).to eq @user.id
  #     expect(json_response.dig(:data, :attributes, :body_multiloc).stringify_keys).to match body_multiloc
  #     expect(json_response.dig(:data, :attributes, :author_multiloc).stringify_keys).to match author_multiloc
  #     expect(json_response.dig(:data, :relationships, :post, :data, :id)).to eq idea_id
  #     expect(@idea.reload.official_feedbacks_count).to eq 3
  #   end

  #   describe do
  #     let(:body_multiloc) { { 'en' => '' } }

  #     example_request '[error] Create an invalid official feedback on an idea' do
  #       assert_status 422
  #       expect(json_response).to include_response_error(:body_multiloc, 'blank')
  #     end
  #   end

  #   patch 'web_api/v1/official_feedback/:id' do
  #     with_options scope: :official_feedback do
  #       parameter :body_multiloc, 'Multi-locale field with the feedback body', required: true
  #       parameter :author_multiloc, 'Multi-locale field with describing the author', required: true
  #     end
  #     ValidationErrorHelper.new.error_fields(self, OfficialFeedback)

  #     let(:official_feedback) { create(:official_feedback, user: @user, post: @idea) }
  #     let(:id) { official_feedback.id }
  #     let(:body_multiloc) { { 'en' => "His hair is not blond, it's orange. Get your facts straight!" } }

  #     example_request 'Update an official feedback for an idea' do
  #       assert_status 200
  #       expect(json_response.dig(:data, :attributes, :body_multiloc).stringify_keys).to match body_multiloc
  #       expect(@idea.reload.official_feedbacks_count).to eq 3
  #     end
  #   end

  #   delete 'web_api/v1/official_feedback/:id' do
  #     let(:official_feedback) { create(:official_feedback, user: @user, post: @idea) }
  #     let(:id) { official_feedback.id }
  #     example_request 'Delete an official feedback from an idea' do
  #       assert_status 200
  #       expect { OfficialFeedback.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
  #       expect(@idea.reload.official_feedbacks_count).to eq 2
  #     end
  #   end
  # end
end
