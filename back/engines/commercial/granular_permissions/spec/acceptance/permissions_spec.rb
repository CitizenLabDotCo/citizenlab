# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Permissions' do
  explanation 'These determine who (e.g. groups) can take which actions (e.g. posting, voting) in a participation context'

  before do
    header 'Content-Type', 'application/json'
    @project = create(:continuous_project)
    @phase = ParticipationContextService.new.get_participation_context(create(:project_with_current_phase))
    PermissionsService.new.update_all_permissions
  end

  let(:project_id) { @project.id }
  let(:phase_id) { @phase.id }

  context 'when admin' do
    before do
      @admin = create(:admin)
      token = Knock::AuthToken.new(payload: @admin.to_token_payload).token
      header 'Authorization', "Bearer #{token}"
    end

    get 'web_api/v1/projects/:project_id/permissions' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of permissions per page'
      end

      example_request 'List all permissions of a project' do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq Permission.available_actions(@project).size
      end
    end

    get 'web_api/v1/phases/:phase_id/permissions' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of permissions per page'
      end

      example_request 'List all permissions of a phase' do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq Permission.available_actions(@phase).size
      end
    end

    get 'web_api/v1/permissions' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of permissions per page'
      end

      example_request 'List all global permissions' do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq Permission.available_actions(nil).size
      end
    end

    get 'web_api/v1/projects/:project_id/permissions/:action' do
      let(:action) { @project.permissions.first.action }

      example_request 'Get one permission by action' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq @project.permissions.first.id
      end
    end

    get 'web_api/v1/phases/:phase_id/permissions/:action' do
      let(:action) { @phase.permissions.first.action }

      example_request 'Get one permission by action' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq @phase.permissions.first.id
      end
    end

    get 'web_api/v1/permissions/:action' do
      let(:action) { 'posting_initiative' }

      example_request 'Get one global permission by action' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq Permission.find_by!(permission_scope: nil, action: action).id
      end
    end

    patch 'web_api/v1/projects/:project_id/permissions/:action' do
      with_options scope: :permission do
        parameter :permitted_by, "Defines who is granted permission, either #{Permission::PERMITTED_BIES.join(',')}.", required: false
        parameter :group_ids, "An array of group id's associated to this permission", required: false
      end
      ValidationErrorHelper.new.error_fields(self, Permission)

      let(:action) { @project.permissions.first.action }
      let(:permitted_by) { 'groups' }
      let(:group_ids) { create_list(:group, 3, projects: [@project]).map(&:id) }

      example_request 'Update a permission' do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :permitted_by)).to eq permitted_by
        expect(json_response.dig(:data, :relationships, :groups, :data).pluck(:id)).to match_array group_ids
      end
    end

    patch 'web_api/v1/phases/:phase_id/permissions/:action' do
      with_options scope: :permission do
        parameter :permitted_by, "Defines who is granted permission, either #{Permission::PERMITTED_BIES.join(',')}.", required: false
        parameter :group_ids, "An array of group id's associated to this permission", required: false
      end
      ValidationErrorHelper.new.error_fields(self, Permission)

      let(:action) { @phase.permissions.first.action }
      let(:permitted_by) { 'groups' }
      let(:group_ids) { create_list(:group, 3, projects: [@phase.project]).map(&:id) }

      example_request 'Update a permission' do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :permitted_by)).to eq permitted_by
        expect(json_response.dig(:data, :relationships, :groups, :data).pluck(:id)).to match_array group_ids
      end
    end

    patch 'web_api/v1/permissions/:action' do
      with_options scope: :permission do
        parameter :permitted_by, "Defines who is granted permission, either #{Permission::PERMITTED_BIES.join(',')}.", required: false
        parameter :group_ids, "An array of group id's associated to this permission", required: false
      end
      ValidationErrorHelper.new.error_fields(self, Permission)

      let(:action) { 'voting_initiative' }
      let(:permitted_by) { 'groups' }
      let(:group_ids) { create_list(:group, 3).map(&:id) }

      example_request 'Update a global permission' do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :permitted_by)).to eq permitted_by
        expect(json_response.dig(:data, :relationships, :groups, :data).pluck(:id)).to match_array group_ids
      end
    end
  end

  context 'when resident' do
    before do
      @user = create(:user)
      header_token_for @user
    end

    get 'web_api/v1/projects/:project_id/permissions/:action/participation_conditions' do
      before do
        @rule = { 'ruleType' => 'email', 'predicate' => 'ends_on', 'value' => 'test.com' }
        @groups = [create(:group), create(:smart_group, rules: [@rule])]
        @permission = @project.permissions.first
        @permission.update!(permitted_by: 'groups', groups: @groups)
      end

      let(:action) { @permission.action }

      example_request 'Get the participation conditions of a user' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response).to eq [[SmartGroups::RulesService.new.parse_json_rule(@rule).description_multiloc.symbolize_keys]]
      end
    end

    get 'web_api/v1/phases/:phase_id/permissions/:action/participation_conditions' do
      before do
        @rule = { 'ruleType' => 'email', 'predicate' => 'ends_on', 'value' => 'test.com' }
        @groups = [create(:group), create(:smart_group, rules: [@rule])]
        @permission = @phase.permissions.first
        @permission.update!(permitted_by: 'groups', groups: @groups)
      end

      let(:action) { @permission.action }

      example_request 'Get the participation conditions of a user' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response).to eq [[SmartGroups::RulesService.new.parse_json_rule(@rule).description_multiloc.symbolize_keys]]
      end
    end

    get 'web_api/v1/phases/:phase_id/permissions/:action/requirements' do
      before do
        @permission = @phase.permissions.first
        @permission.update!(permitted_by: 'everyone_confirmed_email')
        create(:custom_field_birthyear, required: true)
        create(:custom_field_gender, required: false)
        create(:custom_field_checkbox, resource_type: 'User', required: true, key: 'extra_field')

        @user.update!(
          email: 'my@email.com',
          first_name: 'Jack',
          last_name: nil,
          password_digest: nil,
          email_confirmed_at: nil,
          custom_field_values: { 'gender' => 'male' }
        )
      end

      let(:action) { @permission.action }

      example_request 'Get the participation requirements of a user' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response).to eq({
          permitted: false,
          requirements: {
            built_in: {
              first_name: 'satisfied',
              last_name: 'dont_ask',
              email: 'satisfied'
            },
            custom_fields: {
              birthyear: 'dont_ask',
              gender: 'satisfied',
              extra_field: 'dont_ask'
            },
            special: {
              password: 'dont_ask',
              confirmation: 'require'
            }
          }
        })
      end
    end
  end
end
