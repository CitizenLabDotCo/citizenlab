# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'MachineTranslations' do
  explanation 'Automatically translates content (ideas/comments) through machine translation'

  before do
    header 'Content-Type', 'application/json'
    resident_header_token

    stub_llm_translator!
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

  post '/web_api/v1/machine_translations/translate_multiloc' do
    with_options scope: :machine_translation do
      parameter :multiloc, 'The multiloc with the source text'
      parameter :source_locale, 'The locale to translate from'
      parameter :target_locales, 'The locales to translate to'
      parameter :html, 'Whether the text is HTML'
    end

    let(:multiloc) { { 'en' => 'Bike lanes in the city centre' } }
    let(:source_locale) { 'en' }
    let(:target_locales) { %w[nl-NL fr-FR] }
    let(:html) { false }

    context 'when admin' do
      before { admin_header_token }

      example_request 'Translate a multiloc into the target locales' do
        expect(status).to eq 200
        expect(json_parse(response_body).dig(:data, :attributes, :multiloc)).to eq(
          'nl-NL': 'This is a translation',
          'fr-FR': 'This is a translation'
        )
      end

      context 'when a target locale is not a platform locale' do
        let(:target_locales) { %w[de-DE] }

        example_request '[error] Returns 422' do
          expect(status).to eq 422
          expect(json_parse(response_body).dig(:errors, :base)).to eq([{ error: 'invalid_locales' }])
        end
      end
    end

    context 'when resident' do
      example_request '[error] Returns 401 unauthorized' do
        expect(status).to eq 401
      end
    end
  end

  private

  def stub_llm_translator!
    translator = instance_double(MachineTranslations::LLMTranslator, translate: 'This is a translation')
    allow(translator).to receive(:translate_to_locales) do |_text, _from, locales_to, **|
      locales_to.index_with { 'This is a translation' }
    end
    allow(MachineTranslations::LLMTranslator).to receive(:new).and_return(translator)
  end
end
