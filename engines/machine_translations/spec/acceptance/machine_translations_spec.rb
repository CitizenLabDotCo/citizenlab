require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "MachineTranslations" do

  explanation "Automatically translates content (ideas/comments) through machine translation"

  before do
    header "Content-Type", "application/json"
    @user = create(:user)
    token = Knock::AuthToken.new(payload: { sub: @user.id }).token
    header 'Authorization', "Bearer #{token}"
  end

  get "/web_api/v1/machine_translations/:id" do
    let(:translation) { create(:machine_translation) }
    let(:id) {translation.id}

    example_request "Get one machine translation by id" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq id
    end
  end

end