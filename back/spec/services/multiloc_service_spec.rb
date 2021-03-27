require "rails_helper"

describe MultilocService do
  let(:service) { MultilocService.new }

  before do
    settings = AppConfiguration.instance.settings
    settings['core']['locales'] = ['fr-FR','en','nl-BE']
    AppConfiguration.instance.update(settings: settings)
  end

  describe "t" do

    let(:user) {create(:user, locale: 'en')}
    let(:translations) {{
      'nl-BE' => 'woord',
      'fr-FR' => 'mot',
      'en' => 'word'
    }}

    it "returns nil when the provided translations are nil" do
      expect(service.t(nil)).to be_nil
    end

    it "picks the user locale from the translations when available" do
      expect(service.t(translations, user)).to eq 'word'
    end

    it "falls back to i18n locale when there's no user" do
      I18n.with_locale(:'nl-BE') do
        expect(service.t(translations)).to eq 'woord'
      end
    end

    it "falls back to the first available tenant locale when the translations don't contain the requested" do
      user.update(locale: 'de-DE')
      expect(service.t(translations, user)).to eq "mot"
    end

    it "falls back to the first available translation when no tenant locale is available" do
      translations = {
        'de-DE': 'wort',
        pt: 'worto'
      }
      expect(service.t(translations, user)).to eq "wort"
    end

    it "returns an empty string when no translation is defined" do
      expect(service.t({}, user)).to eq ""
    end

    it "returns an empty string when that's what the translations define" do
      translations['en'] = ""
      expect(service.t(translations, user)).to eq ""
    end
  end

  describe "i18n_to_multiloc" do
    before do
      I18n.backend.store_translations(:en, {
        foo: {
          hello: 'hello!'
        }
      })
      I18n.backend.store_translations(:'nl-BE', {
        foo: {
          hello: 'hallo!'
        }
      })
      I18n.backend.store_translations(:'fr-FR', {
        foo: {
          hello: 'bonjour!'
        }
      })
    end

    it "assembles a multiloc object for a given translation key" do
      expect(service.i18n_to_multiloc('foo.hello')).to eq({
        "en" => 'hello!',
        "nl-BE" => 'hallo!',
        "fr-FR" => 'bonjour!'
      })
    end

    it "returns missing strings for a missing translation key" do
      expect{service.i18n_to_multiloc('not.existing.key')}.to raise_error(I18n::MissingTranslationData)
    end

    it "supports setting the returned locales explicitly" do
      expect(service.i18n_to_multiloc('foo.hello', locales: ["en", "fr-FR"])).to eq({
        "en" => 'hello!',
        "fr-FR" => 'bonjour!'
      })
    end
  end

  describe "block_to_multiloc" do
    it "assembles a multiloc object with a given block" do
      expect(service.block_to_multiloc{|locale| locale}).to eq({
        'fr-FR' => 'fr-FR',
        'en' => 'en',
        'nl-BE' => 'nl-BE'
      })
    end

    it "switches the i18n.locale in the given block" do
      expect(service.block_to_multiloc{|_locale| I18n.locale.to_s}).to eq({
        'fr-FR' => 'fr-FR',
        'en' => 'en',
        'nl-BE' => 'nl-BE'
      })
    end
  end

  describe "is_empty?" do
    it "returns true on a nil multiloc" do
      expect(service.is_empty?(nil)).to be true
    end

    it "returns true on a multiloc with only empty values" do
      expect(service.is_empty?({en: ''})).to be true
    end

    it "returns false on a multiloc with values" do
      expect(service.is_empty?({en: 'yes', 'nl-NL' => ''})).to be false
    end
  end

end
