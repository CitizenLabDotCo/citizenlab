# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'InternalComments' do
  explanation 'Internal comments permit admins & moderators to have discussions about content (i.e. initatives).'

  before do
    header 'Content-Type', 'application/json'
    @initiative = create(:initiative)
  end

  context 'when an authenticated user' do
    before do
      @user = create(:user)
      header_token_for @user
    end

    post 'web_api/v1/initiatives/:initiative_id/internal_comments' do
      with_options scope: :internal_comment do
        parameter :body_multiloc, 'Multi-locale field with the comment body', required: true
        parameter :parent_id, 'The id of the comment this comment is a response to', required: false
      end

      let(:initiative_id) { @initiative.id }
      let(:internal_comment) { build(:internal_comment) }
      let(:body_multiloc) { internal_comment.body_multiloc }

      example_request '[Unauthorized] Create an internal comment on an initiative' do
        assert_status 401
        json_response = json_parse(response_body)

        expect(json_response.dig(:errors, :base)[0][:error]).to eq 'Unauthorized!'
        expect(@initiative.reload.internal_comments_count).to eq 0
      end
    end
  end

  context 'when an authenticated admin' do
    before do
      @user = create(:admin)
      header_token_for @user
    end

    get 'web_api/v1/internal_comments/:id' do
      let(:initiative) { create(:initiative) }
      let(:parent) { create(:internal_comment, post: initiative) }
      let(:internal_comment) { create(:internal_comment, parent: parent, post: initiative) }
      let(:id) { internal_comment.id }

      example_request 'Get one internal comment by id' do
        expect(status).to eq 200
        json_response = json_parse(response_body)

        expect(json_response.dig(:data, :id)).to eq id
        expect(json_response.dig(:data, :type)).to eq 'internal_comment'
        expect(json_response.dig(:data, :attributes)).to include(
          publication_status: 'published',
          is_admin_comment: false
          # author_hash: comment.author_hash
        )
        expect(json_response.dig(:data, :relationships)).to include(
          post: {
            data: { id: internal_comment.post_id, type: 'initiative' }
          },
          author: {
            data: { id: internal_comment.author_id, type: 'user' }
          },
          parent: {
            data: { id: parent.id, type: 'internal_comment' }
          }
        )
        expect(json_response.dig(:included, 0, :attributes)).to include(
          first_name: internal_comment.author.first_name,
          locale: internal_comment.author.locale
        )
      end
    end

    get 'web_api/v1/initiatives/:initiative_id/internal_comments' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of top-level comments per page. The response will include 2 to 5 child comments per top-level comment, so expect to receive more'
      end
      parameter :sort, 'Either new or -new. Defaults to -new. Only applies to the top-level comments, children are always returned chronologically.'

      describe do
        before do
          @c1 = create(:internal_comment, post: @initiative)
          @c2 = create(:internal_comment, post: @initiative)
          @c1sub1 = create(:internal_comment, parent: @c2, post: @initiative)
          @c1sub2 = create(:internal_comment, parent: @c2, post: @initiative)
          @c1sub3 = create(:internal_comment, parent: @c2, post: @initiative)
          @c1sub4 = create(:internal_comment, parent: @c2, post: @initiative)
          @c1sub5 = create(:internal_comment, parent: @c2, post: @initiative)
          @c3 = create(:internal_comment, post: @initiative)
          @c3sub1 = create(:internal_comment, parent: @c3, post: @initiative)
          @c3sub2 = create(:internal_comment, parent: @c3, post: @initiative)
          @c3sub3 = create(:internal_comment, parent: @c3, post: @initiative)
          @c3sub4 = create(:internal_comment, parent: @c3, post: @initiative)
          @c3sub5 = create(:internal_comment, parent: @c3, post: @initiative)
          @c3sub6 = create(:internal_comment, parent: @c3, post: @initiative)
          @c4 = create(:internal_comment, post: @initiative)
          @c4sub1 = create(:internal_comment, parent: @c4, post: @initiative)
        end

        let(:initiative_id) { @initiative.id }
        let(:size) { 3 }

        example_request 'List the top-level internal comments of an initiative' do
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
        let(:initiative_id) { @initiative.id }
        let(:sort) { '-new' }

        before do
          @c1 = create(:internal_comment, post: @initiative, created_at: 1.day.ago)
          @c2 = create(:internal_comment, post: @initiative, created_at: 2.days.ago)
          @c3 = create(:internal_comment, post: @initiative, created_at: 3.days.ago)
          @c2sub1, @c2sub2 = create_list(:internal_comment, 2, parent: @c2, post: @initiative)
        end

        example_request 'List the top-level internal comments of an initiative sorted by age, with oldest first' do
          expect(status).to eq(200)
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 5
          expect(json_response[:data].pluck(:id)).to eq([
            @c3,
            @c2,
            @c2sub1,
            @c2sub2,
            @c1
          ].map(&:id))
        end
      end
    end

    get 'web_api/v1/internal_comments/:internal_comment_id/children' do
      explanation 'Children are always returned chronologically'
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of internal comments per page'
      end

      describe do
        before do
          @c = create(:internal_comment, post: @initiative)
          @csub1 = create(:internal_comment, parent: @c, post: @initiative)
          @csub2 = create(:internal_comment, parent: @c, post: @initiative)
          @csub3 = create(:internal_comment, parent: @c, post: @initiative)
          @csub4 = create(:internal_comment, parent: @c, post: @initiative)
          @csub5 = create(:internal_comment, parent: @c, post: @initiative)
          @csub6 = create(:internal_comment, parent: @c, post: @initiative)
          @c2 = create(:internal_comment, post: @initiative)
        end

        let(:internal_comment_id) { @c.id }

        example_request 'List the direct child internal comments of am internal comment on an initiative' do
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
    end

    post 'web_api/v1/initiatives/:initiative_id/internal_comments' do
      with_options scope: :internal_comment do
        parameter :body_multiloc, 'Multi-locale field with the comment body', required: true
        parameter :parent_id, 'The id of the comment this comment is a response to', required: false
      end

      let(:initiative_id) { @initiative.id }
      let(:internal_comment) { build(:internal_comment) }
      let(:body_multiloc) { internal_comment.body_multiloc }

      example_request 'Create an internal comment on an initiative' do
        assert_status 201
        json_response = json_parse(response_body)

        expect(json_response.dig(:data, :relationships, :author, :data, :id)).to eq @user.id
        expect(json_response.dig(:data, :attributes, :body_multiloc).stringify_keys).to match body_multiloc
        expect(json_response.dig(:data, :relationships, :parent, :data)).to be_nil
        expect(json_response.dig(:data, :relationships, :post, :data, :id)).to eq initiative_id
        expect(@initiative.reload.internal_comments_count).to eq 1
      end

      describe do
        let(:parent_id) { create(:internal_comment, post: @initiative).id }

        example_request 'Create an internal comment on an internal comment' do
          assert_status 201
          json_response = json_parse(response_body)

          expect(json_response.dig(:data, :relationships, :author, :data, :id)).to eq @user.id
          expect(json_response.dig(:data, :attributes, :body_multiloc).stringify_keys).to match body_multiloc
          expect(json_response.dig(:data, :relationships, :parent, :data, :id)).to eq parent_id
          expect(json_response.dig(:data, :relationships, :post, :data, :id)).to eq initiative_id
          expect(@initiative.reload.internal_comments_count).to eq 2
        end
      end

      describe do
        let(:body_multiloc) { { 'fr-FR' => '' } }

        example_request '[error] Create an invalid internal comment' do
          assert_status 422
          json_response = json_parse response_body
          expect(json_response).to include_response_error(:body_multiloc, 'blank')
        end
      end
    end

    patch 'web_api/v1/internal_comments/:id' do
      with_options scope: :internal_comment do
        parameter :body_multiloc, 'Multi-locale field with the comment body'
        parameter :parent_id, 'The id of the internal comment this internal comment is a response to'
      end

      let(:internal_comment) { create(:internal_comment, author: @user, post: @initiative) }
      let(:id) { internal_comment.id }
      let(:body_multiloc) { { 'en' => "His hair is not blond, it's orange. Get your facts straight!" } }

      example_request 'Update an internal comment on an initiative' do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :body_multiloc).stringify_keys).to match body_multiloc
        expect(@initiative.reload.internal_comments_count).to eq 1
      end
    end

    post 'web_api/v1/internal_comments/:id/mark_as_deleted' do
      with_options scope: :internal_comment do
        parameter :reason_code, "one of #{Notifications::CommentDeletedByAdmin::REASON_CODES}; only required for admins", required: false
        parameter :other_reason, "the reason for deleting the comment, if none of the reason codes is applicable, in which case 'other' must be chosen", required: false
      end

      let(:internal_comment) { create(:internal_comment, author: @user, post: @initiative) }
      let(:id) { internal_comment.id }

      example_request 'Mark an internal comment on an initiative as deleted' do
        expect(response_status).to eq 202
        expect(internal_comment.reload.publication_status).to eq('deleted')
      end

      example 'Admins cannot mark an internal comment as deleted without a reason', document: false do
        admin_header_token
        do_request
        assert_status 422
      end
    end
  end
end
