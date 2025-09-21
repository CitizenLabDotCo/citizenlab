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
        let(:project) { create(:project) }

        let(:emails) { Array.new(5) { Faker::Internet.email }.push(nil) }
        let(:locale) { 'nl-NL' }
        let(:group_ids) { [create(:group).id] }
        let(:invite_text) { 'Welcome, my friend!' }
        let(:roles) do
          # only the highest role is actually used
          [
            { 'type' => 'admin' },
            { 'type' => 'project_moderator', 'project_id' => project.id }
          ]
        end

        example 'Returns details of a newly created invites_import record' do
          invites_imports_count = InvitesImport.count
          do_request
          assert_status 200

          expect(response_data[:attributes][:completed_at]).to be_nil
          expect(response_data[:attributes][:result]).to eq({})
          expect(response_data[:attributes][:created_at]).to be_present
          expect(response_data[:attributes][:updated_at]).to be_present
          expect(InvitesImport.count).to eq(invites_imports_count + 1)

          invites_import = InvitesImport.find(response_data[:id])
          expect(invites_import).to be_present
          expect(invites_import.importer).to eq(@user)
        end

        example 'Results in the expected CountNewSeatsJob' do
          expect { do_request }.to have_enqueued_job(Invites::CountNewSeatsJob)
            .with(
              @user,
              satisfy { |params|
                # For XLSX invites endpoint
                if defined?(xlsx)
                  expect(params).to include(:xlsx)
                  expect(params[:xlsx]).to start_with('data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,')
                  expect(params[:roles]).to eq(roles) if params[:roles].present?
                # For regular invites endpoint
                else
                  pp params
                  expect(params).to include(:emails, :roles)
                  expect(params[:emails]).to match_array(emails)
                  expect(params[:roles]).to eq(roles)
                end

                expect(params[:group_ids]).to eq(group_ids)
                expect(params[:locale]).to eq(locale)
                expect(params[:invite_text]).to eq(invite_text)

                true # Return true for the matcher to pass
              },
              kind_of(String), # Match any string ID
              defined?(xlsx) ? { xlsx_import: true } : { xlsx_import: false }
            )
            .on_queue('default')

          assert_status 200

          # For extra verification, check that the last enqueued job has the correct import ID
          job = ActiveJob::Base.queue_adapter.enqueued_jobs.last
          expect(job['arguments'][2]).to eq(response_data[:id])
        end
      end

      post 'web_api/v1/invites/count_new_seats' do
        with_options scope: :invites do
          parameter :emails, 'Array of e-mail addresses of invitees. E-mails can be null for anonymous invites', required: true
          parameter :roles, 'Roles for all invitees, defaults to normal user', required: false
          parameter :locale, 'Locale for all invitees, defaults to first tenant locale', required: false
          parameter :group_ids, 'Array of group ids that the invitees will be member of, defaults to none', required: false
          parameter :invite_text, 'Optional text that will be included in the outgoing e-mail to the invitee. Supports limited HTML', required: false
        end

        it_behaves_like 'a request counting seats'
      end

      post 'web_api/v1/invites/count_new_seats_xlsx' do
        with_options scope: :invites do
          parameter :xlsx, 'Base64 encoded xlsx file with invite details. See web_api/v1/invites/example_xlsx for the format', required: true
          parameter :roles, 'Roles for invitees without a specified admin column in xlsx, default to no roles', required: false
          parameter :locale, 'Locale for all invitees, defaults to first tenant locale', required: false
          parameter :group_ids, 'Array of group ids that the invitees will be member of, defaults to none', required: false
          parameter :invite_text, 'Optional text that will be included in the outgoing e-mail to the invitee. Supports limited HTML', required: false
        end

        let(:xlsx) do
          hash_array = emails.map { |email| { email: email, admin: true } }
          xlsx_stringio = XlsxService.new.hash_array_to_xlsx(hash_array)

          "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,#{Base64.encode64(xlsx_stringio.read)}"
        end

        it_behaves_like 'a request counting seats'
      end
    end

    describe 'bulk_create' do
      shared_examples 'a request that triggers the BulkCreateJob' do
        let(:project) { create(:project) }

        let(:emails) { Array.new(5) { Faker::Internet.email }.push(nil) }
        let(:locale) { 'nl-NL' }
        let(:group_ids) { [create(:group).id] }
        let(:invite_text) { 'Welcome, my friend!' }
        let(:roles) do
          # only the highest role is actually used
          [
            { 'type' => 'admin' },
            { 'type' => 'project_moderator', 'project_id' => project.id }
          ]
        end

        example 'Returns details of a newly created invites_import record' do
          invites_imports_count = InvitesImport.count
          do_request
          assert_status 200

          expect(response_data[:attributes][:completed_at]).to be_nil
          expect(response_data[:attributes][:result]).to eq({})
          expect(response_data[:attributes][:created_at]).to be_present
          expect(response_data[:attributes][:updated_at]).to be_present
          expect(InvitesImport.count).to eq(invites_imports_count + 1)

          invites_import = InvitesImport.find(response_data[:id])
          expect(invites_import).to be_present
          expect(invites_import.importer).to eq(@user)
        end

        example 'Results in the expected BulkCreateJob' do
          expect { do_request }.to have_enqueued_job(Invites::BulkCreateJob)
            .with(
              @user,
              satisfy { |params|
                # For XLSX invites endpoint
                if defined?(xlsx)
                  expect(params).to include(:xlsx)
                  expect(params[:xlsx]).to start_with('data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,')
                  expect(params[:roles]).to eq(roles) if params[:roles].present?
                # For regular invites endpoint
                else
                  expect(params).to include(:emails, :roles)
                  expect(params[:emails]).to match_array(emails)
                  expect(params[:roles]).to eq(roles)
                end

                expect(params[:group_ids]).to eq(group_ids)
                expect(params[:locale]).to eq(locale)
                expect(params[:invite_text]).to eq(invite_text)

                true # Return true for the matcher to pass
              },
              kind_of(String), # Match any string ID
              defined?(xlsx) ? { xlsx_import: true } : { xlsx_import: false }
            )
            .on_queue('default')

          assert_status 200

          # For extra verification, check that the last enqueued job has the correct import ID
          job = ActiveJob::Base.queue_adapter.enqueued_jobs.last
          expect(job['arguments'][2]).to eq(response_data[:id])
        end
      end

      post 'web_api/v1/invites/bulk_create' do
        with_options scope: :invites do
          parameter :emails, 'Array of e-mail addresses of invitees. E-mails can be null for anonymous invites', required: true
          parameter :roles, 'Roles for all invitees, defaults to normal user', required: false
          parameter :locale, 'Locale for all invitees, defaults to first tenant locale', required: false
          parameter :group_ids, 'Array of group ids that the invitees will be member of, defaults to none', required: false
          parameter :invite_text, 'Optional text that will be included in the outgoing e-mail to the invitee. Supports limited HTML', required: false
        end

        it_behaves_like 'a request that triggers the BulkCreateJob'
      end

      post 'web_api/v1/invites/bulk_create_xlsx' do
        with_options scope: :invites do
          parameter :xlsx, 'Base64 encoded xlsx file with invite details. See web_api/v1/invites/example_xlsx for the format', required: true
          parameter :roles, 'Roles for invitees without a specified admin column in xlsx, default to no roles', required: false
          parameter :locale, 'Locale for all invitees, defaults to first tenant locale', required: false
          parameter :group_ids, 'Array of group ids that the invitees will be member of, defaults to none', required: false
          parameter :invite_text, 'Optional text that will be included in the outgoing e-mail to the invitee. Supports limited HTML', required: false
        end

        let(:xlsx) do
          hash_array = emails.map { |email| { email: email, admin: true } }
          xlsx_stringio = XlsxService.new.hash_array_to_xlsx(hash_array)

          "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,#{Base64.encode64(xlsx_stringio.read)}"
        end

        it_behaves_like 'a request that triggers the BulkCreateJob'
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
