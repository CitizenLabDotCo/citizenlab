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
        parameter :locale, "The locale of the invitee.", required: false
        parameter :gender, "The gender of the invitee.", required: false
        parameter :birthyear, "The birthyear of the invitee.", required: false
        parameter :domicile, "The domicile of the invitee.", required: false
        parameter :education, "The education level of the invitee.", required: false
        parameter :bio_multiloc, "The bio (multiloc) of the invitee.", required: false
      end
      ValidationErrorHelper.new.error_fields(self, User)
      ValidationErrorHelper.new.error_fields(self, Membership)

      let(:token) { @invite.token }
      let(:first_name) { 'Bart' }
      let(:last_name) { 'Boulettos' }
      let(:password) { 'I<3BouletteSpecial' }
      let(:locale) { 'nl' }
      example_request "Accept an invite with a valid token" do
        expect(status).to eq(201)
        json_response = json_parse(response_body)
        expect(
          json_response
            .dig(:included)
            .select{|inc| inc[:id] == json_response.dig(:data,:relationships,:user,:data,:id)}&.first
            &.dig(:attributes,:last_name)
        ).to eq last_name
        expect(json_response.dig(:data,:relationships,:group,:data,:id)).to eq @invite.group_id
      end

      example "Accepting an invite with an invalid token, or an invite which has already been activated" do
        @invite.destroy!

        do_request
        expect(response_status).to eq 401 # unauthorized
      end
    
    end
  end
end