# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Moderators' do
  explanation 'Moderators can manage (e.g. changing phases, ideas) only certain projects.'

  let!(:project) { create(:project) }
  let!(:same_project_moderators) { create_list(:project_moderator, 5, projects: [project]) }
  let!(:other_project) { create(:project) }
  let!(:other_project_moderators) { create_list(:project_moderator, 2, projects: [other_project]) }

  before { header 'Content-Type', 'application/json' }

  context 'as a project moderator' do
    let!(:moderator) { create(:project_moderator, projects: [project]) }

    before { header_token_for(moderator) }

    get 'web_api/v1/projects/:project_id/moderators' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of members per page'
      end

      let(:project_id) { project.id }

      example_request 'List all moderators of a project' do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq same_project_moderators.size + 1
      end

      example "[error] List all moderators of a project you don't moderate" do
        do_request project_id: other_project.id
        expect(status).to eq(401)
      end
    end

    get 'web_api/v1/projects/:project_id/moderators/:user_id' do
      ValidationErrorHelper.new.error_fields(self, User)

      let(:project_id) { project.id }
      let(:user_id) { other_project_moderators.first.id }

      example_request 'Get one moderator by id' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq other_project_moderators.first.id
      end
    end

    post 'web_api/v1/projects/:project_id/moderators' do
      with_options scope: :moderator do
        parameter :user_id, 'The id of user to become moderator.', required: false
        parameter :user_email, 'The email of user to become moderator.', required: false
      end
      ValidationErrorHelper.new.error_fields(self, User)

      let(:project_id) { project.id }

      shared_examples 'adding a moderator' do
        example_request 'Add a moderator role' do
          expect(response_status).to eq 201
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :id)).to eq test_user.id
          expect(LogActivityJob).to have_been_enqueued.with(test_user, 'project_moderation_rights_received', moderator, kind_of(Integer), payload: { project_id: project.id })
        end

        context 'with limited seats' do
          before do
            config = AppConfiguration.instance
            config.settings['core']['maximum_moderators_number'] = User.billed_moderators.count + 1
            config.settings['core']['additional_moderators_number'] = 0
            config.save!
          end

          context 'when limit is reached' do
            before { create(:project_moderator) } # to reach the limit

            example_request 'Increments additional seats', document: false do
              assert_status 201
              expect(AppConfiguration.instance.settings['core']['additional_moderators_number']).to eq(1)
            end
          end

          example_request 'Does not increment additional seats if limit is not reached', document: false do
            assert_status 201
            expect(AppConfiguration.instance.settings['core']['additional_moderators_number']).to eq(0)
          end
        end
      end

      context 'with user_id' do
        let(:test_user) { create(:user) }
        let(:user_id) { test_user.id }

        include_examples 'adding a moderator'
      end

      context 'with user_email' do
        let(:test_user) { create(:user) }
        let(:user_email) { test_user.email }

        include_examples 'adding a moderator'
      end
    end

    delete 'web_api/v1/projects/:project_id/moderators/:user_id' do
      ValidationErrorHelper.new.error_fields(self, User)

      let(:project_id) { project.id }
      let(:user_id) { same_project_moderators.first.id }

      example 'Delete the moderator role of a user for a project' do
        n_roles_before = same_project_moderators.first.reload.roles.size
        do_request

        expect(response_status).to eq 401
        expect(same_project_moderators.first.reload.roles.size).to eq(n_roles_before)
      end
    end
  end

  context 'as an admin' do
    let(:admin) { create(:admin) }

    before { header_token_for(admin) }

    get 'web_api/v1/projects/:project_id/moderators' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of members per page'
      end

      let(:project_id) { project.id }

      example_request 'List all moderators of a project' do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq same_project_moderators.size
      end
    end

    get 'web_api/v1/projects/:project_id/moderators/:user_id' do
      ValidationErrorHelper.new.error_fields(self, User)

      let(:project_id) { project.id }
      let(:user_id) { other_project_moderators.first.id }

      example_request 'Get one moderator by id' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq other_project_moderators.first.id
      end
    end

    post 'web_api/v1/projects/:project_id/moderators' do
      with_options scope: :moderator do
        parameter :user_id, 'The id of user to become moderator.', required: false
        parameter :user_email, 'The email of user to become moderator.', required: false
      end
      ValidationErrorHelper.new.error_fields(self, User)

      let(:project_id) { project.id }
      let(:user) { create(:user) }
      let(:user_id) { user.id }

      example_request 'Add a moderator role' do
        expect(response_status).to eq 201

        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq user.id
        expect(user.reload.roles).to eq([{ 'type' => 'project_moderator', 'project_id' => project.id }])
        expect(LogActivityJob).to have_been_enqueued.with(user, 'project_moderation_rights_received', admin, kind_of(Integer), payload: { project_id: project.id })
      end
    end

    delete 'web_api/v1/projects/:project_id/moderators/:user_id' do
      ValidationErrorHelper.new.error_fields(self, User)

      let(:project_id) { project.id }
      let(:user_id) { same_project_moderators.first.id }

      example 'Delete the moderator role of a user for a project' do
        n_roles_before = same_project_moderators.first.reload.roles.size
        do_request

        expect(response_status).to eq 200
        expect(same_project_moderators.first.reload.roles.size).to eq(n_roles_before - 1)
        expect(LogActivityJob).to have_been_enqueued.with(same_project_moderators.first, 'project_moderation_rights_removed', admin, kind_of(Integer), payload: { project_id: project.id })
      end
    end
  end
end
