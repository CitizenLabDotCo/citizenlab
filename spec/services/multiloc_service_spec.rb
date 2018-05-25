require "rails_helper"

describe MultilocService do
  let(:service) { MultilocService.new }

  before do
    settings = Tenant.current.settings
    settings['core']['locales'] = ['fr-FR','en','nl-BE']
    Tenant.current.update(settings: settings)
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
      I18n.with_locale(:'fr-FR') do
        expect(service.t(translations)).to eq 'mot'
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

end
