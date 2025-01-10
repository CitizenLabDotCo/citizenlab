# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'MachineTranslations' do
  explanation 'Automatically translates content (ideas/comments) through machine translation'

  before do
    header 'Content-Type', 'application/json'
    resident_header_token

    stub_easy_translate!
  end

  get '/web_api/v1/ideas/:idea_id/machine_translation' do
    with_options scope: :machine_translation do
      parameter :attribute_name, 'The name of the attribute to translate (e.g. title_multiloc)'
      parameter :locale_to, 'The locale to translate to'
    end

    describe 'Get one machine translation:' do
      let(:translation) { create(:machine_translation, translatable: create(:idea, title_multiloc: { 'nl-BE' => 'Fietssnelweg doorheen het stadcentrum' })) }
      let(:idea_id) { translation.translatable_id }
      let(:attribute_name) { translation.attribute_name }
      let(:locale_to) { translation.locale_to }

      example_request 'Return an up to date translation if it has already been created' do
        expect(status).to eq 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :attributes, :translation)).to eq translation.translation
      end

      example 'Update the translation if it has already been created but the original text might have changed' do
        prev_updated_at = translation.updated_at
        translation.translatable.update! title_multiloc: { 'nl-BE' => 'Fietssnelweg doorheen elke deelgemeente' }
        do_request
        expect(status).to eq 200
        expect(translation.reload.updated_at).to be > prev_updated_at
      end

      example '[error] Create a translation for an unknown resource' do
        translation.translatable.destroy!
        do_request
        expect(status).to eq 404
      end

      context 'When tranlsatable attribute does not exist' do
        let(:attribute_name) { 'not_an_attribute' }

        example '[error] Create a translation for a nonexistent attribute' do
          do_request
          expect(status).to eq 422
          json_response = json_parse response_body
          expect(json_response.dig(:errors, :base)).to eq([{ error: 'unable_to_translate' }])
        end
      end
    end

    describe do
      let(:translation) { nil }
      let(:idea_id) { create(:idea).id }
      let(:attribute_name) { 'title_multiloc' }
      let(:locale_to) { 'en' }

      example_request 'A new machine translation is created when the translation was never done before' do
        expect(status).to eq 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :attributes, :attribute_name)).to eq attribute_name
        expect(json_response.dig(:data, :relationships, :translatable, :data, :id)).to eq idea_id
      end

      context 'when the machine_translations feature is disabled' do
        before { SettingsService.new.deactivate_feature!('machine_translations') }

        example_request '[error] Returns 401 unauthorized' do
          expect(status).to eq 401
        end
      end
    end
  end

  get '/web_api/v1/comments/:comment_id/machine_translation' do
    with_options scope: :machine_translation do
      parameter :attribute_name, 'The name of the attribute to translate (e.g. title_multiloc)'
      parameter :locale_to, 'The locale to translate to'
    end

    describe 'Get one machine translation:' do
      let(:translation) { create(:machine_translation, translatable: create(:comment, body_multiloc: { 'nl-BE' => "That's quite an awesome thought." })) }
      let(:comment_id) { translation.translatable_id }
      let(:attribute_name) { translation.attribute_name }
      let(:locale_to) { translation.locale_to }

      example_request 'Return an up to date translation if it has already been created' do
        expect(status).to eq 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :attributes, :translation)).to eq translation.translation
      end
    end
  end

  private

  def stub_easy_translate!
    EasyTranslate.stub(:translate) do
      'This is a translation'
    end
  end
end
