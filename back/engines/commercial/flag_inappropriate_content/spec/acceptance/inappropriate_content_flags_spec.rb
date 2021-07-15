require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource 'Inappropriate content flags' do

  before do
    header 'Content-Type', 'application/json'
    @admin = create(:admin)
    token = Knock::AuthToken.new(payload: @admin.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
  end

  get 'web_api/v1/inappropriate_content_flags/:id' do
      let(:flag) { create(:inappropriate_content_flag) }
      let(:id) { flag.id }

      example_request 'Get one flag by id' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq id
      end
    end

  patch 'web_api/v1/inappropriate_content_flags/:id/mark_as_deleted' do
    let(:flag) { create(:inappropriate_content_flag, deleted_at: nil) }
    let(:id) { flag.id }

    example 'Mark a flag as deleted' do
      expect(flag.deleted?).to be_falsey
      do_request
      expect(status).to be 200
      expect(flag.reload.deleted?).to be_truthy
    end
  end

  patch 'web_api/v1/inappropriate_content_flags/:id/mark_as_flagged' do
    let(:flag) { create(:inappropriate_content_flag, deleted_at: Time.now) }
    let(:id) { flag.id }

    example 'Re-introduce a deleted flag' do
      expect(flag.deleted?).to be_truthy
      do_request
      expect(status).to be 200
      expect(flag.reload.deleted?).to be_falsey
    end
  end

end
