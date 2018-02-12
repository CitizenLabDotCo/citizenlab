require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Invites" do
  before do
    header "Content-Type", "application/json"
  end

  context "Accepting invites" do
    before do
      @invite = create(:invite)
    end

    post "web_api/v1/invites/:token/accept" do
      with_options scope: :invite do
        parameter :first_name, "The first name of the invitee.", required: true
        parameter :last_name, "The last name of the invitee.", required: true
        parameter :password, "The password of the invitee.", required: true
        parameter :avatar, "The avatar of the invitee.", required: false
        parameter :locale, "The locale of the invitee.", required: true
        parameter :gender, "The gender of the invitee.", required: false
        parameter :birthyear, "The birthyear of the invitee.", required: false
        parameter :domicile, "The domicile of the invitee.", required: false
        parameter :education, "The education level of the invitee.", required: false
        parameter :bio_multiloc, "The bio (multiloc) of the invitee.", required: false
      end
      ValidationErrorHelper.new.error_fields(self, Membership)

      let(:token) { @invite.token }
      example_request "Accept an invite" do
        expect(status).to eq(201)
        json_response = json_parse(response_body)
        byebug
      end
    
    end
  end
end