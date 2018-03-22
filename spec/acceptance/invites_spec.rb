require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Invites" do
  before do
    header "Content-Type", "application/json"
  end

  context "when admin" do
    before do
      @admin = create(:admin)
      token = Knock::AuthToken.new(payload: { sub: @admin.id }).token
      header 'Authorization', "Bearer #{token}"

      @groups = create_list(:group, 5)
    end

    get "web_api/v1/invites" do
      before do
        create_list(:invite, 5)
      end

      example_request("List all invites") do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data).size).to eq 5
      end
    end

    post "web_api/v1/invites" do
      with_options scope: :invite do
        parameter :email, "The email of the invitee.", required: false
        parameter :first_name, "The first name of the invitee.", required: false
        parameter :last_name, "The last name of the invitee.", required: false
        parameter :avatar, "The avatar of the invitee.", required: false
        parameter :locale, "The locale of the invitee.", required: false
        parameter :roles, "Roles array, only allowed when admin", required: false
        parameter :group_ids, "A list of group identifiers to which the invited user will be made member", required: false
      end
      ValidationErrorHelper.new.error_fields(self, Invite)
      ValidationErrorHelper.new.error_fields(self, User)
      ValidationErrorHelper.new.error_fields(self, Membership)

        
      let(:email) { 'nonexistinguser@cocacola.gov' }
      let(:group_ids) { @groups.shuffle.take(3).map(&:id) }
      let(:roles) { [{'type' => 'admin'}] }

      example_request "Invite a non-existing user to become member of some groups" do
        expect(response_status).to eq 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:attributes,:accepted_at)).to be_blank
        invitee = User.find_by(email: email)
        json_invitee = json_response.dig(:included).select{|inc| inc[:id] == invitee.id}&.first
        expect(json_invitee&.dig(:attributes,:email)).to eq(email)
        expect(json_invitee&.dig(:attributes,:invite_status)).to eq('pending')
        expect(invitee.admin?).to eq true
        expect(Membership.count).to eq 3
      end

      example_request "[error] Authenticating an invited user", document: false do
        invitee = User.find_by(email: email)
        expect(invitee.authenticate '').to eq false
      end

      example "[error] Inviting two users with the same email" do
        invite = create(:invite, invitee: create(:user, email: email))

        do_request
        expect(response_status).to eq 422
      end

      context "when not admin" do
        before do
          @inviter = create(:user)
          token = Knock::AuthToken.new(payload: { sub: @inviter.id }).token
          header 'Authorization', "Bearer #{token}"
        end

        let(:first_name) { 'Bart' }
        let(:last_name) { 'Boulettos' }

        example_request "[error] invite", document: false do
          expect(response_status).to eq 401
        end
      end  
    end

  end


  context "When not authenticated" do
    before do
      @invite = create(:invite)
    end

    post "web_api/v1/invites/:token/accept" do
      with_options scope: :invite do
        parameter :email, "The email of the user. Required if not sepcified at creation of the invite", required: false
        parameter :first_name, "The first name of the invitee. Required if not specified at creation of the invite.", required: false
        parameter :last_name, "The last name of the invitee. Required if not specified at creation of the invite.", required: false
        parameter :password, "The password of the invitee.", required: true
        parameter :avatar, "The avatar of the invitee.", required: false
        parameter :locale, "The locale of the invitee.", required: false
      end
      ValidationErrorHelper.new.error_fields(self, Invite)
      ValidationErrorHelper.new.error_fields(self, User)

      let(:token) { @invite.token }
      let(:first_name) { 'Bart' }
      let(:last_name) { 'Boulettos' }
      let(:password) { 'I<3BouletteSpecial' }
      let(:locale) { 'nl' }
      example_request "Accept an invite with a valid token" do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:attributes,:accepted_at)).to be_present
        boulettos = json_response.dig(:included).select{|inc| inc[:id] == @invite.invitee.id}&.first
        expect(boulettos&.dig(:attributes,:last_name)).to eq('Boulettos')
        expect(boulettos&.dig(:attributes,:invite_status)).to eq('accepted')
      end

      example "Accepting an invite with an invalid token" do
        @invite.destroy!

        do_request
        expect(response_status).to eq 401 # unauthorized
      end

      example "Accepting an invitation twice" do
        do_request
        do_request

        expect(response_status).to eq 401 # unauthorized
      end
    
    end
  end
end