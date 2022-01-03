require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "Avatars" do

  explanation "Avatars are user images user setup in their profile. To edit them, use the users endpoints"

  before do
    header "Content-Type", "application/json"
    @user_without_avatar = create(:user, avatar: nil)
    @users_with_avatar = create_list(:user, 6)
  end

  get "web_api/v1/avatars" do

    parameter :limit, "Number of avatars to return. Defaults to 5. Maximum 10.", default: false
    parameter :context_type, "The context used to look for users. Either 'group', 'project' or 'idea'. Don't specify to not limit the context.", required: false
    parameter :context_id, "The context used to look for users. A valid ID for the given context_type", required: false

    response_field :total, "The total count of users in the given context, including those without avatar", scope: :meta

    example_request "List random user avatars" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 5
      expect(json_response.dig(:data).map{|d| d.dig(:attributes, :avatar).keys}).to all(eq [:small, :medium, :large])
      expect(json_response.dig(:data).flat_map{|d| d.dig(:attributes, :avatar).values}).to all(be_present)
      expect(json_response.dig(:data).map{|d| d.dig(:id)}).to_not include(@user_without_avatar)
      expect(json_response.dig(:meta, :total)).to eq 7
    end

    describe do
      before do
        config = AppConfiguration.instance
        config.settings['core']['display_header_avatars'] = false
        config.save!
      end

      example_request 'Returns empty response for disabled display_header_avatars' do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 0
        expect(json_response.dig(:meta, :total)).to eq 0
      end
    end

    describe do
      let(:project) { create(:project) }
      let(:context_type) { 'project' }
      let(:context_id) { project.id }
      let!(:other_user) { create(:idea).author }
      let!(:author_ids) { 3.times.map{create(:idea, project: project).author.id}}
      let(:limit) { 2 }

      example_request "List random user avatars in a project" do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 2
        expect(json_response.dig(:data).map{|d| d.dig(:attributes, :avatar).keys}).to all(eq [:small, :medium, :large])
        expect(json_response.dig(:data).flat_map{|d| d.dig(:attributes, :avatar).values}).to all(be_present)
        expect(json_response.dig(:data).map{|d| d.dig(:id)}).to all(satisfy{|id| author_ids.include?(id)})
        expect(json_response.dig(:meta, :total)).to eq 3
      end
    end

    describe do
      let(:idea) { create(:idea) }
      let(:context_type) { 'idea' }
      let(:context_id) { idea.id }
      let(:author_id) { idea.author.id }
      let!(:commenter_ids) { 2.times.map{create(:comment, post: idea).author.id}}
      let(:limit) { 2 }

      example_request "List random user avatars on an idea (author and commenters)" do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 2
        expect(json_response.dig(:data).map{|d| d.dig(:attributes, :avatar).keys}).to all(eq [:small, :medium, :large])
        expect(json_response.dig(:data).flat_map{|d| d.dig(:attributes, :avatar).values}).to all(be_present)
        expect(json_response.dig(:data).map{|d| d.dig(:id)}).to all(satisfy{|id| (commenter_ids + [author_id]).include?(id)})
        expect(json_response.dig(:meta, :total)).to eq 3
      end
    end

    describe do
      let(:initiative) { create(:initiative) }
      let(:context_type) { 'initiative' }
      let(:context_id) { initiative.id }
      let(:author_id) { initiative.author.id }
      let!(:commenter_ids) { 2.times.map{create(:comment, post: initiative).author.id}}
      let(:limit) { 2 }

      example_request "List random user avatars on an initiative (author and commenters)" do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 2
        expect(json_response.dig(:data).map{|d| d.dig(:attributes, :avatar).keys}).to all(eq [:small, :medium, :large])
        expect(json_response.dig(:data).flat_map{|d| d.dig(:attributes, :avatar).values}).to all(be_present)
        expect(json_response.dig(:data).map{|d| d.dig(:id)}).to all(satisfy{|id| (commenter_ids + [author_id]).include?(id)})
        expect(json_response.dig(:meta, :total)).to eq 3
      end
    end

    context "as an admin" do
      before do
        @user = create(:admin)
        token = Knock::AuthToken.new(payload: @user.to_token_payload).token
        header 'Authorization', "Bearer #{token}"
      end

      describe do
        let(:group) { create(:group) }
        let(:context_type) { 'group' }
        let(:context_id) { group.id }
        let!(:other_user) { create(:user) }
        let!(:member_ids) { create_list(:user, 4, manual_groups: [group]).map(&:id) }

        example_request "List random user avatars in a group as an admin" do
          expect(status).to eq(200)
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 4
          expect(json_response.dig(:data).map{|d| d.dig(:attributes, :avatar).keys}).to all(eq [:small, :medium, :large])
          expect(json_response.dig(:data).flat_map{|d| d.dig(:attributes, :avatar).values}).to all(be_present)
          expect(json_response.dig(:data).map{|d| d.dig(:id)}).to all(satisfy{|id| member_ids.include?(id)})
          expect(json_response.dig(:meta, :total)).to eq 4
        end
      end
    end

  end

  get "web_api/v1/avatars/:id" do
    parameter :id, "The avatar id is the user id", required: true

    let(:user) { create(:user) }

    describe do
      let (:id) { user.id }

      example_request "Get a single avatar" do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq id
      end
    end

  end

end
