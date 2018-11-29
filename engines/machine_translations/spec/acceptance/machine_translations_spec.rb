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

  get "/web_api/v1/ideas/:idea_id/machine_translation" do
    with_options scope: :machine_translation do
      parameter :attribute_name, "The name of the attribute to translate (e.g. title_multiloc)"
      parameter :locale_to, "The locale to translate to"
    end

    let(:translation) { create(:machine_translation) }
    let(:idea_id) { translation.translatable_id }
    let(:attribute_name) { translation.attribute_name }
    let(:locale_to) { translation.locale_to }

    example_request "Get one machine translation by id" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :attributes, :translation)).to eq translation.translation
    end
  end

end