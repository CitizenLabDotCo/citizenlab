require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "Comments" do

  explanation "Comments permit users to have discussions about content (i.e. ideas)."

  before do
    header "Content-Type", "application/json"
    @project = create(:continuous_project)
    @idea = create(:idea, project: @project)
  end

  get "web_api/v1/ideas/:idea_id/comments" do
    with_options scope: :page do
      parameter :number, "Page number"
      parameter :size, "Number of top-level comments per page. The response will include 2 to 5 child comments per top-level comment, so expect to receive more"
    end
    parameter :sort, "Either new, -new, upvotes_count or -upvotes_count. Defaults to -new. Only applies to the top-level comments, children are always returned chronologically."

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

      example_request "List the top-level comments of an idea" do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 10
        expect(json_response[:data].map{|d| d[:id]}).to eq([
          @c1,
          @c2,
          @c1sub1,
          @c1sub2,
          @c1sub3,
          @c1sub4,
          @c1sub5,
          @c3,
          @c3sub5,
          @c3sub6,
        ].map(&:id))
        expect(json_response[:links][:next]).to be_present
      end
    end

    describe do
      let(:idea_id) { @idea.id }
      let(:sort) { "-upvotes_count" }

      before do
        @c1, @c2, @c3 = create_list(:comment, 3, post: @idea)
        create_list(:vote, 2, votable: @c3)
        create_list(:vote, 3, votable: @c2)
        @c3sub1, @c3sub2 = create_list(:comment, 2, parent: @c3, post: @idea)
        create(:vote, votable: @c3sub2)
      end

      example_request "List the top-level comments of an idea sorted by descending upvotes_count" do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 5
        expect(json_response[:data].map{|d| d[:id]}).to eq([
          @c2, 
          @c3, 
          @c3sub1,
          @c3sub2, 
          @c1
        ].map(&:id))
      end
    end

  end

  get "web_api/v1/comments/:comment_id/children" do
    explanation "Children are always returned chronologically"
    with_options scope: :page do
      parameter :number, "Page number"
      parameter :size, "Number of comments per page"
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

    example_request "List the direct child comments of a comment on an idea" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 6
      expect(json_response[:data].map{|d| d[:id]}).to eq([
        @csub1,
        @csub2,
        @csub3,
        @csub4,
        @csub5,
        @csub6,
      ].map(&:id))
    end
  end

  get "web_api/v1/ideas/comments/as_xlsx" do
    parameter :project, 'Filter by project', required: false
    parameter :ideas, 'Filter by a given list of idea ids', required: false

    before do 
      @user = create(:admin)
      token = Knock::AuthToken.new(payload: @user.to_token_payload).token
      header 'Authorization', "Bearer #{token}"
    end

    example_request "XLSX export of comments on ideas" do
      expect(status).to eq 200
    end

    describe do
      before do 
        @project = create(:project)
        @comments = 3.times.collect do |i|
          create(:comment, post: create(:idea, project: @project))
        end
      end
      let(:project) { @project.id }

      example_request 'XLSX export by project', document: false do
        expect(status).to eq 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet.count).to eq (@comments.size + 1)
      end
    end

    describe do
      before do 
        @comments = create_list(:comment, 4)
      end
      let(:ideas) { @comments.map(&:post_id) }
      
      example_request 'XLSX export by idea ids', document: false do
        expect(status).to eq 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet.count).to eq (ideas.size + 1)
      end
    end

    context 'when the user moderates the project', skip: !CitizenLab.ee? do
      before do
        @project = create(:project)
        @user = create(:project_moderator, projects: [@project])
        header_token_for(@user)
      end

      let(:project) { @project.id }

      example_request('XLSX export', document: false) { expect(status).to eq 200 }
    end

    context 'when the user moderates another project', skip: !CitizenLab.ee? do
      before do
        @project = create(:project)
        @user = create(:project_moderator, projects: [create(:project)])
        header_token_for(@user)
      end

      let(:project) { @project.id }

      example_request('[error] XLSX export', document: false) { expect(status).to eq 401 }
    end

    describe do
      before do 
        @user = create(:user)
        token = Knock::AuthToken.new(payload: @user.to_token_payload).token
        header 'Authorization', "Bearer #{token}"
      end
      
      example_request '[error] XLSX export by a normal user', document: false do
        expect(status).to eq 401
      end
    end
  end

  get "web_api/v1/comments/:id" do
    let(:idea) { create(:idea) }
    let(:parent) { create(:comment, post: idea) }
    let(:comment) { create(:comment, parent: parent, post: idea) }
    let(:id) { comment.id }

    example_request "Get one comment by id" do
      expect(status).to eq 200
      json_response = json_parse(response_body)

      expect(json_response.dig(:data, :id)).to eq id
      expect(json_response.dig(:data, :type)).to eq 'comment'
      expect(json_response.dig(:data, :attributes)).to include(
        downvotes_count: 0,
        publication_status: 'published',
        is_admin_comment: false
        )
      expect(json_response.dig(:data, :relationships)).to include(
        post: {
          data: {id: comment.post_id, type: 'idea'}
        },
        author: {
          data: {id: comment.author_id, type: 'user'}
        },
        parent: {
          data: {id: parent.id, type: 'comment'}
        })
      expect(json_response.dig(:included, 0, :attributes)).to include(
        first_name: comment.author.first_name,
        locale: comment.author.locale
        )
    end
  end

  context "when authenticated" do
    before do
      @user = create(:user)
      token = Knock::AuthToken.new(payload: @user.to_token_payload).token
      header 'Authorization', "Bearer #{token}"
    end

    get "web_api/v1/ideas/:idea_id/comments" do
      let(:idea_id) { @idea.id }

      example "List all comments of an idea includes the user_vote when authenticated" do
        comment = create(:comment, post: @idea)
        vote = create(:vote, user: @user, votable: comment)
        do_request
        json_response = json_parse(response_body)
        expect(json_response[:data].map{|d| d[:relationships][:user_vote][:data]}.compact.first[:id]).to eq vote.id
        expect(json_response[:included].map{|i| i[:id]}).to include vote.id
      end
    end

    post "web_api/v1/ideas/:idea_id/comments" do
      with_options scope: :comment do
        parameter :author_id, "The user id of the user owning the comment. Signed in user by default", required: false
        parameter :body_multiloc, "Multi-locale field with the comment body", required: true
        parameter :parent_id, "The id of the comment this comment is a response to", required: false
      end
      ValidationErrorHelper.new.error_fields(self, Comment)
      response_field :base, "Array containing objects with signature { error: #{ParticipationContextService::COMMENTING_DISABLED_REASONS.values.join(' | ')} }", scope: :errors

      let(:idea_id) { @idea.id }
      let(:comment) { build(:comment) }
      let(:body_multiloc) { comment.body_multiloc }

      example_request "Create a comment on an idea" do
        expect(response_status).to eq 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:relationships,:author,:data,:id)).to eq @user.id
        expect(json_response.dig(:data,:attributes,:body_multiloc).stringify_keys).to match body_multiloc
        expect(json_response.dig(:data,:relationships,:parent,:data)).to be_nil
        expect(json_response.dig(:data,:relationships,:post,:data,:id)).to eq idea_id
        expect(@idea.reload.comments_count).to eq 1
      end

      describe do
        let(:parent_id) { create(:comment, post: @idea).id }

        example_request "Create a comment on a comment" do
          expect(response_status).to eq 201
          json_response = json_parse(response_body)
          expect(json_response.dig(:data,:relationships,:author,:data,:id)).to eq @user.id
          expect(json_response.dig(:data,:attributes,:body_multiloc).stringify_keys).to match body_multiloc
          expect(json_response.dig(:data,:relationships,:parent,:data, :id)).to eq parent_id
          expect(json_response.dig(:data,:relationships,:post,:data,:id)).to eq idea_id
          expect(@idea.reload.comments_count).to eq 2
        end
      end

      describe do
        let(:body_multiloc) { {"fr-FR" => ""} }

        example_request "[error] Create an invalid comment" do
          expect(response_status).to eq 422
          json_response = json_parse(response_body)
          expect(json_response.dig(:errors, :body_multiloc)).to eq [{error: 'blank'}]
        end
      end

      describe do
        before do
          project = create(:project_with_past_phases)
          @idea.project = project
          @idea.save
        end
        
        example_request "[error] Create a comment on an idea in an inactive project" do
          expect(response_status).to be >= 400
        end
      end

      describe do
        before do
          project = create(:continuous_budgeting_project)
          @idea.project = project
          @idea.save!
        end

        example "Commenting should be enabled by default in a budgeting project", document: false do
          do_request
          expect(response_status).to eq 201
        end
      end

      describe do
        before(:all) { skip "While we work on CL2-6685: Random back-end test failures in CI" }
        before { SettingsService.new.activate_feature! 'blocking_profanity' }
        # Weak attempt to make it less explicit
        let(:body_multiloc) {{'en' => 'fu'+'ckin'+'g co'+'cksu'+'cker'}} 

        example_request "[error] Create a comment with blocked words" do
          expect(response_status).to eq 422
          json_response = json_parse(response_body)
          blocked_error = json_response.dig(:errors, :base)&.select{|err| err[:error] == 'includes_banned_words'}&.first
          expect(blocked_error).to be_present
          expect(blocked_error.dig(:blocked_words).map{|bw| bw[:attribute]}.uniq).to eq(['body_multiloc'])
        end
      end
    end

    post "web_api/v1/comments/:id/mark_as_deleted" do
      with_options scope: :comment do
        parameter :reason_code, "one of #{Notifications::CommentDeletedByAdmin::REASON_CODES}; only required for admins", required: false
        parameter :other_reason, "the reason for deleting the comment, if none of the reason codes is applicable, in which case 'other' must be chosen", required: false
      end

      let(:comment) { create(:comment, author: @user, post: @idea) }
      let(:id) { comment.id }

      example_request "Mark a comment on an idea as deleted" do
        expect(response_status).to eq 200
        expect(comment.reload.publication_status).to eq('deleted')
      end

      example "Admins cannot mark a comment as deleted without a reason", document: false do
        @admin = create(:admin)
        token = Knock::AuthToken.new(payload: @admin.to_token_payload).token
        header 'Authorization', "Bearer #{token}"
        do_request
        expect(response_status).to eq 422
      end
    end

    patch "web_api/v1/comments/:id" do
      with_options scope: :comment do
        parameter :author_id, "The user id of the user owning the comment. Signed in user by default"
        parameter :body_multiloc, "Multi-locale field with the comment body"
        parameter :parent_id, "The id of the comment this comment is a response to"
      end
      ValidationErrorHelper.new.error_fields(self, Comment)
      response_field :base, "Array containing objects with signature { error: #{ParticipationContextService::COMMENTING_DISABLED_REASONS.values.join(' | ')} }", scope: :errors

      let(:comment) { create(:comment, author: @user, post: @idea) }
      let(:id) { comment.id }
      let(:body_multiloc) { {'en' => "His hair is not blond, it's orange. Get your facts straight!"} }

      example_request "Update a comment on an idea" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:attributes,:body_multiloc).stringify_keys).to match body_multiloc
        expect(@idea.reload.comments_count).to eq 1
      end

      example "Admins cannot modify a comment on an idea", document: false do
        @admin = create(:admin)
        token = Knock::AuthToken.new(payload: @admin.to_token_payload).token
        header 'Authorization', "Bearer #{token}"
        do_request
        expect(comment.reload.body_multiloc).not_to eq body_multiloc
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
