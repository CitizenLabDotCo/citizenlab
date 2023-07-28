# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Api Clients' do
  explanation 'An ApiClient hold the client_id and client_secret to authenticate against the Public API'

  before { header 'Content-Type', 'application/json' }

  context 'as an admin' do
    before { admin_header_token }

    get 'web_api/v1/api_clients' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of api_clients per page'
      end

      let!(:api_client1) { create(:api_client, name: 'Api Client 1') }
      let!(:api_client2) { create(:api_client, name: 'Api Client 2') }

      example_request 'List all api clients' do
        expect(status).to eq 200

        expect(response_data.size).to eq 2
        expect(response_ids).to eq([api_client1.id, api_client2.id])
        expect(response_data.first[:attributes]).to match({
          name: 'Api Client 1',
          masked_secret: kind_of(String),
          created_at: kind_of(String),
          last_used_at: nil
        })
      end
    end

    get 'web_api/v1/api_clients/:id' do
      let(:api_client) { create(:api_client, name: 'Api Client 1', last_used_at: Time.now) }
      let(:id) { api_client.id }
      example_request 'Get one api client by id' do
        expect(status).to eq 200
        expect(response_data[:type]).to eq 'api_client'
        expect(response_data[:attributes]).to match({
          name: 'Api Client 1',
          masked_secret: "***#{api_client.secret_postfix}",
          created_at: kind_of(String),
          last_used_at: kind_of(String)
        })
      end
    end

    post 'web_api/v1/api_clients' do
      with_options scope: :api_client do
        parameter :name, 'The name associated with the api client. Only purpose is to recognize it', required: true
      end
      ValidationErrorHelper.new.error_fields(self, PublicApi::ApiClient)

      let(:name) { 'Api Client 1' }

      example_request 'Create a new api client' do
        expect(status).to eq 201
        expect(response_data[:type]).to eq 'api_client_unmasked'
        expect(response_data[:attributes]).to match({
          secret: kind_of(String)
        })
      end
    end

    delete 'web_api/v1/api_clients/:id' do
      let(:api_client) { create(:api_client) }
      let(:id) { api_client.id }

      example_request 'Delete an api client' do
        expect(status).to eq 200
        expect { api_client.reload }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end

  context 'as a citizen' do
    get 'web_api/v1/api_clients' do
      example '[Error] List all api clients not authorized', document: false do
        do_request
        expect(status).to eq 401
      end
    end
  end
end
