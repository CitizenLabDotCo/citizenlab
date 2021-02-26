require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Product Feedback" do
 
  explanation "User feedback about the product itself, that is logged to segment by the backend"

  before do
    header "Content-Type", "application/json"
  end

  post "web_api/v1/product_feedback" do
    with_options scope: :product_feedback do
      parameter :question, "String to uniquely identify this type of question (e.g. `found_what_youre_looking_for?`)", required: true 
      parameter :answer, "String to uniquely identify the answer to the question. (e.g. `yes`)", required: true 
      parameter :page, "The page on which the question was answered (e.g. `landing`)", required: false 
      parameter :locale, "The locale of the user giving feedback. Can we omitted when signed in.", required: false 
      parameter :email, "The email of the user giving the feedback. Can be omitted when signed in.", required: false 
      parameter :message, "The optional message supplied by the user, to explain the anwer", required: false
    end
    ValidationErrorHelper.new.error_fields(self, Frontend::ProductFeedback)


    let(:question) { "found_what_youre_looking_for?" }
    let(:answer) { "no" }
    let(:page) { "landing" }
    let(:locale) { "en" }
    let(:email) { "user@domain.net" }
    let(:message) { "I can't find back the idea I posted last year :(" }

    example "Create new product feedback" do
      do_request
      expect(status).to eq(200)
    end

    describe "errors" do
      let(:question) { nil }
      example_request "[error] Create new product feedback without question" do
        expect(status).to eq (422)
        json_response = json_parse(response_body)
        expect(json_response).to eq ({:errors => {:question=>[{:error=>"blank"}]}})
      end
    end
  end



end
