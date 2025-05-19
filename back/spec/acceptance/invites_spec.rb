# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Invites' do
  explanation 'Admins can invite people to join the platform.'

  before do
    header 'Content-Type', 'application/json'
  end

  context 'when admin' do
    before { admin_header_token }

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
          expect(json_response[:data].pluck(:id)).to match_array [invite1.id, invite2.id, invite3.id]
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

    describe 'count seats' do
      shared_examples 'a request counting seats' do
        let(:emails) { Array.new(5) { Faker::Internet.email }.push(nil) }
        let(:roles) do
          # only the highest role is actually used
          [
            { 'type' => 'admin' },
            { 'type' => 'project_moderator', 'project_id' => @project.id }
          ]
        end

        before do
          @project = create(:project)
          create(:project_moderator, projects: [@project])
          create(:admin)
          create(:project_moderator, email: emails[0], projects: [@project])
          create(:admin, email: emails[1])
        end

        example 'Returns newly added admin and moderator counts' do
          expect { do_request }.to not_change(Invite, :count)
            .and not_change(User, :count)
            .and not_change(User.billed_admins, :count)
            .and not_change(User.billed_moderators, :count)
          do_request
          assert_status 200

          expect(response_data[:attributes]).to eq(
            newly_added_admins_number: 4,
            # When a moderator is promoted to admin, moderator count is decreased
            newly_added_moderators_number: -1
          )
        end
      end

      post 'web_api/v1/invites/count_new_seats' do
        with_options scope: :invites do
          parameter :emails, 'Array of e-mail addresses of invitees. E-mails can be null for anonymous invites', required: true
          parameter :roles, 'Roles for all invitees, defaults to normal user', required: false
        end

        it_behaves_like 'a request counting seats'
      end

      post 'web_api/v1/invites/count_new_seats_xlsx' do
        with_options scope: :invites do
          parameter :xlsx, 'Base64 encoded xlsx file with invite details. See web_api/v1/invites/example_xlsx for the format', required: true
          parameter :roles, 'Roles for invitees without a specified admin column in xlsx, default to no roles', required: false
        end

        let(:xlsx) do
          hash_array = emails.map { |email| { email: email, admin: true } }
          xlsx_stringio = XlsxService.new.hash_array_to_xlsx(hash_array)

          "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,#{Base64.encode64(xlsx_stringio.read)}"
        end

        it_behaves_like 'a request counting seats'
      end
    end

    post 'web_api/v1/invites/bulk_create' do
      with_options scope: :invites do
        parameter :emails, 'Array of e-mail addresses of invitees. E-mails can be null for anonymous invites', required: true
        parameter :locale, 'Locale for all invitees, defaults to first tenant locale', required: false
        parameter :roles, 'Roles for all invitees, defaults to normal user', required: false
        parameter :group_ids, 'Array of group ids that the invitees will be member of, defaults to none', required: false
        parameter :invite_text, 'Optional text that will be included in the outgoing e-mail to the invitee. Supports limited HTML', required: false
      end
      with_options scope: :errors do
        response_field 'error', "One of #{Invites::ErrorStorage::INVITE_ERRORS.except(:unparseable_excel, :malformed_admin_value, :malformed_groups_value).values.join(', ')}"
        response_field 'row', 'The index of the emails value that caused the error, starting from 0'
        response_field 'rows', 'The indexes of the emails that caused the errors, if applicable'
        response_field 'value', 'The value that caused the error, if applicable'
        response_field 'raw_error', 'Extra internal error information, if available'
      end

      describe do
        let(:emails) { Array.new(5) { Faker::Internet.email }.push(nil) }
        let(:group_ids) { [create(:group).id] }
        let(:project) { create(:project) }
        let(:locale) { 'nl-NL' }
        let(:invite_text) { 'Welcome, my friend!' }

        let(:roles) do
          [
            { 'type' => 'admin' },
            { 'type' => 'project_moderator', 'project_id' => project.id }
          ]
        end

        example_request 'Bulk invite multiple users' do
          aggregate_failures 'testing response' do
            assert_status 200
            expect(Invite.count).to eq 6
            expect(Invite.all.map { |i| i.invitee.email }).to match_array emails
            expect(Invite.all.map { |i| i.invitee.groups.map(&:id) }.uniq).to match_array [group_ids]
            expect(Invite.all.map { |i| i.invitee.admin? }.uniq).to eq [true]
            expect(Invite.all.map { |i| i.invitee.locale }.uniq).to eq [locale]
            expect(Invite.all.map { |i| i.invitee.project_moderator?(project.id) }.all?).to be true
          end
        end
      end

      describe do
        let(:emails) do
          [
            'someemail@somedomain.net',
            'someemail@somedomain.net',
            'user_at_domain.com',
            create(:user).email,
            create(:invite).invitee.email
          ]
        end

        example_request '[error] Bulk invite multiple users' do
          assert_status 422
          json_response = json_parse(response_body)
          expect(json_response[:errors].pluck(:error).uniq).to match_array %w[emails_duplicate invalid_email]
        end
      end
    end

    post 'web_api/v1/invites/bulk_create_xlsx' do
      with_options scope: :invites do
        parameter :xlsx, 'Base64 encoded xlsx file with invite details. See web_api/v1/invites/example_xlsx for the format', required: true
        parameter :locale, 'Locale for invitees without a specified locale in xlsx, defaults to first tenant locale', required: false
        parameter :roles, 'Roles for invitees without a specified admin column in xlsx, default to no roles', required: false
        parameter :group_ids, 'Group ids for invitiees without a specified groups column in xlsx, defaults to none', required: false
        parameter :invite_text, 'Optional text that will be included in the outgoing e-mail to the invitee. Supports limited HTML', required: false
      end

      with_options scope: :errors do
        response_field 'error', "One of #{Invites::ErrorStorage::INVITE_ERRORS.values.join(', ')}"
        response_field 'row', 'The row number of the error, if applicable'
        response_field 'rows', 'The row numbers of the error, if applicable'
        response_field 'value', 'The value that appeared in the excel file and caused the error, if applicable'
        response_field 'raw_error', 'Extra internal error information, if available'
      end

      let(:xlsx) do
        xlsx_stringio = XlsxService.new.hash_array_to_xlsx(hash_array)

        "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,#{Base64.encode64(xlsx_stringio.read)}"
      end

      describe do
        let(:users) { build_list(:user, 6) }
        let(:hash_array) do
          users.map.with_index do |user, i|
            {
              email: user.email,
              first_name: rand(3) == 0 ? user.first_name : nil,
              last_name: rand(3) == 0 ? user.last_name : nil,
              language: i == 0 ? 'nl-NL' : nil,
              admin: i == 0 ? true : nil,
              groups: i == 0 ? create(:group).title_multiloc.values.first : nil
            }
          end
        end
        let(:group_ids) { [create(:group).id] }
        let(:roles) { [{ 'type' => 'admin' }] }
        let(:locale) { 'en' }
        let(:invite_text) { 'Welcome, my friend!' }

        example_request 'Bulk invite multiple users with xlsx file' do
          assert_status 200
          expect(Invite.count).to eq 6
          expect(Invite.all.map { |i| i.invitee.email }).to match_array hash_array.pluck(:email)
          expect(Invite.all.map { |i| i.invitee.groups.map(&:id) }.flatten.uniq).to match_array Group.all.map(&:id)
          expect(Invite.all.map { |i| i.invitee.admin? }.uniq).to eq [true]
          expect(Invite.all.map { |i| i.invitee.locale }.uniq).to match_array ['nl-NL', locale]
        end
      end

      describe do
        let(:hash_array) do
          [
            { email: 'someemail@somedomain.net' },
            { email: 'someemail@somedomain.net' },
            { email: 'user_at_domain.com' },
            { email: create(:user).email },
            { email: create(:invite).invitee.email },
            { locale: 'qq' },
            { groups: 'A positive' },
            { groups: 24 },
            { admin: 'nope' }
          ]
        end

        example_request '[error] Bulk invite users with xlsx file' do
          assert_status 422
          json_response = json_parse(response_body)
          expect(json_response[:errors].pluck(:error).uniq).to match_array %w[unknown_group malformed_groups_value malformed_admin_value emails_duplicate invalid_email unknown_locale]
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
    end
  end
end
