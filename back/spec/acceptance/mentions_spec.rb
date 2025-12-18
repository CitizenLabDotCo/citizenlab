# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Mentions' do
  explanation 'Part of a text that explicitly references a user.'

  before do
    @current_user = create(:user)
    header_token_for(@current_user)
    header 'Content-Type', 'application/json'
  end

  get 'web_api/v1/mentions/users' do
    parameter :mention, 'The (partial) search string for the mention (without the @)', required: true
    parameter :idea_id, 'An idea that is used as a context to return related users first', required: false
    parameter :limit, 'The number of results to return', required: false
    parameter :roles, "An array, including 'admin' and/or 'moderator' (moderators of post, if post specified)." \
                      'The roles of the users to return, exclusively - response will not include regular users,' \
                      'regardless of whether they are post author, or have commented on post.', required: false

    let(:users) { [create(:user, first_name: 'Flupke')] + create_list(:user, 9, last_name: 'Smith') }
    let(:mention) { users.first.first_name[0..3] }

    example_request 'Find user by (partial) mention' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to be >= 1
      expect(json_response[:data].all? { |u| u[:attributes][:first_name][0..3] == mention }).to be true
    end

    example 'Find user by (partial) mention and idea context' do
      first_name = 'Jozefius'
      idea = create(:idea)
      comments = Array.new(3) do
        user = create(:user, first_name: first_name)
        create(:comment, idea: idea, author: user)
      end
      create(:comment, idea: idea)

      idea_related = comments.map(&:author)

      do_request idea_id: idea.id, mention: first_name

      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq idea_related.size
      expect(json_response[:data].pluck(:id)).to match_array idea_related.map(&:id)
      expect(json_response[:data].all? { |u| u[:attributes][:first_name][0..(first_name.size)] == first_name }).to be true
    end

    context 'when current user is author of post' do
      let(:proposal) { create(:proposal, author: @current_user) }
      let(:base_query_params) do
        { idea_id: proposal.id, mention: @current_user.first_name[0..3] }
      end

      example 'does not return current user' do
        do_request base_query_params
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data].pluck(:id)).not_to include @current_user.id
      end
    end

    context 'when current user is not author of post' do
      let(:proposal) { create(:proposal, author: create(:user)) }
      let(:base_query_params) do
        { idea_id: proposal.id, mention: @current_user.first_name[0..3] }
      end

      example 'does not return current user' do
        do_request base_query_params
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data].pluck(:id)).not_to include @current_user.id
      end
    end

    example 'Does not return unregistered user by (partial) mention', document: false do
      users.first.update!(registration_completed_at: nil)

      do_request
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:data].pluck(:id)).not_to include users.first.id
    end

    example 'Does not return blocked user by (partial) mention', document: false do
      users.first.update!(block_start_at: 1.week.ago, block_end_at: 1.week.from_now)

      do_request
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:data].pluck(:id)).not_to include users.first.id
    end

    context 'when role(s) is/are specified using roles parameter' do
      before { User.delete_all }

      let(:project) { create(:project) }
      let(:idea) { create(:idea, project: project) }
      let(:first_name) { 'Aaa' }
      let(:last_name) { 'Bbb' }
      let(:names) { { first_name: first_name, last_name: last_name } }

      let!(:regular_user) { create(:user, names) }
      let!(:admin) { create(:admin, names) }
      let!(:moderator_of_project) { create(:project_moderator, names.merge({ projects: [project] })) }
      let!(:moderator_of_other_project) { create(:project_moderator, names) }

      let(:base_query_params) { { idea_id: idea.id, mention: first_name } }

      example 'Does not include regular user, even if has commented on post' do
        create(:comment, idea: idea, author: regular_user)

        do_request base_query_params.merge({ roles: %w[admin moderator] })
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data].pluck(:id)).not_to include(regular_user.id)
      end

      example 'Does not include regular user, even if post author' do
        idea.update!(author_id: regular_user.id)

        do_request base_query_params.merge({ roles: %w[admin moderator] })
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data].pluck(:id)).not_to include(regular_user.id)
      end

      example 'Includes only admins when only admin role is specified' do
        do_request base_query_params.merge({ roles: ['admin'] })
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data].pluck(:id)).to contain_exactly(admin.id)
      end

      context 'when a post is specified' do
        example "Includes only moderators of post's project when only moderator role is specified" do
          do_request base_query_params.merge({ roles: ['moderator'] })
          assert_status 200
          json_response = json_parse(response_body)
          expect(json_response[:data].pluck(:id)).to contain_exactly(moderator_of_project.id)
        end

        example "Includes only admins and moderators of post's project when both roles are specified" do
          do_request base_query_params.merge({ roles: %w[moderator admin] })
          assert_status 200
          json_response = json_parse(response_body)
          expect(json_response[:data].pluck(:id)).to contain_exactly(moderator_of_project.id, admin.id)
        end
      end

      context 'when no post is specified' do
        let(:base_query_params) { { mention: first_name } }

        example 'Includes only project moderators when only moderator role is specified' do
          do_request base_query_params.merge({ roles: ['moderator'] })
          assert_status 200
          json_response = json_parse(response_body)
          expect(json_response[:data].pluck(:id))
            .to contain_exactly(moderator_of_project.id, moderator_of_other_project.id)
        end

        example 'Includes only admins and moderators when both roles are specified' do
          do_request base_query_params.merge({ roles: %w[admin moderator] })
          assert_status 200
          json_response = json_parse(response_body)
          expect(json_response[:data].pluck(:id))
            .to contain_exactly(moderator_of_project.id, moderator_of_other_project.id, admin.id)
        end
      end
    end
  end
end
