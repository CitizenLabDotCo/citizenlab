# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'InternalComments' do
  explanation 'Internal comments permit admins & moderators to discuss content (i.e. ideas &/or initiatives).'

  before { header 'Content-Type', 'application/json' }

  context 'when internal comments are on an idea' do
    before do
      @project = create(:single_phase_ideation_project)
      @idea = create(:idea, project: @project)
    end

    context 'when an authenticated user' do
      before do
        @user = create(:user)
        header_token_for @user
      end

      post 'web_api/v1/ideas/:idea_id/internal_comments' do
        with_options scope: :internal_comment do
          parameter :body, 'Text field with the comment body', required: true
          parameter :parent_id, 'The id of the comment this comment is a response to', required: false
        end

        let(:idea_id) { @idea.id }
        let(:internal_comment) { build(:internal_comment) }
        let(:body) { internal_comment.body }

        example_request '[Unauthorized] Create an internal comment on an idea' do
          assert_status 401
          json_response = json_parse(response_body)

          expect(json_response.dig(:errors, :base)[0][:error]).to eq 'Unauthorized!'
          expect(@idea.reload.internal_comments_count).to eq 0
        end
      end
    end

    context 'when an authenticated admin' do
      before do
        @user = create(:admin)
        header_token_for @user
      end

      get 'web_api/v1/internal_comments/:id' do
        let(:idea) { create(:idea) }
        let(:parent) { create(:internal_comment, idea: idea) }
        let(:internal_comment) { create(:internal_comment, parent: parent, idea: idea) }
        let(:id) { internal_comment.id }

        example_request 'Get one comment by id' do
          assert_status 200
          json_response = json_parse(response_body)

          expect(json_response.dig(:data, :id)).to eq id
          expect(json_response.dig(:data, :type)).to eq 'internal_comment'
          expect(json_response.dig(:data, :attributes)).to include(publication_status: 'published')
          expect(json_response.dig(:data, :relationships)).to include(
            idea: {
              data: { id: internal_comment.idea_id, type: 'idea' }
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

      get 'web_api/v1/ideas/:idea_id/internal_comments' do
        with_options scope: :page do
          parameter :number, 'Page number'
          parameter :size, 'Number of top-level comments per page. The response will include 2 to 5 child comments per top-level comment, so expect to receive more'
        end
        parameter :sort, 'Either new or -new. Defaults to -new. Only applies to the top-level comments, children are always returned chronologically.'

        describe do
          before do
            @c1 = create(:internal_comment, idea: @idea)
            @c2 = create(:internal_comment, idea: @idea)
            @c1sub1 = create(:internal_comment, parent: @c2, idea: @idea)
            @c1sub2 = create(:internal_comment, parent: @c2, idea: @idea)
            @c1sub3 = create(:internal_comment, parent: @c2, idea: @idea)
            @c1sub4 = create(:internal_comment, parent: @c2, idea: @idea)
            @c1sub5 = create(:internal_comment, parent: @c2, idea: @idea)
            @c3 = create(:internal_comment, idea: @idea)
            @c3sub1 = create(:internal_comment, parent: @c3, idea: @idea)
            @c3sub2 = create(:internal_comment, parent: @c3, idea: @idea)
            @c3sub3 = create(:internal_comment, parent: @c3, idea: @idea)
            @c3sub4 = create(:internal_comment, parent: @c3, idea: @idea)
            @c3sub5 = create(:internal_comment, parent: @c3, idea: @idea)
            @c3sub6 = create(:internal_comment, parent: @c3, idea: @idea)
            @c4 = create(:internal_comment, idea: @idea)
            @c4sub1 = create(:internal_comment, parent: @c4, idea: @idea)
          end

          let(:idea_id) { @idea.id }
          let(:size) { 3 }

          example_request 'List the top-level internal comments of an idea' do
            assert_status 200
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
          let(:sort) { '-new' }

          before do
            @c1 = create(:internal_comment, idea: @idea, created_at: 1.day.ago)
            @c2 = create(:internal_comment, idea: @idea, created_at: 2.days.ago)
            @c3 = create(:internal_comment, idea: @idea, created_at: 3.days.ago)
            @c2sub1, @c2sub2 = create_list(:internal_comment, 2, parent: @c2, idea: @idea)
          end

          example_request 'List the top-level internal comments of an idea sorted by age, with oldest first' do
            assert_status 200
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
            @c = create(:internal_comment, idea: @idea)
            @csub1 = create(:internal_comment, parent: @c, idea: @idea)
            @csub2 = create(:internal_comment, parent: @c, idea: @idea)
            @csub3 = create(:internal_comment, parent: @c, idea: @idea)
            @csub4 = create(:internal_comment, parent: @c, idea: @idea)
            @csub5 = create(:internal_comment, parent: @c, idea: @idea)
            @csub6 = create(:internal_comment, parent: @c, idea: @idea)
            @c2 = create(:internal_comment, idea: @idea)
          end

          let(:internal_comment_id) { @c.id }

          example_request 'List the direct child internal comments of an internal comment on an idea' do
            assert_status 200
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

      post 'web_api/v1/ideas/:idea_id/internal_comments' do
        with_options scope: :internal_comment do
          parameter :body, 'Text field with the comment body', required: true
          parameter :parent_id, 'The id of the internal comment this internal comment is a response to', required: false
        end

        let(:idea_id) { @idea.id }
        let(:internal_comment) { build(:internal_comment) }
        let(:body) { internal_comment.body }

        example_request 'Create an internal comment on an idea' do
          assert_status 201
          json_response = json_parse(response_body)

          expect(json_response.dig(:data, :relationships, :author, :data, :id)).to eq @user.id
          expect(json_response.dig(:data, :attributes, :body)).to match body
          expect(json_response.dig(:data, :relationships, :parent, :data)).to be_nil
          expect(json_response.dig(:data, :relationships, :idea, :data, :id)).to eq idea_id
          expect(@idea.reload.internal_comments_count).to eq 1
        end

        describe do
          let(:parent_id) { create(:internal_comment, idea: @idea).id }

          example_request 'Create an internal comment on an internal comment' do
            assert_status 201
            json_response = json_parse(response_body)

            expect(json_response.dig(:data, :relationships, :author, :data, :id)).to eq @user.id
            expect(json_response.dig(:data, :attributes, :body)).to match body
            expect(json_response.dig(:data, :relationships, :parent, :data, :id)).to eq parent_id
            expect(json_response.dig(:data, :relationships, :idea, :data, :id)).to eq idea_id
            expect(@idea.reload.internal_comments_count).to eq 2
          end
        end

        describe do
          let(:body) { '' }

          example_request '[error] Create an invalid internal comment' do
            assert_status 422
            json_response = json_parse response_body
            expect(json_response).to include_response_error(:body, 'blank')
          end
        end

        describe do
          before do
            project = create(:project_with_past_phases)
            @idea.project = project
            @idea.save!
          end

          example_request 'Create an internal comment on an idea in an inactive project' do
            assert_status 201
          end
        end
      end

      patch 'web_api/v1/internal_comments/:id' do
        with_options scope: :internal_comment do
          parameter :body, 'Text field with the comment body'
          parameter :parent_id, 'The id of the internal comment this internal comment is a response to'
        end

        let(:internal_comment) { create(:internal_comment, author: @user, idea: @idea) }
        let(:id) { internal_comment.id }
        let(:body) { "His hair is not blond, it's orange. Get your facts straight!" }

        example_request "Update author's own an internal comment on an idea" do
          assert_status 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :attributes, :body)).to match body
          expect(@idea.reload.internal_comments_count).to eq 1
        end

        example "[Unauthorized] Update other admin's internal comment on an idea" do
          internal_comment.update!(author: create(:admin))

          do_request
          assert_status 401
          expect(@idea.reload.internal_comments_count).to eq 1
        end
      end

      patch 'web_api/v1/internal_comments/:id/mark_as_deleted' do
        let(:internal_comment) { create(:internal_comment, author: @user, idea: @idea) }
        let(:id) { internal_comment.id }

        example_request "Author marks their own internal comment as 'deleted'" do
          assert_status 204
          expect(internal_comment.reload.publication_status).to eq('deleted')
        end

        example "[Unauthorized] Admin (not author) marks an internal comment on an initiative as 'deleted'" do
          internal_comment.update!(author: create(:admin))

          do_request
          assert_status 401
          expect(internal_comment.reload.publication_status).to eq('published')
        end
      end
    end
  end
end
