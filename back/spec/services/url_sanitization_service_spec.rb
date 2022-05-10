require 'rails_helper'

describe UrlSanitizationService do
  let(:service) { UrlSanitizationService.new }

  describe 'whitelist verification' do

    # ---- TODO ----
    # two cases for HTML specifically
    # Correct URL, and wrong URL
    # Use Stubbing
    # E.g. allow_any_instance_of(urlService).to receive(:whitelist).an_return(true);

    it 'allows Microsoft Forms url to pass through whitelist' do
      expect(service.url_whitelisted?("https://customervoice.microsoft.com/Pages/ResponsePage.aspx?id=Zl36w")).to be true;
    end
    it 'allows Typeform url to pass through whitelist' do
      expect(service.url_whitelisted?("")).to be true;
    end
    it 'allows SurveyMonkey url to pass through whitelist' do
      expect(service.url_whitelisted?("")).to be true;
    end
    it 'allows Google Forms url to pass through whitelist' do
      expect(service.url_whitelisted?("")).to be true;
    end
    it 'allows Enalyzer url to pass through whitelist' do
      expect(service.url_whitelisted?("")).to be true;
    end
    it 'allows SurveyXact url to pass through whitelist' do
      expect(service.url_whitelisted?("")).to be true;
    end
    it 'allows Qualtrics url to pass through whitelist' do
      expect(service.url_whitelisted?("")).to be true;
    end
    it 'allows SmartSurvey url to pass through whitelist' do
      expect(service.url_whitelisted?("")).to be true;
    end
    it 'allows Eventbrite url to pass through whitelist' do
      expect(service.url_whitelisted?("")).to be true;
    end
    it 'allows Tableau url to pass through whitelist' do
      expect(service.url_whitelisted?("")).to be true;
    end
    it 'allows DataStudio url to pass through whitelist' do
      expect(service.url_whitelisted?("")).to be true;
    end
    it 'allows PowerBI url to pass through whitelist' do
      expect(service.url_whitelisted?("")).to be true;
    end
    it 'allows Data Studio url to pass through whitelist' do
      expect(service.url_whitelisted?("")).to be true;
    end
    it 'allows Constant Contact url to pass through whitelist' do
      expect(service.url_whitelisted?("")).to be true;
    end
    it 'allows Instagram url to pass through whitelist' do
      expect(service.url_whitelisted?("")).to be true;
    end
    it 'allows Twitter url to pass through whitelist' do
      expect(service.url_whitelisted?("")).to be true;
    end
    it 'allows Facebook url to pass through whitelist' do
      expect(service.url_whitelisted?("")).to be true;
    end
    it 'allows Konveio url to pass through whitelist' do
      expect(service.url_whitelisted?("")).to be true;
    end
  end
end
