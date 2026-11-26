# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Users' do
  let(:project_id) { 'userjot-project-id' }
  let(:secret) { 'userjot-project-secret' }

  before do
    header 'Content-Type', 'application/json'
    allow(ENV).to receive(:fetch).and_call_original
    allow(ENV).to receive(:fetch).with('USERJOT_PROJECT_ID', nil).and_return(project_id)
    allow(ENV).to receive(:fetch).with('USERJOT_PROJECT_SECRET', nil).and_return(secret)
    SettingsService.new.activate_feature!('userjot')
  end

  get 'web_api/v1/users/me/userjot_identity' do
    context 'when not authenticated' do
      example_request '[error] Get a UserJot identity without authentication' do
        assert_status 401
      end
    end

    context 'when admin' do
      let(:user) { create(:admin) }

      before { header_token_for user }

      example_request 'Get a UserJot identity for the current user' do
        assert_status 200
        expect(json_parse(response_body).dig(:data, :attributes)).to eq(
          project_id: project_id,
          signature: OpenSSL::HMAC.hexdigest('SHA256', secret, user.id)
        )
      end

      example '[error] Get a UserJot identity when the userjot feature is not active' do
        SettingsService.new.deactivate_feature!('userjot')
        do_request
        assert_status 401
      end
    end

    %i[project_moderator project_folder_moderator space_moderator].each do |moderator_factory|
      context "when #{moderator_factory.to_s.humanize(capitalize: false)}" do
        before { header_token_for create(moderator_factory) }

        example_request "Get a UserJot identity as a #{moderator_factory.to_s.humanize(capitalize: false)}" do
          assert_status 200
        end
      end
    end

    context 'when resident' do
      before { header_token_for create(:user) }

      example_request '[error] Get a UserJot identity as a resident' do
        assert_status 401
      end
    end
  end
end
