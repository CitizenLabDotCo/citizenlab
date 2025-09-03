# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Avatars' do
  explanation 'Avatars are user images user setup in their profile. To edit them, use the users endpoints'

  before do
    header 'Content-Type', 'application/json'
    @user_without_avatar = create(:user, avatar: nil)
    @users_with_avatar = create_list(:user, 6)
  end

  get 'web_api/v1/avatars' do
    parameter :limit, 'Number of avatars to return. Defaults to 5. Maximum 10.', default: false
    parameter :context_type, "The context used to look for users. Either 'group', 'project' or 'idea'. Don't specify to not limit the context.", required: false
    parameter :context_id, 'The context used to look for users. A valid ID for the given context_type', required: false

    response_field :total, 'The total count of users in the given context, including those without avatar', scope: :meta

    before do
      Analytics::PopulateDimensionsService.populate_types
    end

    example_request 'List random user avatars' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 5
      expect(json_response[:data].map { |d| d.dig(:attributes, :avatar).keys }).to all(eq %i[small medium large])
      expect(json_response[:data].flat_map { |d| d.dig(:attributes, :avatar).values }).to all(be_present)
      expect(json_response[:data].pluck(:id)).not_to include(@user_without_avatar)
      expect(json_response.dig(:meta, :total)).to eq 7
    end

    describe do
      let(:project) { create(:project) }
      let(:context_type) { 'project' }
      let(:context_id) { project.id }
      let!(:other_user) { create(:idea).author }
      let!(:author_ids) { Array.new(3) { create(:idea, project: project).author.id } }
      let(:limit) { 2 }

      example_request 'List random user avatars in a project' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 2
        expect(json_response[:data].map { |d| d.dig(:attributes, :avatar).keys }).to all(eq %i[small medium large])
        expect(json_response[:data].flat_map { |d| d.dig(:attributes, :avatar).values }).to all(be_present)
        expect(json_response[:data].pluck(:id)).to all(satisfy { |id| author_ids.include?(id) })
        expect(json_response.dig(:meta, :total)).to eq 3
      end
    end

    describe do
      let(:projects) { create_list(:project, 3) }
      let(:folder) { create(:project_folder, projects: projects) }
      let(:context_type) { 'project_folder' }
      let(:context_id) { folder.id }
      let!(:other_user) { create(:idea).author }
      let!(:author_ids) { projects.map { |project| create(:idea, project: project).author.id } }
      let(:limit) { 2 }

      example_request 'List random user avatars in a folder' do
        assert_status 200
        json_response = json_parse response_body
        expect(json_response[:data].size).to eq 2
        expect(json_response[:data].map { |d| d.dig(:attributes, :avatar).keys }).to all(eq %i[small medium large])
        expect(json_response[:data].flat_map { |d| d.dig(:attributes, :avatar).values }).to all(be_present)
        expect(json_response[:data].pluck(:id)).to all(satisfy { |id| author_ids.include?(id) })
        expect(json_response.dig(:meta, :total)).to eq 3
      end
    end

    describe do
      let(:idea) { create(:idea) }
      let(:context_type) { 'idea' }
      let(:context_id) { idea.id }
      let(:author_id) { idea.author.id }
      let!(:commenter_ids) { Array.new(2) { create(:comment, idea: idea).author.id } }
      let(:limit) { 2 }

      example_request 'List random user avatars on an idea (author and commenters)' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 2
        expect(json_response[:data].map { |d| d.dig(:attributes, :avatar).keys }).to all(eq %i[small medium large])
        expect(json_response[:data].flat_map { |d| d.dig(:attributes, :avatar).values }).to all(be_present)
        expect(json_response[:data].pluck(:id)).to all(satisfy { |id| (commenter_ids + [author_id]).include?(id) })
        expect(json_response.dig(:meta, :total)).to eq 3
      end
    end

    context 'as an admin' do
      before { admin_header_token }

      describe do
        let(:group) { create(:group) }
        let(:context_type) { 'group' }
        let(:context_id) { group.id }
        let!(:other_user) { create(:user) }
        let!(:member_ids) { create_list(:user, 4, manual_groups: [group]).map(&:id) }

        example_request 'List random user avatars in a group as an admin' do
          assert_status 200
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 4
          expect(json_response[:data].map { |d| d.dig(:attributes, :avatar).keys }).to all(eq %i[small medium large])
          expect(json_response[:data].flat_map { |d| d.dig(:attributes, :avatar).values }).to all(be_present)
          expect(json_response[:data].pluck(:id)).to all(satisfy { |id| member_ids.include?(id) })
          expect(json_response.dig(:meta, :total)).to eq 4
        end
      end
    end
  end

  get 'web_api/v1/avatars/:id' do
    parameter :id, 'The avatar id is the user id', required: true

    let(:user) { create(:user) }

    describe do
      let(:id) { user.id }

      example_request 'Get a single avatar' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq id
      end
    end
  end
end
