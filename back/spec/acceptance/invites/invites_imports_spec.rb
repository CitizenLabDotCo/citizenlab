require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'InvitesImports' do
  header 'Content-Type', 'application/json'

  shared_examples 'a Show request by an unauthorized user' do
    get 'web_api/v1/invites_imports/:id' do
      example_request 'Unauthorized user cannot get an invites_import by id' do
        expect(status).to eq 401
      end
    end
  end

  shared_examples 'a count_new_seats request by an unauthorized user' do
    post 'web_api/v1/invites_imports/count_new_seats' do
      example_request 'Unauthorized user cannot count new seats' do
        expect(status).to eq 401
      end
    end
  end

  shared_examples 'a count_new_seats_xlsx request by an unauthorized user' do
    post 'web_api/v1/invites_imports/count_new_seats_xlsx' do
      example_request 'Unauthorized user cannot count new seats XLSX' do
        expect(status).to eq 401
      end
    end
  end

  shared_examples 'a bulk_create request by an unauthorized user' do
    post 'web_api/v1/invites_imports/bulk_create' do
      example_request 'Unauthorized user cannot bulk create invites' do
        expect(status).to eq 401
      end
    end
  end

  shared_examples 'a bulk_create_xlsx request by an unauthorized user' do
    post 'web_api/v1/invites_imports/bulk_create_xlsx' do
      example_request 'Unauthorized user cannot bulk create invites from XLSX' do
        expect(status).to eq 401
      end
    end
  end

  let(:invites_import1) do
    create(
      :invites_import,
      result: {
        newly_added_admins_number: 9,
        newly_added_moderators_number: 0
      },
      job_type: 'count_new_seats_xlsx',
      completed_at: Time.zone.now
    )
  end

  let(:_invites_import2) { create(:invites_import) }
  let(:id) { invites_import1.id }

  context 'when admin' do
    before do
      @user = create(:admin)
      header_token_for @user
    end

    get 'web_api/v1/invites_imports/:id' do
      example_request 'Get one invites_import by id' do
        expect(status).to eq 200

        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq(id)
        expect(json_response.dig(:data, :attributes, :result)).to eq(
          newly_added_admins_number: 9,
          newly_added_moderators_number: 0
        )
        expect(json_response.dig(:data, :attributes, :job_type)).to eq('count_new_seats_xlsx')
        expect { Time.iso8601(json_response.dig(:data, :attributes, :completed_at)) }.not_to raise_error
      end
    end

    describe 'count new seats' do
      shared_examples 'a request counting new seats' do
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

          expect(response_data[:attributes][:completed_at]).to be_nil
          expect(response_data[:attributes][:result]).to eq({})
          if defined?(xlsx)
            expect(response_data[:attributes][:job_type]).to eq('count_new_seats_xlsx')
          else
            expect(response_data[:attributes][:job_type]).to eq('count_new_seats')
          end
        end
      end

      post 'web_api/v1/invites_imports/count_new_seats' do
        with_options scope: :invites do
          parameter :emails, 'Array of e-mail addresses of invitees. E-mails can be null for anonymous invites', required: true
          parameter :roles, 'Roles for all invitees, defaults to normal user', required: false
          parameter :locale, 'Locale for all invitees, defaults to first tenant locale', required: false
          parameter :group_ids, 'Array of group ids that the invitees will be member of, defaults to none', required: false
          parameter :invite_text, 'Optional text that will be included in the outgoing e-mail to the invitee. Supports limited HTML', required: false
        end

        it_behaves_like 'a request counting new seats'
      end

      post 'web_api/v1/invites_imports/count_new_seats_xlsx' do
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

        it_behaves_like 'a request counting new seats'
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

      post 'web_api/v1/invites_imports/bulk_create' do
        with_options scope: :invites do
          parameter :emails, 'Array of e-mail addresses of invitees. E-mails can be null for anonymous invites', required: true
          parameter :roles, 'Roles for all invitees, defaults to normal user', required: false
          parameter :locale, 'Locale for all invitees, defaults to first tenant locale', required: false
          parameter :group_ids, 'Array of group ids that the invitees will be member of, defaults to none', required: false
          parameter :invite_text, 'Optional text that will be included in the outgoing e-mail to the invitee. Supports limited HTML', required: false
        end

        it_behaves_like 'a request that triggers the BulkCreateJob'
      end

      post 'web_api/v1/invites_imports/bulk_create_xlsx' do
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
  end

  context 'when project moderator' do
    before do
      moderator = create(:project_moderator)
      header_token_for(moderator)
    end

    it_behaves_like 'a Show request by an unauthorized user'
    it_behaves_like 'a count_new_seats request by an unauthorized user'
    it_behaves_like 'a count_new_seats_xlsx request by an unauthorized user'
    it_behaves_like 'a bulk_create request by an unauthorized user'
    it_behaves_like 'a bulk_create_xlsx request by an unauthorized user'
  end

  context 'when regular user' do
    before do
      user = create(:user)
      header_token_for(user)
    end

    it_behaves_like 'a Show request by an unauthorized user'
    it_behaves_like 'a count_new_seats request by an unauthorized user'
    it_behaves_like 'a count_new_seats_xlsx request by an unauthorized user'
    it_behaves_like 'a bulk_create request by an unauthorized user'
    it_behaves_like 'a bulk_create_xlsx request by an unauthorized user'
  end

  context 'when not logged in' do
    it_behaves_like 'a Show request by an unauthorized user'
    it_behaves_like 'a count_new_seats request by an unauthorized user'
    it_behaves_like 'a count_new_seats_xlsx request by an unauthorized user'
    it_behaves_like 'a bulk_create request by an unauthorized user'
    it_behaves_like 'a bulk_create_xlsx request by an unauthorized user'
  end
end
