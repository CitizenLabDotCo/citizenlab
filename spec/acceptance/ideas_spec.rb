require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Ideas" do

  before do
    header "Content-Type", "application/json"
    @ideas = create_list(:idea, 5)
  end

  get "api/v1/ideas" do
    example_request "List all ideas" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 5
    end
  end

  get "api/v1/ideas/:id" do
    let(:id) {@ideas.first.id}

    example_request "Get one idea by id" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @ideas.first.id
    end
  end


  context "when authenticated" do
    before do
      @user = create(:user)
      token = Knock::AuthToken.new(payload: { sub: @user.id }).token
      header 'Authorization', "Bearer #{token}"
    end


    post "api/v1/ideas" do
      with_options scope: :idea do
        parameter :lab_id, "The idea of the lab that hosts the idea", required: true, extra: ""
        parameter :author_id, "The user id of the user owning the idea", extra: "Required if not draft"
        parameter :publication_status, "Password", required: true, extra: "One of #{Idea::PUBLICATION_STATUSES}"
        parameter :title_multiloc, "Multi-locale field with the idea title", required: true, extra: "Maximum 100 characters"
        parameter :body_multiloc, "Multi-locale field with the idea body", extra: "Required if not draft"
        parameter :images, "Multipart form encoded images"
        parameter :files, "Multipart form encoded files"
      end

      describe do
        let(:idea) { build(:idea) }
        let(:lab_id) { create(:lab).id }
        let(:author_id) { create(:user).id }
        let(:publication_status) { 'published' }
        let(:title_multiloc) { idea.title_multiloc }
        let(:body_multiloc) { idea.body_multiloc }
        example_request "Creating a published idea" do
          expect(response_status).to eq 201
        end
      end
      # describe do
      #   header "Content-Type", "multipart/form-data"
      #   let(:images) { [Rack::Test::UploadedFile.new("spec/fixtures/robot.jpg", "image/jpg")] }
      #
      #   example_request "Creating a published idea with image" do
      #     json_response = json_parse(response_body)
      #     expect(response_status).to eq 201
      #     expect(json_response.dig(:data,:images).size).to eq 1
      #   end
      # end

    end


    patch "api/v1/ideas/:id" do
      before do
        @idea =  create(:idea, author: @user)
      end

      with_options scope: :idea do
        parameter :lab_id, "The idea of the lab that hosts the idea", required: true, extra: ""
        parameter :author_id, "The user id of the user owning the idea", extra: "Required if not draft"
        parameter :publication_status, "Either #{Idea::PUBLICATION_STATUSES}.join(', ')}", required: true
        parameter :title_multiloc, "Multi-locale field with the idea title", required: true, extra: "Maximum 100 characters"
        parameter :body_multiloc, "Multi-locale field with the idea body", extra: "Required if not draft"
        parameter :images, "Multipart form encoded images"
        parameter :files, "Multipart form encoded files"
      end

      let(:id) { @idea.id }
      let(:title_multiloc) { {"en" => "Changed title" } }
      example_request "Updating the idea title" do
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:attributes,:title_multiloc,:en)).to eq "Changed title"
      end
    end


    patch "api/v1/ideas/:id" do
      before do
        @idea =  create(:idea, author: @user, publication_status: 'draft')
      end

      parameter :publication_status, "Either #{Idea::PUBLICATION_STATUSES}.join(', ')}", required: true, scope: :idea

      let(:id) { @idea.id }
      let(:publication_status) { 'published' }
      example_request "Updating a draft to a published post" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:attributes,:publication_status)).to eq "published"
      end
    end
  end

end
