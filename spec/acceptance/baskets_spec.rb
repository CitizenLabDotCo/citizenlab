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
end