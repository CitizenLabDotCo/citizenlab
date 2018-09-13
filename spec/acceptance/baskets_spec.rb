require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Baskets" do

  explanation 'A collection of ideas selected by the citizen during participatory budgeting. AKA "cart" (US), "buggy" (American south), "carriage" (New England) or "trolley"'

  before do
    header "Content-Type", "application/json"

    @user = create(:user)
    @ideas = create_list(:idea, 3)
    create_list(:basket, 2)
    @basket = create(:basket, ideas: @ideas, user: @user)
  end

  get "web_api/v1/baskets/:basket_id" do
    let(:basket_id) { @basket.id }

    context "when authenticated" do
      before do
        token = Knock::AuthToken.new(payload: { sub: @user.id }).token
        header 'Authorization', "Bearer #{token}"
      end

      example_request "Get one basket by id" do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq @basket.id
        expect(json_response.dig(:data, :relationships, :ideas, :data).map{|h| h[:id]}).to match_array @ideas.map(&:id)
      end
    end
  end

  post "web_api/v1/baskets" do
    with_options scope: :basket do
      parameter :submitted_at, "The time at which the basket was submitted to the city", required: false
      parameter :user_id, "The id of the user to whom the basket belongs", required: true
      parameter :participation_context_id, "The id of the phase/project to whom the basket belongs", required: true
      parameter :participation_context_type, "The type of the participation context (e.g. Project, Phase)", required: true
      parameter :idea_ids, "An array of idea ids that have been added to basket", required: false
    end
    ValidationErrorHelper.new.error_fields(self, Basket)

    context "when authenticated" do
      before do
        token = Knock::AuthToken.new(payload: { sub: @user.id }).token
        header 'Authorization', "Bearer #{token}"
      end

      let(:basket) { build(:basket, user: @user) }
      let(:user_id) { basket.user_id }
      let(:participation_context_id) { basket.participation_context_id }
      let(:participation_context_type) { basket.participation_context_type }
      let(:idea_ids) { basket.idea_ids }

      example_request "Create a basket" do
        expect(response_status).to eq 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :relationships, :user, :data, :id)).to eq user_id
        expect(json_response.dig(:data, :relationships, :ideas, :data).map{|h| h[:id]}).to match_array basket.idea_ids
        expect(json_response.dig(:data, :relationships, :participation_context, :data, :id)).to eq participation_context_id
      end
    end
  end
end