# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Analysis users' do
  explanation 'An analysis user is a minimal representation of a normal user, with just the attributes useful for the analysis. Exists because of performance reasons.'

  before do
    header 'Content-Type', 'application/json'
    admin_header_token
  end

  get 'web_api/v1/analyses/:analysis_id/users/:id' do
    let(:analysis) { create(:analysis) }
    let(:analysis_id) { analysis.id }
    let(:user) { create(:user) }
    let(:id) { user.id }

    example_request 'Get a user by id' do
      expect(status).to eq(200)
      expect(response_data).to match({
        id: user.id,
        type: 'analysis_user',
        attributes: {
          first_name: user.first_name,
          last_name: user.last_name,
          slug: user.slug,
          locale: 'en',
          created_at: kind_of(String),
          updated_at: kind_of(String),
          avatar: {
            small: kind_of(String),
            medium: kind_of(String),
            large: kind_of(String)
          }
        }
      })
    end
  end
end
