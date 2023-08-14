# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'CosponsorsInitiatives' do
  explanation 'Cosponsorship of initiatives (proposals) by users'

  before do
    header 'Content-Type', 'application/json'
    user = create(:user)
    @cosponsors_initiative_current_user = create(:cosponsors_initiative, user: user, initiative: create(:initiative))
    @cosponsors_initiative_other_user =
      create(
        :cosponsors_initiative,
        user: create(:user),
        initiative: create(:initiative)
      )
    header_token_for user
  end

  patch '/web_api/v1/cosponsors_initiatives/:id/accept_invite' do
    context 'when record refers to current user' do
      let(:id) { @cosponsors_initiative_current_user.id }

      example 'Accept an invitation to cosponsor an initiative' do
        expect { do_request }
          .to change { @cosponsors_initiative_current_user.reload.status }.from('pending').to('accepted')
        assert_status 204
      end
    end

    context 'when record does NOT refer to current user' do
      let(:id) { @cosponsors_initiative_other_user.id }

      example '[Unauthorized] Accept an invitation to cosponsor an initiative' do
        expect { do_request }.not_to change { @cosponsors_initiative_other_user.reload.status }
        assert_status 401
      end
    end
  end
end
