# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'CosponsorsInitiatives' do
  explanation 'Cosponsorship of initiatives (proposals) by users'

  before do
    header 'Content-Type', 'application/json'
    user = create(:user)
    @cosponsors_initiative = create(:cosponsors_initiative, user: user, initiative: create(:initiative))
    header_token_for user
  end

  patch '/web_api/v1/cosponsors_initiatives/:id/accept_invite' do
    let(:id) { @cosponsors_initiative.id }

    example_request 'Accept an invitation to cosponsor an initiative' do
      assert_status 200
    end
  end
end
