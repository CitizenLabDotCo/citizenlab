require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Comments" do

  before do
    header "Content-Type", "application/json"
    @idea = create(:idea)
    @comments = create_list(:comment, 2, idea: @idea)
  end

  get "web_api/v1/ideas/:idea_id/comments" do
    with_options scope: :page do
      parameter :number, "Page number"
      parameter :size, "Number of comments per page"
    end
    
    let(:idea_id) { @idea.id }
    example_request "List comments of an idea" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
    end

  end

  get "web_api/v1/comments/as_xlsx" do
    parameter :project, 'Filter by project', required: false

    example_request "XLSX export" do
      expect(status).to eq 200
    end
  end


  get "web_api/v1/comments/:id" do
    let(:id) { @comments.first.id }

    example_request "Get one comment by id" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @comments.first.id
    end
  end

  context "when authenticated" do
    before do
      @user = create(:user)
      token = Knock::AuthToken.new(payload: { sub: @user.id }).token
      header 'Authorization', "Bearer #{token}"
    end

    get "web_api/v1/ideas/:idea_id/comments" do

      let(:idea_id) { @idea.id }

      example "List all comments includes the user_vote when authenticated" do
        comment = create(:comment, idea: @idea)
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

      example_request "Create a comment to an idea" do
        expect(response_status).to eq 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:relationships,:author,:data,:id)).to eq @user.id
        expect(json_response.dig(:data,:attributes,:body_multiloc).stringify_keys).to match body_multiloc
        expect(json_response.dig(:data,:relationships,:parent,:data)).to be_nil
        expect(json_response.dig(:data,:relationships,:idea,:data,:id)).to eq idea_id
        expect(@idea.reload.comments_count).to eq 3
      end

      describe do
        let(:parent_id) { @comments.first.id }

        example_request "Create a comment to a comment" do
          expect(response_status).to eq 201
          json_response = json_parse(response_body)
          expect(json_response.dig(:data,:relationships,:author,:data,:id)).to eq @user.id
          expect(json_response.dig(:data,:attributes,:body_multiloc).stringify_keys).to match body_multiloc
          expect(json_response.dig(:data,:relationships,:parent,:data, :id)).to eq parent_id
          expect(json_response.dig(:data,:relationships,:idea,:data,:id)).to eq idea_id
          expect(@idea.reload.comments_count).to eq 3
        end
      end

      describe do
        let(:body_multiloc) { {"fr" => ""} }

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
          expect(response_status).to eq 422
          json_response = json_parse(response_body)
          expect(json_response.dig(:errors, :base)&.first&.dig(:error)).to eq ParticipationContextService::COMMENTING_DISABLED_REASONS[:project_inactive]
        end
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

      let(:comment) { create(:comment, author: @user, idea: @idea) }
      let(:id) { comment.id }
      let(:body_multiloc) { build(:comment).body_multiloc }

      example_request "Update a comment" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:attributes,:body_multiloc).stringify_keys).to match body_multiloc
        expect(@idea.reload.comments_count).to eq 3
      end
    end


    delete "web_api/v1/comments/:id" do
      let(:comment) { create(:comment, author: @user, idea: @idea) }
      let(:id) { comment.id }
      example_request "Delete a comment" do
        expect(response_status).to eq 200
        expect{Comment.find(id)}.to raise_error(ActiveRecord::RecordNotFound)
        expect(@idea.reload.comments_count).to eq 2
      end
    end

  end

end