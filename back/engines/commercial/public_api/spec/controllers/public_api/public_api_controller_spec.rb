# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PublicApi::PublicApiController do
  let(:api_client) { PublicApi::ApiClient.create }
  let(:jwt_token) { AuthToken::AuthToken.new(payload: api_client.to_token_payload).token }
  let(:headers) { { 'Authorization' => "Bearer #{jwt_token}" } }

  before { request.headers.merge!(headers) }

  describe 'before_action :check_api_token' do
    # We add a dummy action to the controller to be able to test the before_action
    controller do
      def index
        render json: {}
      end
    end

    it 'updates the `last_used_at` attribute of the api_client' do
      freeze_time do
        expect { get :index }.to change { api_client.reload.last_used_at }.to(Time.current)
      end
    end

    it 'records the user agent of the caller' do
      request.headers['User-Agent'] = 'Microsoft.Data.Mashup (https://go.microsoft.com/fwlink/?LinkID=304225)'

      expect { get :index }
        .to change { api_client.reload.last_user_agent }
        .to('Microsoft.Data.Mashup (https://go.microsoft.com/fwlink/?LinkID=304225)')
    end

    it 'leaves the last user agent alone when the request does not send one' do
      request.headers['User-Agent'] = nil
      api_client.update_columns(last_user_agent: 'Microsoft.Data.Mashup')

      expect { get :index }.not_to change { api_client.reload.last_user_agent }
    end
  end
end
