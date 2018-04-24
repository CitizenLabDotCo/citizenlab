require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Groups" do
  before do
    header "Content-Type", "application/json"
    @groups = create_list(:group, 3)
  end

  context "when authenticated" do
    before do
      @user = create(:admin)
      token = Knock::AuthToken.new(payload: { sub: @user.id }).token
      header 'Authorization', "Bearer #{token}"
    end

    get "web_api/v1/groups" do
      with_options scope: :page do
        parameter :number, "Page number"
        parameter :size, "Number of groups per page"
      end

      example_request "List all groups" do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 3
      end
    
    end

    get "web_api/v1/groups/:id" do
      let(:id) { @groups.first.id }

      example_request "Get one group by id" do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq @groups.first.id
      end
    end

    post "web_api/v1/groups" do
      with_options scope: :group do
        parameter :title_multiloc, "The title of the group in multiple locales", required: true
        parameter :membership_type, "Whether members are manually or automatically added. Either #{Group::MEMBERSHIP_TYPES.join(', ')}. Defaults to 'manual'"
        parameter :rules, "In case of 'rules' membership type, the user criteria to be a member. Conforms to this json schema: #{SmartGroupsService.new.generate_rules_json_schema}"
      end
      ValidationErrorHelper.new.error_fields(self, Group)

      let(:group) { build(:group) }

      describe do
        let(:title_multiloc) { group.title_multiloc }
        let(:membership_type) { 'manual' }

        example_request "Create a group with 'manual' membership_type" do
          expect(response_status).to eq 201
          json_response = json_parse(response_body)
          expect(json_response.dig(:data,:attributes,:title_multiloc).stringify_keys).to match title_multiloc
          expect(json_response.dig(:data,:attributes,:membership_type)).to eq 'manual'
        end
      end

      describe do
        let(:title_multiloc) { group.title_multiloc }
        let(:membership_type) { 'rules' }
        let(:rules) { [{ ruleType: 'role', predicate: 'is_admin' }] }

        example_request "Create a group with 'rules' membership_type" do
          expect(response_status).to eq 201
          json_response = json_parse(response_body)
          expect(json_response.dig(:data,:attributes,:title_multiloc).stringify_keys).to match title_multiloc
          expect(json_response.dig(:data,:attributes,:membership_type)).to eq 'rules'
          expect(json_response.dig(:data,:attributes,:rules)).to match rules
        end
      end
    end

    patch "web_api/v1/groups/:id" do
      with_options scope: :group do
        parameter :title_multiloc, "The title of the group in multiple locales"
        parameter :membership_type, "Whether members are manually or automatically added. Either #{Group::MEMBERSHIP_TYPES.join(', ')}"
        parameter :rules, "In case of 'rules' membership type, the user criteria to be a member. Conforms to this json schema: #{SmartGroupsService.new.generate_rules_json_schema}"
      end
      ValidationErrorHelper.new.error_fields(self, Group)


      let(:group) { create(:group) }
      let(:id) { group.id }
      let(:title_multiloc) { build(:group).title_multiloc }

      example_request "Update a group" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:attributes,:title_multiloc).stringify_keys).to match title_multiloc
      end
    end

    delete "web_api/v1/groups/:id" do
      let(:group) { create(:group) }
      let(:id) { group.id }
      example_request "Delete a group" do
        expect(response_status).to eq 200
        expect{Group.find(id)}.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

  end
end 