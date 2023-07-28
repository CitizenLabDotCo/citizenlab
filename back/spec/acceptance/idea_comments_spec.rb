# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Comments' do
  explanation 'Comments permit users to have discussions about content (i.e. ideas).'

  before do
    header 'Content-Type', 'application/json'
    @project = create(:continuous_project)
    @idea = create(:idea, project: @project)
  end

  get 'web_api/v1/ideas/:idea_id/comments' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of top-level comments per page. The response will include 2 to 5 child comments per top-level comment, so expect to receive more'
    end
    parameter :sort, 'Either new, -new, likes_count or -likes_count. Defaults to -new. Only applies to the top-level comments, children are always returned chronologically.'

    describe do
      before do
        @c1 = create(:comment, post: @idea)
        @c2 = create(:comment, post: @idea)
        @c1sub1 = create(:comment, parent: @c2, post: @idea)
        @c1sub2 = create(:comment, parent: @c2, post: @idea)
        @c1sub3 = create(:comment, parent: @c2, post: @idea)
        @c1sub4 = create(:comment, parent: @c2, post: @idea)
        @c1sub5 = create(:comment, parent: @c2, post: @idea)
        @c3 = create(:comment, post: @idea)
        @c3sub1 = create(:comment, parent: @c3, post: @idea)
        @c3sub2 = create(:comment, parent: @c3, post: @idea)
        @c3sub3 = create(:comment, parent: @c3, post: @idea)
        @c3sub4 = create(:comment, parent: @c3, post: @idea)
        @c3sub5 = create(:comment, parent: @c3, post: @idea)
        @c3sub6 = create(:comment, parent: @c3, post: @idea)
        @c4 = create(:comment, post: @idea)
        @c4sub1 = create(:comment, parent: @c4, post: @idea)
      end

      let(:idea_id) { @idea.id }
      let(:size) { 3 }

      example_request 'List the top-level comments of an idea' do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 10
        expect(json_response[:data].pluck(:id)).to eq([
          @c1,
          @c2,
          @c1sub1,
          @c1sub2,
          @c1sub3,
          @c1sub4,
          @c1sub5,
          @c3,
          @c3sub5,
          @c3sub6
        ].map(&:id))
        expect(json_response[:links][:next]).to be_present
      end
    end

    describe do
      let(:idea_id) { @idea.id }
      let(:sort) { '-likes_count' }

      before do
        @c1, @c2, @c3 = create_list(:comment, 3, post: @idea)
        create_list(:reaction, 2, reactable: @c3)
        create_list(:reaction, 3, reactable: @c2)
        @c3sub1, @c3sub2 = create_list(:comment, 2, parent: @c3, post: @idea)
        create(:reaction, reactable: @c3sub2)
      end

      example_request 'List the top-level comments of an idea sorted by descending likes_count' do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 5
        expect(json_response[:data].pluck(:id)).to eq([
          @c2,
          @c3,
          @c3sub1,
          @c3sub2,
          @c1
        ].map(&:id))
      end
    end
  end

  get 'web_api/v1/comments/:comment_id/children' do
    explanation 'Children are always returned chronologically'
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of comments per page'
    end

    before do
      @c = create(:comment, post: @idea)
      @csub1 = create(:comment, parent: @c, post: @idea)
      @csub2 = create(:comment, parent: @c, post: @idea)
      @csub3 = create(:comment, parent: @c, post: @idea)
      @csub4 = create(:comment, parent: @c, post: @idea)
      @csub5 = create(:comment, parent: @c, post: @idea)
      @csub6 = create(:comment, parent: @c, post: @idea)
      @c2 = create(:comment, post: @idea)
    end

    let(:comment_id) { @c.id }

    example_request 'List the direct child comments of a comment on an idea' do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 6
      expect(json_response[:data].pluck(:id)).to eq([
        @csub1,
        @csub2,
        @csub3,
        @csub4,
        @csub5,
        @csub6
      ].map(&:id))
    end
  end

  get 'web_api/v1/ideas/comments/as_xlsx' do
    parameter :project, 'Filter by project', required: false
    parameter :ideas, 'Filter by a given list of idea ids', required: false

    before do
      @user = create(:admin)
      header_token_for @user
    end

    example_request 'XLSX export of comments on ideas' do
      expect(status).to eq 200
    end

    describe do
      before do
        @project = create(:project)
        @comments = Array.new(3) do |_i|
          create(:comment, post: create(:idea, project: @project))
        end
      end

      let(:project) { @project.id }

      example 'XLSX export by project', document: false do
        do_request
        expect(status).to eq 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet.count).to eq(@comments.size + 1)
      end
    end

    describe do
      before do
        @comments = create_list(:comment, 4)
      end

      let(:ideas) { @comments.map(&:post_id) }

      example 'XLSX export by idea ids', document: false do
        do_request
        expect(status).to eq 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet.count).to eq(ideas.size + 1)
      end
    end

    context 'when the user moderates the project' do
      before do
        @project = create(:project)
        @user = create(:project_moderator, projects: [@project])
        header_token_for(@user)
      end

      let(:project) { @project.id }

      example 'XLSX export', document: false do
        do_request
        expect(status).to eq 200
      end
    end

    context 'when the user moderates another project' do
      before do
        @project = create(:project)
        @user = create(:project_moderator, projects: [create(:project)])
        header_token_for(@user)
      end

      let(:project) { @project.id }

      example '[error] XLSX export', document: false do
        do_request
        expect(status).to eq 401
      end
    end

    context 'when a moderator exports all comments' do
      before do
        @project = create(:project)

        @comments = Array.new(3) do |_i|
          create(:comment, post: create(:idea, project: @project))
        end
        @unmoderated_comment = create(:comment)

        @user = create(:project_moderator, projects: [@project])
        header_token_for(@user)
      end

      example 'XLSX export', document: false do
        do_request
        expect(status).to eq 200

        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        comments_ids = worksheet.drop(1).collect { |row| row[0].value }

        expect(comments_ids).to match_array @comments.pluck(:id)
        expect(comments_ids).not_to include(@unmoderated_comment.id)
      end
    end

    describe 'when resident' do
      before { resident_header_token }

      example '[error] XLSX export', document: false do
        do_request
        expect(status).to eq 401
      end
    end
  end

  get 'web_api/v1/comments/:id' do
    let(:idea) { create(:idea) }
    let(:parent) { create(:comment, post: idea) }
    let(:comment) { create(:comment, parent: parent, post: idea) }
    let(:id) { comment.id }

    example_request 'Get one comment by id' do
      expect(status).to eq 200
      json_response = json_parse(response_body)

      expect(json_response.dig(:data, :id)).to eq id
      expect(json_response.dig(:data, :type)).to eq 'comment'
      expect(json_response.dig(:data, :attributes)).to include(
        dislikes_count: 0,
        publication_status: 'published',
        is_admin_comment: false,
        anonymous: false,
        author_hash: comment.author_hash
      )
      expect(json_response.dig(:data, :relationships)).to include(
        post: {
          data: { id: comment.post_id, type: 'idea' }
        },
        author: {
          data: { id: comment.author_id, type: 'user' }
        },
        parent: {
          data: { id: parent.id, type: 'comment' }
        }
      )
      expect(json_response.dig(:included, 0, :attributes)).to include(
        first_name: comment.author.first_name,
        locale: comment.author.locale
      )
    end
  end

  context 'when authenticated' do
    before do
      @user = create(:user)
      header_token_for @user
    end

    get 'web_api/v1/ideas/:idea_id/comments' do
      let(:idea_id) { @idea.id }

      example 'List all comments of an idea includes the user_reaction when authenticated' do
        comment = create(:comment, post: @idea)
        reaction = create(:reaction, user: @user, reactable: comment)
        do_request
        json_response = json_parse(response_body)
        expect(json_response[:data].filter_map { |d| d[:relationships][:user_reaction][:data] }.first[:id]).to eq reaction.id
        expect(json_response[:included].pluck(:id)).to include reaction.id
      end
    end

    post 'web_api/v1/ideas/:idea_id/comments' do
      with_options scope: :comment do
        parameter :body_multiloc, 'Multi-locale field with the comment body', required: true
        parameter :parent_id, 'The id of the comment this comment is a response to', required: false
        parameter :anonymous, 'Post this comment anonymously - true/false', required: false
      end
      ValidationErrorHelper.new.error_fields(self, Comment)
      response_field :base, "Array containing objects with signature { error: #{ParticipationContextService::COMMENTING_DISABLED_REASONS.values.join(' | ')} }", scope: :errors

      let(:idea_id) { @idea.id }
      let(:comment) { build(:comment) }
      let(:body_multiloc) { comment.body_multiloc }

      example_request 'Create a comment on an idea' do
        assert_status 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :relationships, :author, :data, :id)).to eq @user.id
        expect(json_response.dig(:data, :attributes, :body_multiloc).stringify_keys).to match body_multiloc
        expect(json_response.dig(:data, :relationships, :parent, :data)).to be_nil
        expect(json_response.dig(:data, :relationships, :post, :data, :id)).to eq idea_id
        expect(@idea.reload.comments_count).to eq 1
      end

      describe do
        let(:parent_id) { create(:comment, post: @idea).id }

        example_request 'Create a comment on a comment' do
          assert_status 201
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :relationships, :author, :data, :id)).to eq @user.id
          expect(json_response.dig(:data, :attributes, :body_multiloc).stringify_keys).to match body_multiloc
          expect(json_response.dig(:data, :relationships, :parent, :data, :id)).to eq parent_id
          expect(json_response.dig(:data, :relationships, :post, :data, :id)).to eq idea_id
          expect(@idea.reload.comments_count).to eq 2
        end
      end

      describe do
        let(:body_multiloc) { { 'fr-FR' => '' } }

        example_request '[error] Create an invalid comment' do
          assert_status 422
          json_response = json_parse response_body
          expect(json_response).to include_response_error(:body_multiloc, 'blank')
        end
      end

      describe do
        before do
          project = create(:project_with_past_phases)
          @idea.project = project
          @idea.save!
        end

        example_request '[error] Create a comment on an idea in an inactive project' do
          expect(response_status).to be >= 400
        end
      end

      describe do
        before do
          project = create(:continuous_budgeting_project)
          @idea.project = project
          @idea.save!
        end

        example 'Commenting should be enabled by default in a voting project', document: false do
          do_request
          assert_status 201
        end
      end

      describe do
        before { SettingsService.new.activate_feature! 'blocking_profanity' }

        let(:body_multiloc) { { 'en' => 'fucking cocksucker' } }

        example_request '[error] Create a comment with blocked words' do
          assert_status 422
          json_response = json_parse(response_body)
          blocked_error = json_response.dig(:errors, :base)&.select { |err| err[:error] == 'includes_banned_words' }&.first
          expect(blocked_error).to be_present
          expect(blocked_error[:blocked_words].pluck(:attribute).uniq).to eq(['body_multiloc'])
        end
      end

      describe 'anomymous commenting' do
        let(:allow_anonymous_participation) { true }
        let(:anonymous) { true }

        before { @idea.project.update! allow_anonymous_participation: allow_anonymous_participation }

        example_request 'Create an anonymous comment on an idea' do
          assert_status 201
          expect(response_data.dig(:relationships, :author, :data, :id)).to be_nil
          expect(response_data.dig(:attributes, :anonymous)).to be true
          expect(response_data.dig(:attributes, :author_name)).to be_nil
        end

        example 'Does not log activities for the author', document: false do
          expect { do_request }.not_to have_enqueued_job(LogActivityJob).with(anything, anything, @user, anything, anything)
        end

        describe 'when anonymous posting is not allowed' do
          let(:allow_anonymous_participation) { false }

          example_request 'Rejects the anonymous parameter' do
            assert_status 422
            json_response = json_parse response_body
            expect(json_response).to include_response_error(:base, 'anonymous_participation_not_allowed')
          end
        end
      end
    end

    post 'web_api/v1/comments/:id/mark_as_deleted' do
      with_options scope: :comment do
        parameter :reason_code, "one of #{Notifications::CommentDeletedByAdmin::REASON_CODES}; only required for admins", required: false
        parameter :other_reason, "the reason for deleting the comment, if none of the reason codes is applicable, in which case 'other' must be chosen", required: false
      end

      let(:comment) { create(:comment, author: @user, post: @idea) }
      let(:id) { comment.id }

      example_request 'Mark a comment on an idea as deleted' do
        expect(response_status).to eq 202
        expect(comment.reload.publication_status).to eq('deleted')
      end

      example 'Admins cannot mark a comment as deleted without a reason', document: false do
        admin_header_token
        do_request
        assert_status 422
      end
    end

    patch 'web_api/v1/comments/:id' do
      with_options scope: :comment do
        parameter :body_multiloc, 'Multi-locale field with the comment body'
        parameter :parent_id, 'The id of the comment this comment is a response to'
        parameter :anonymous, 'Change this comment to anonymous - true/false'
      end
      ValidationErrorHelper.new.error_fields(self, Comment)
      response_field :base, "Array containing objects with signature { error: #{ParticipationContextService::COMMENTING_DISABLED_REASONS.values.join(' | ')} }", scope: :errors

      let(:comment) { create(:comment, author: @user, post: @idea) }
      let(:id) { comment.id }
      let(:body_multiloc) { { 'en' => "His hair is not blond, it's orange. Get your facts straight!" } }

      example_request 'Update a comment on an idea' do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :body_multiloc).stringify_keys).to match body_multiloc
        expect(@idea.reload.comments_count).to eq 1
      end

      example 'Admins cannot modify a comment on an idea', document: false do
        admin_header_token
        do_request
        expect(comment.reload.body_multiloc).not_to eq body_multiloc
      end

      describe 'anomymous commenting' do
        let(:allow_anonymous_participation) { true }
        let(:anonymous) { true }

        before { @idea.project.update! allow_anonymous_participation: allow_anonymous_participation }

        example_request 'Change an comment on an idea to anonymous' do
          assert_status 200
          expect(response_data.dig(:relationships, :author, :data, :id)).to be_nil
          expect(response_data.dig(:attributes, :anonymous)).to be true
          expect(response_data.dig(:attributes, :author_name)).to be_nil
        end

        example '[Error] Cannot update an anonymous comment' do
          comment.update!(anonymous: true)
          do_request
          assert_status 401
          expect(json_response_body.dig(:errors, :base, 0, :error)).to eq 'Unauthorized!'
        end

        example 'Does not log activities for the author and clears the author from past activities', document: false do
          clear_activity = create(:activity, item: comment, user: @user)
          other_item_activity = create(:activity, item: comment, user: create(:user))
          other_user_activity = create(:activity, user: @user)

          expect { do_request }.not_to have_enqueued_job(LogActivityJob).with(anything, anything, @user, anything, anything)
          expect(clear_activity.reload.user_id).to be_nil
          expect(other_item_activity.reload.user_id).to be_present
          expect(other_user_activity.reload.user_id).to eq @user.id
        end

        describe 'when anonymous posting is not allowed' do
          let(:allow_anonymous_participation) { false }

          example_request 'Rejects the anonymous parameter' do
            assert_status 422
            json_response = json_parse response_body
            expect(json_response).to include_response_error(:base, 'anonymous_participation_not_allowed')
          end
        end
      end
    end

    ## Currently not allowed by anyone, but works at the moment of writing (if permitted, that is)
    # delete "web_api/v1/comments/:id" do
    #   let(:comment) { create(:comment, author: @user, idea: @idea) }
    #   let(:id) { comment.id }
    #   example_request "Delete a comment" do
    #     expect(response_status).to eq 200
    #     expect{Comment.find(id)}.to raise_error(ActiveRecord::RecordNotFound)
    #     expect(@idea.reload.comments_count).to eq 2
    #   end
    # end
  end
end
