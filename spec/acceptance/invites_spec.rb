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


    post "web_api/v1/invites/bulk_create" do
      with_options scope: :invites do
        parameter :emails, "Array of e-mail addresses of invitees. E-mails can be null for anonymous invites", required: true
        parameter :locale, "Locale for all invitiees, defaults to first tenant locale", required: false
        parameter :roles, "Roles for all invitees, defaults to normal user", required: false
        parameter :group_ids, "Array of group ids that the invitees will be member of, defaults to none", required: false
        parameter :invite_text, "Optional text that will be included in the outgoing e-mail to the invitee", required: false
      end

      let(:emails) { 5.times.map{Faker::Internet.email}.concat([nil]) }
      let(:group_ids) { [create(:group).id] }
      let(:roles) {[{"type" => "admin"}]}
      let(:locale) { "nl" }
      let(:invite_text) { "Welcome, my friend!" }

      example_request("Bulk invite multiple users") do
        expect(response_status).to eq 200
        expect(Invite.count).to eq 6
        expect(Invite.all.map{|i| i.invitee.email}).to match emails
        expect(Invite.all.map{|i| i.invitee.groups.map(&:id)}.uniq).to match [group_ids]
        expect(Invite.all.map{|i| i.invitee.admin?}.uniq).to eq [true]
        expect(Invite.all.map{|i| i.invitee.locale}.uniq).to eq [locale]
      end
    end

    post "web_api/v1/invites/bulk_create_xlsx" do
      with_options scope: :invites do
        parameter :xlsx, "Base64 encoded xlsx file with invite details. See web_api/v1/invites/example_xlsx for the format", required: true
        parameter :locale, "Locale for invitees without a specified locale in xlsx, defaults to first tenant locale", required: false
        parameter :roles, "Roles for invitees without a specified admin column in xlsx, default to no roles", required: false
        parameter :group_ids, "Group ids for invitiees without a specified groups column in xlsx, defaults to none", required: false
        parameter :invite_text, "Optional text that will be included in the outgoing e-mail to the invitee", required: false
      end

      let(:users) { build_list(:user, 6)}
      let(:hash_array) { users.map.with_index do |user, i|
        {
          email: rand(5) == 0 ? nil : user.email,
          first_name: rand(3) == 0 ? user.first_name : nil,
          last_name: rand(3) == 0 ? user.last_name : nil,
          locale: i == 0 ? 'nl' : nil,
          admin: i == 0 ? true : nil,
          groups: i == 0 ? create(:group).title_multiloc.values.first : nil
        }
      end}
      let(:xlsx_stringio) { XlsxService.new.hash_array_to_xlsx(hash_array) }
      let(:xlsx) { "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,#{Base64.encode64(xlsx_stringio.read)}" }
      let(:group_ids) { [create(:group).id] }
      let(:roles) {[{"type" => "admin"}]}
      let(:locale) { "en" }
      let(:invite_text) { "Welcome, my friend!" }

      example_request("Bulk invite multiple users with xlsx file") do
        expect(response_status).to eq 200
        expect(Invite.count).to eq 6
        expect(Invite.all.map{|i| i.invitee.email}).to match hash_array.map{|h| h[:email]}
        expect(Invite.all.map{|i| i.invitee.groups.map(&:id)}.flatten.uniq).to match Group.all.map(&:id)
        expect(Invite.all.map{|i| i.invitee.admin?}.uniq).to eq [true]
        expect(Invite.all.map{|i| i.invitee.locale}.uniq).to match ['nl', locale]
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