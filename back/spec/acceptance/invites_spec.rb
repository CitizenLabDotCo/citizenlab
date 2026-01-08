# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Invites' do
  explanation 'Admins can invite people to join the platform.'

  before do
    header 'Content-Type', 'application/json'
  end

  context 'when admin' do
    before do
      @user = create(:admin)
      header_token_for @user
    end

    get 'web_api/v1/invites' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of ideas per page'
      end
      parameter :search, 'Filter by searching in email, first_name and last_name', required: false
      parameter :sort, "Either 'email', '-email', 'last_name', '-last_name', 'created_at', '-created_at', 'invite_status', '-invite_status'", required: false
      parameter :invite_status, "Filter by invite_status. Either 'pending' or 'accepted'"

      describe do
        let!(:invites) { create_list(:invite, 5) }

        example_request 'List all invites' do
          assert_status 200
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq invites.size
        end
      end

      describe do
        let!(:invites) { create_list(:invite, 5) }
        let(:invite) { create(:invite, invitee: create(:user, last_name: 'abcdefg1234')) }
        let(:search) { invite.invitee.last_name[0..6] }

        example_request 'Search for invites' do
          assert_status 200
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 1
          expect(json_response[:data].first[:relationships][:invitee][:data][:id]).to eq invite.invitee.id
        end
      end

      describe do
        let!(:invites) { create_list(:invite, 5) }
        let(:invite_status) { 'pending' }
        let(:search) { 'abc' }
        let(:sort) { '-email' }

        example 'List all invites by combining filter, sort and search', document: false do
          do_request
          assert_status 200
        end
      end

      describe do
        let!(:invite3) { create(:invite, invitee: create(:user, email: 'c@domain.com')) }
        let!(:invite1) { create(:invite, invitee: create(:user, email: 'a@domain.com')) }
        let!(:invite2) { create(:invite, invitee: create(:user, email: 'b@domain.com')) }
        let(:sort) { 'email' }

        example_request 'List all invites sorted by email' do
          assert_status 200
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 3
          expect(json_response[:data].pluck(:id)).to contain_exactly(invite1.id, invite2.id, invite3.id)
        end
      end

      describe do
        let!(:pending_invites) { create_list(:invite, 3) }
        let!(:accepted_invites) { create_list(:accepted_invite, 2) }
        let(:invite_status) { 'accepted' }

        example_request 'List all invites that have been accepted' do
          assert_status 200
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq accepted_invites.size
          expect(json_response[:data].pluck(:id)).to match_array accepted_invites.map(&:id)
        end
      end
    end

    get 'web_api/v1/invites/as_xlsx' do
      let!(:invites) { create_list(:invite, 2) }
      let!(:invite_with_group) { create(:invite, invitee: create(:admin, manual_groups: create_list(:group, 2))) }

      example_request 'XLSX export' do
        assert_status 200
      end

      describe 'when resident' do
        before { resident_header_token }

        example '[error] XLSX expor', document: false do
          do_request
          assert_status 401
        end
      end
    end

    get 'web_api/v1/invites/example_xlsx' do
      example_request 'Get the example xlsx' do
        assert_status 200
      end
    end

    delete 'web_api/v1/invites/:id' do
      let(:id) { create(:invite).id }

      example_request 'Delete an invite' do
        assert_status 200
        expect { Invite.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
        expect(Invite.count).to eq 0
      end
    end
  end

  context 'When not authenticated' do
    post 'web_api/v1/invites/by_token/:token/accept' do
      with_options scope: :invite do
        parameter :email, 'The email of the user. Required if not specified at creation of the invite', required: false
        parameter :first_name, 'The first name of the invitee. Required if not specified at creation of the invite.', required: false
        parameter :last_name, 'The last name of the invitee. Required if not specified at creation of the invite.', required: false
        parameter :password, 'The password of the invitee.', required: true
        parameter :avatar, 'The avatar of the invitee.', required: false
        parameter :locale, 'The locale of the invitee.', required: false
        parameter :claim_tokens, <<~DESC
          Tokens used to claim anonymous participation data (e.g., ideas) created before accepting the invite.
        DESC
      end
      ValidationErrorHelper.new.error_fields(self, Invite)
      ValidationErrorHelper.new.error_fields(self, User)

      let(:invite) { create(:invite, email: 'super.boulette@hotmail.com') }
      let(:token) { invite.token }
      let(:first_name) { 'Bart' }
      let(:last_name) { 'Boulettos' }
      let(:password) { 'I<3BouletteSpecial' }
      let(:locale) { 'nl-NL' }

      example_request 'Accept an invite' do
        assert_status(200)
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :accepted_at)).to be_present
        boulettos = json_response[:included].select { |inc| inc[:id] == invite.invitee.id }&.first
        expect(boulettos&.dig(:attributes, :last_name)).to eq('Boulettos')
        expect(boulettos&.dig(:attributes, :invite_status)).to eq('accepted')
        expect(invite.reload.invitee.registration_completed_at).not_to be_nil

        expect(LogActivityJob).to have_been_enqueued.with(
          invite.invitee,
          'completed_registration',
          invite.invitee,
          invite.invitee.updated_at.to_i
        ).exactly(1).times
      end

      describe do
        let(:email) { 'Super.Boulette@hotmail.com' }

        example 'Accept an invite using different capitalization for the email', document: false do
          do_request
          assert_status 200
        end
      end

      example '[error] Accept an invite with an invalid token', document: false do
        invite.destroy!
        do_request
        expect(response_status).to eq 401 # unauthorized
      end

      example '[error] Accept an invitation twice', document: false do
        do_request
        do_request
        expect(response_status).to eq 401 # unauthorized
      end

      example 'Accept an expired invitation', document: false do
        invite.update!(created_at: 2.months.ago)
        do_request
        # You would expect this to be a 401 (unauthorized),
        # but the way this works is that there is a job that cleans up
        # expired invites. So the idea is that this invite
        # would already have been deleted by that job.
        # So the situation in this test should not really occur.
        # Still, wanted to add this just as documentation of some
        # potentially confusing behavior.
        # Would be more robust if we would block acceptance of expired
        # invites in the controller as well.
        expect(response_status).to eq 200
      end

      context 'with claim_tokens' do
        let!(:claim_token) { create(:claim_token) }
        let(:idea) { claim_token.item }
        let(:claim_tokens) { [claim_token.token] }

        example 'claims participation data when accepting invite', document: false do
          expect(idea.author_id).to be_nil

          do_request

          assert_status 200
          expect(idea.reload.author_id).to eq(invite.invitee.id)
          expect { claim_token.reload }.to raise_error(ActiveRecord::RecordNotFound)
        end
      end
    end

    post 'web_api/v1/invites/resend' do
      with_options scope: :invite do
        parameter :email, 'The email of the user to resend the invite to', required: true
      end

      let(:user) { create(:invited_user) }
      let(:invite) { user.invitee_invite }
      let(:email) { user.email }

      example_request 'Resend an invite' do
        assert_status 200
        expect(LogActivityJob).to have_been_enqueued.with(
          invite, 'resent', anything, nil
        ).exactly(1).times
      end

      example '[error] Resend an invite to a user without a pending invite', document: false do
        user.update!(invite_status: 'accepted')
        do_request
        assert_status 422
      end

      example '[error] Resend an invite to a non-existing user', document: false do
        user.destroy!
        do_request
        assert_status 422
      end
    end
  end
end
