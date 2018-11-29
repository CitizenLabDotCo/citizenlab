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

    describe "Get one machine translation:" do
      let(:translation) { create(:machine_translation, translatable: create(:idea, title_multiloc: {'nl-BE' => 'Fietssnelweg doorheen het stadcentrum'})) }
      let(:idea_id) { translation.translatable_id }
      let(:attribute_name) { translation.attribute_name }
      let(:locale_to) { translation.locale_to }

      example_request "Return an up to date translation if it has already been created" do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :translation)).to eq translation.translation
      end

      describe '' do
        let(:translation) { nil }
        let(:idea_id) { create(:idea).id }
        let(:attribute_name) { 'title_multiloc' }
        let(:locale_to) { 'en' }

        example_request "A new machine translation is created when the translation was never done before" do
          expect(status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :attributes, :attribute_name)).to eq attribute_name
        end
      end

      example "Update the translation if it has already been created but the original text might have changed" do
        prev_updated_at = translation.updated_at
        translation.translatable.update! title_multiloc: {'nl-BE' => 'Fietssnelweg doorheen elke deelgemeente'}
        do_request
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(translation.reload.updated_at).to be > prev_updated_at
      end
    end
  end

end