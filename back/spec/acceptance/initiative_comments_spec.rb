# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Comments' do
  explanation 'Comments permit users to have discussions about content (i.e. ideas).'

  before do
    header 'Content-Type', 'application/json'
    @initiative = create(:initiative)
  end

  get 'web_api/v1/initiatives/:initiative_id/comments' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of top-level comments per page. The response will include 2 to 5 child comments per top-level comment, so expect to receive more'
    end
    parameter :sort, 'Either new, -new, upvotes_count or -upvotes_count. Defaults to -new. Only applies to the top-level comments, children are always returned chronologically.'

    describe do
      before do
        @c1 = create(:comment, post: @initiative)
        @c2 = create(:comment, post: @initiative)
        @c1sub1 = create(:comment, parent: @c2, post: @initiative)
        @c1sub2 = create(:comment, parent: @c2, post: @initiative)
        @c1sub3 = create(:comment, parent: @c2, post: @initiative)
        @c1sub4 = create(:comment, parent: @c2, post: @initiative)
        @c1sub5 = create(:comment, parent: @c2, post: @initiative)
        @c3 = create(:comment, post: @initiative)
        @c3sub1 = create(:comment, parent: @c3, post: @initiative)
        @c3sub2 = create(:comment, parent: @c3, post: @initiative)
        @c3sub3 = create(:comment, parent: @c3, post: @initiative)
        @c3sub4 = create(:comment, parent: @c3, post: @initiative)
        @c3sub5 = create(:comment, parent: @c3, post: @initiative)
        @c3sub6 = create(:comment, parent: @c3, post: @initiative)
        @c4 = create(:comment, post: @initiative)
        @c4sub1 = create(:comment, parent: @c4, post: @initiative)
      end

      let(:initiative_id) { @initiative.id }
      let(:size) { 3 }

      example_request 'List the top-level comments of an initiative' do
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
      end
    end

    describe do
      let(:initiative_id) { @initiative.id }
      let(:sort) { '-upvotes_count' }

      before do
        @c1, @c2, @c3 = create_list(:comment, 3, post: @initiative)
        create_list(:vote, 2, votable: @c3)
        create_list(:vote, 3, votable: @c2)
        @c3sub1, @c3sub2 = create_list(:comment, 2, parent: @c3, post: @initiative)
        create(:vote, votable: @c3sub2)
      end

      example_request 'List the top-level comments of an initiative sorted by descending upvotes_count' do
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
      @c = create(:comment, post: @initiative)
      @csub1 = create(:comment, parent: @c, post: @initiative)
      @csub2 = create(:comment, parent: @c, post: @initiative)
      @csub3 = create(:comment, parent: @c, post: @initiative)
      @csub4 = create(:comment, parent: @c, post: @initiative)
      @csub5 = create(:comment, parent: @c, post: @initiative)
      @csub6 = create(:comment, parent: @c, post: @initiative)
      @c2 = create(:comment, post: @initiative)
    end

    let(:comment_id) { @c.id }

    example_request 'List the direct child comments of a comment on an initiative' do
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

  get 'web_api/v1/initiatives/comments/as_xlsx' do
    parameter :initiatives, 'Filter by a given list of initiative ids', required: false
    before do
      @user = create(:admin)
      header_token_for @user
    end

    describe do
      before do
        @comments = Array.new(3) do |_i|
          create(:comment, post: create(:initiative))
        end
      end

      example_request 'XLSX export of comments on initiatives' do
        expect(status).to eq 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet.count).to eq(@comments.size + 1)
      end
    end

    describe do
      before do
        @comments = create_list(:comment, 4, post: create(:initiative))
      end

      let(:initiatives) { @comments.map(&:post_id) }

      example 'XLSX export by initiative ids', document: false do
        do_request
        expect(status).to eq 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet.count).to eq(initiatives.size + 1)
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
    let(:comment) { create(:comment, post: create(:initiative)) }
    let(:id) { comment.id }

    example_request 'Get one comment by id' do
      expect(status).to eq 200
      expect(response_data[:id]).to eq id
      expect(response_data[:attributes]).to include(
        downvotes_count: 0,
        publication_status: 'published',
        is_admin_comment: false,
        anonymous: false,
        author_hash: comment.author_hash
      )
    end
  end

  context 'when authenticated' do
    before do
      @user = create(:user)
      header_token_for @user
    end

    get 'web_api/v1/initiatives/:initiative_id/comments' do
      let(:initiative_id) { @initiative.id }

      example 'List all comments of an initiative includes the user_vote when authenticated' do
        comment = create(:comment, post: @initiative)
        vote = create(:vote, user: @user, votable: comment)
        do_request
        json_response = json_parse(response_body)
        expect(json_response[:data].filter_map { |d| d[:relationships][:user_vote][:data] }.first[:id]).to eq vote.id
        expect(json_response[:included].pluck(:id)).to include vote.id
      end
    end

    post 'web_api/v1/initiatives/:initiative_id/comments' do
      with_options scope: :comment do
        parameter :author_id, 'The user id of the user owning the comment. Signed in user by default', required: false
        parameter :body_multiloc, 'Multi-locale field with the comment body', required: true
        parameter :parent_id, 'The id of the comment this comment is a response to', required: false
        parameter :anonymous, 'Post this comment anonymously - true/false', required: false
      end
      ValidationErrorHelper.new.error_fields(self, Comment)
      response_field :base, "Array containing objects with signature { error: #{ParticipationContextService::COMMENTING_DISABLED_REASONS.values.join(' | ')} }", scope: :errors

      let(:initiative_id) { @initiative.id }
      let(:comment) { build(:comment) }
      let(:body_multiloc) { comment.body_multiloc }

      example_request 'Create a comment on an initiative' do
        expect(response_status).to eq 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :relationships, :author, :data, :id)).to eq @user.id
        expect(json_response.dig(:data, :attributes, :body_multiloc).stringify_keys).to match body_multiloc
        expect(json_response.dig(:data, :relationships, :parent, :data)).to be_nil
        expect(json_response.dig(:data, :relationships, :post, :data, :id)).to eq initiative_id
        expect(@initiative.reload.comments_count).to eq 1
      end

      describe 'anomymous commenting' do
        let(:anonymous) { true }

        example_request 'Create an anonymous comment on an initiative' do
          assert_status 201
          expect(response_data.dig(:relationships, :author, :data, :id)).to be_nil
          expect(response_data.dig(:attributes, :anonymous)).to be true
          expect(response_data.dig(:attributes, :author_name)).to be_nil
        end
      end
    end

    post 'web_api/v1/comments/:id/mark_as_deleted' do
      with_options scope: :comment do
        parameter :reason_code, "one of #{Notifications::CommentDeletedByAdmin::REASON_CODES}; only required for admins", required: false
        parameter :other_reason, "the reason for deleting the comment, if none of the reason codes is applicable, in which case 'other' must be chosen", required: false
      end

      let(:comment) { create(:comment, author: @user, post: @initiative) }
      let(:id) { comment.id }

      example_request 'Mark a comment on an initiative as deleted' do
        expect(response_status).to eq 202
        expect(comment.reload.publication_status).to eq('deleted')
      end
    end

    patch 'web_api/v1/comments/:id' do
      with_options scope: :comment do
        parameter :author_id, 'The user id of the user owning the comment. Signed in user by default'
        parameter :body_multiloc, 'Multi-locale field with the comment body'
        parameter :parent_id, 'The id of the comment this comment is a response to'
        parameter :anonymous, 'Change this comment to anonymous - true/false'
      end
      ValidationErrorHelper.new.error_fields(self, Comment)
      response_field :base, "Array containing objects with signature { error: #{ParticipationContextService::COMMENTING_DISABLED_REASONS.values.join(' | ')} }", scope: :errors

      let(:comment) { create(:comment, author: @user, post: @initiative) }
      let(:id) { comment.id }
      let(:body_multiloc) { { 'en' => "His hair is not blond, it's orange. Get your facts straight!" } }

      example_request 'Update a comment on an initiative' do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :body_multiloc).stringify_keys).to match body_multiloc
        expect(@initiative.reload.comments_count).to eq 1
      end

      example 'Admins cannot modify a comment on an initiative', document: false do
        admin_header_token
        do_request
        expect(comment.reload.body_multiloc).not_to eq body_multiloc
      end

      describe 'anomymous commenting' do
        let(:anonymous) { true }

        example_request 'Change an comment on an initiative to anonymous' do
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
      end
    end
  end
end
