# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Invite', admin_api: true do
  before do
    header 'Content-Type', 'application/json'
    header 'Authorization', ENV.fetch('ADMIN_API_TOKEN')
  end

  post 'admin_api/invites' do
    parameter :tenant_id, 'The tenant id in which to create the invite', required: true
    with_options scope: :invite do
      parameter :invitee_id, 'The ID of the user that sends the invite', required: false
      parameter :email, 'The email of the user', required: false
      parameter :first_name, 'The first_name of the user', required: false
      parameter :last_name, 'The last_name of the user', required: false
      parameter :locale, 'The locale of the user', required: false
      parameter :invite_text, 'The text in the email', required: false
      parameter :roles, 'The roles of the user', required: false
      parameter :group_ids, 'Array of groups the user will be part of', required: false
      parameter :send_invite_email, 'Should we send out an invite email? Defaults to true', required: false
    end
    ValidationErrorHelper.new.error_fields(self, Invite)

    let(:tenant_id) { Tenant.current.id }
    let(:email) { 'Jakky@voordevrienden.be' }
    let(:first_name) { 'Jaak' }
    let(:last_name) { 'Brijl' }
    let(:locale) { 'nl-BE' }
    let(:invite_text) { 'Welcome to the new world' }
    let(:roles) { [{ type: 'admin' }] }
    let(:group) { create(:group) }
    let(:group_ids) { [group.id] }
    let(:send_invite_email) { false }

    describe do
      example_request 'Create an invite' do
        expect(response_status).to eq 201
        expect(Invite.count).to be 1
        invite = Invite.first

        json_response = json_parse(response_body)
        expect(json_response[:token]).to eq invite.token
        expect(json_response[:invite_text]).to eq invite.invite_text
        expect(json_response[:invitee_id]).to eq invite.invitee_id
        expect(json_response[:send_invite_email]).to eq send_invite_email
        expect(invite.invitee.first_name).to eq first_name
        expect(invite.invitee.last_name).to eq last_name
        expect(invite.invitee.email).to eq email
        expect(invite.invitee.locale).to eq locale
      end
    end
  end
end
