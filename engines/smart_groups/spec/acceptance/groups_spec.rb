require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Groups' do
  explanation 'Collections of users can be given aditional permissions (i.e. access to certain projects) through groups.'

  before do
    header 'Content-Type', 'application/json'
    @groups = create_list(:smart_group, 4)
  end

  context 'when authenticated' do
    before do
      admin_header_token
    end

    get 'web_api/v1/groups' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of groups per page'
      end

      example "List all groups with membership_type 'rules'" do
        do_request(membership_type: 'rules')
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 4
      end
    end

    post 'web_api/v1/groups' do
      with_options scope: :group do
        parameter :rules,
                  "In case of 'rules' membership type, the user criteria to be a member. Conforms to this json schema: #{JSON.pretty_generate(SmartGroupsService.new.generate_rules_json_schema)}"
      end
      ValidationErrorHelper.new.error_fields(self, Group)

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
          member = create(:user, email: 'k@k.com', registration_completed_at: Time.now)
          not_really_member = create(:user, email: 'kk@kk.com', registration_completed_at: nil)
        end

        let(:title_multiloc) { build(:group).title_multiloc }
        let(:membership_type) { 'rules' }
        let(:rules) { [{ ruleType: 'email', predicate: 'contains', value: 'k' }] }

        example_request 'Membership count should only count active users', document: false do
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
                  "Whether members are manually or automatically added. Either #{Group::MEMBERSHIP_TYPES.join(', ')}"
        parameter :rules,
                  "In case of 'rules' membership type, the user criteria to be a member. Conforms to this json schema: #{JSON.pretty_generate(SmartGroupsService.new.generate_rules_json_schema)}"
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
  end
end
