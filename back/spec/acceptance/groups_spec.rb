# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Groups' do
  explanation 'Collections of users can be given aditional permissions (i.e. access to certain projects) through groups.'

  before do
    header 'Content-Type', 'application/json'
    @groups = create_list(:group, 3)
    create(:smart_group)
  end

  context 'when authenticated' do
    before do
      @user = create(:admin, email: 'hello@citizenlab.co')
      token = Knock::AuthToken.new(payload: @user.to_token_payload).token
      header 'Authorization', "Bearer #{token}"
    end

    get 'web_api/v1/groups' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of groups per page'
      end
      parameter :membership_type,
        "If set, only return groups of given membership_type. Either #{Group.membership_types.join(' or ')}", required: false

      example 'List all groups' do
        g1 = create(:group)
        do_request
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 5
        expect(json_response[:data][0][:id]).to eq g1.id
      end

      example "List all groups with membership_type 'rules'" do
        do_request(membership_type: 'rules')
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 1
      end
    end

    get 'web_api/v1/groups/:id' do
      let(:id) { @groups.first.id }

      example_request 'Get one group by id' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq @groups.first.id
      end
    end

    post 'web_api/v1/groups' do
      with_options scope: :group do
        parameter :title_multiloc, 'The title of the group in multiple locales', required: true
        parameter :membership_type,
          "Whether members are manually or automatically added. Either #{Group.membership_types.join(', ')}. Defaults to 'manual'"
        parameter :rules,
          "In case of 'rules' membership type, the user criteria to be a member. Conforms to this json schema: #{JSON.pretty_generate(SmartGroups::RulesService.new.generate_rules_json_schema)}"
      end
      ValidationErrorHelper.new.error_fields(self, Group)

      describe do
        let(:group) { build(:group) }
        let(:title_multiloc) { group.title_multiloc }
        let(:membership_type) { 'manual' }

        example_request "Create a group with 'manual' membership_type" do
          expect(response_status).to eq 201
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :attributes, :title_multiloc).stringify_keys).to match title_multiloc
          expect(json_response.dig(:data, :attributes, :membership_type)).to eq 'manual'
        end
      end

      describe do
        let(:group) { build(:group) }
        let(:title_multiloc) { group.title_multiloc }
        let(:membership_type) { 'rules' }
        let(:rules) { [{ ruleType: 'role', predicate: 'is_admin' }] }

        example_request "Create a group with 'rules' membership_type" do
          expect(response_status).to eq 201
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :attributes, :title_multiloc).stringify_keys).to match title_multiloc
          expect(json_response.dig(:data, :attributes, :membership_type)).to eq 'rules'
          expect(json_response.dig(:data, :attributes, :rules)).to match rules
        end
      end

      describe do
        before do
          create(:user, email: 'k@k.com')
          create(:user, email: 'kk@kk.com').update!(registration_completed_at: nil)
        end

        let(:title_multiloc) { build(:group).title_multiloc }
        let(:membership_type) { 'rules' }
        let(:rules) { [{ ruleType: 'email', predicate: 'contains', value: 'k' }] }

        example 'Membership count should only count active users', document: false do
          do_request
          expect(response_status).to eq 201
          json_response = json_parse(response_body)
          group = Group.find json_response.dig(:data, :id)
          expect(group.memberships_count).to eq 1
        end
      end
    end

    patch 'web_api/v1/groups/:id' do
      with_options scope: :group do
        parameter :title_multiloc, 'The title of the group in multiple locales'
        parameter :membership_type,
          "Whether members are manually or automatically added. Either #{Group.membership_types.join(', ')}"
        parameter :rules,
          "In case of 'rules' membership type, the user criteria to be a member. Conforms to this json schema: #{JSON.pretty_generate(SmartGroups::RulesService.new.generate_rules_json_schema)}"
      end
      ValidationErrorHelper.new.error_fields(self, Group)

      let(:group) { create(:group) }
      let(:id) { group.id }
      let(:title_multiloc) { build(:group).title_multiloc }

      example_request 'Update a group' do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :title_multiloc).stringify_keys).to match title_multiloc
      end
    end

    delete 'web_api/v1/groups/:id' do
      let(:group) { create(:group) }
      let(:id) { group.id }

      example_request 'Delete a group' do
        expect(response_status).to eq 200
        expect { Group.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end
end
