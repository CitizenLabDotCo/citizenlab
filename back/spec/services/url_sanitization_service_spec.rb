require 'rails_helper'

describe UrlSanitizationService do
  let(:service) { UrlSanitizationService.new }

  describe 'whitelist verification' do

    # ---- TODO ----
    # Use Stubbing
    # E.g. allow_any_instance_of(urlService).to receive(:whitelist).an_return(true);

    it 'checks Microsoft Forms url passes through whitelist' do
      expect(service.url_whitelisted?('https://customervoice.microsoft.com/something')).to be true
      expect(service.url_whitelisted?('https://customervoice.microsoft.com')).to be false
      expect(service.url_whitelisted?('https://microsoft.com/something')).to be false
    end
    it 'checks Typeform url passes through whitelist' do
      expect(service.url_whitelisted?('https://citizenlabco.typeform.com/to/something')).to be true
      expect(service.url_whitelisted?('https://citizenlabco.typeform.com')).to be false
      expect(service.url_whitelisted?('https://typeform.com/to/something')).to be false
    end
    it 'checks SurveyMonkey url passes through whitelist' do
      expect(service.url_whitelisted?('https://widget.surveymonkey.com/collect/website/js/something.js')).to be true
      expect(service.url_whitelisted?('https://widget.surveymonkey.com')).to be false
    end
    it 'checks Google Forms url passes through whitelist' do
      expect(service.url_whitelisted?('https://docs.google.com/forms/d/e/something/viewform?embedded=true')).to be true
      expect(service.url_whitelisted?('https://docs.google.com/forms/bogus/e/something/viewform?embedded=true')).to be false
    end
    it 'checks Enalyzer url passes through whitelist' do
      expect(service.url_whitelisted?('https://surveys.enalyzer.com/?pid=something')).to be true
      expect(service.url_whitelisted?('https://surveys.enalyzer.com?pid=something')).to be true
      expect(service.url_whitelisted?('https://surveys.enalyzer.com?bogus=something')).to be false
    end
    it 'checks SurveyXact url passes through whitelist' do
      expect(service.url_whitelisted?('https://www.survey-xact.dk/LinkCollector?key=something')).to be true
      expect(service.url_whitelisted?('https://www.survey-xact.dk/LinkCollector?bogus=something')).to be false
    end
    it 'checks Qualtrics url passes through whitelist' do
      expect(service.url_whitelisted?('https://subdomain.qualtrics.com/jfe/form/something')).to be true
      expect(service.url_whitelisted?('https://subdomain.qualtrics.com/jfe/bogus/something')).to be false
      expect(service.url_whitelisted?('https://qualtrics.com/jfe/form/something')).to be false
    end
    it 'checks SmartSurvey url passes through whitelist' do
      expect(service.url_whitelisted?('https://www.smartsurvey.co.uk/something')).to be true
    end
    it 'checks Eventbrite url passes through whitelist' do
      expect(service.url_whitelisted?('https://www.eventbrite.com/static/widgets/something')).to be true
    end
    it 'checks Tableau url passes through whitelist' do
      expect(service.url_whitelisted?('https://public.tableau.com/something')).to be true
    end
    it 'checks DataStudio url passes through whitelist' do
      expect(service.url_whitelisted?('https://subdomain.datastudio.google.com/embed/something')).to be true
    end
    it 'checks PowerBI url passes through whitelist' do
      expect(service.url_whitelisted?('https://app.powerbi.com/something')).to be true
      expect(service.url_whitelisted?('https://app.powerbi.com')).to be false
    end
    it 'checks Constant Contact url passes through whitelist' do
      expect(service.url_whitelisted?('https://subdomain.static.ctctcdn.com/js/something},')).to be true
      expect(service.url_whitelisted?('https://subdomain.static.ctctcdn.com/bogus/something},')).to be false
    end
    it 'checks Instagram url passes through whitelist' do
      expect(service.url_whitelisted?('https://instagram.com/something')).to be true
      expect(service.url_whitelisted?('https://instagram.com')).to be false
    end
    it 'checks Twitter url passes through whitelist' do
      expect(service.url_whitelisted?('https://platform.twitter.com/something')).to be true
      expect(service.url_whitelisted?('https://platform.twitter.com')).to be false
    end
    it 'checks Facebook url passes through whitelist' do
      expect(service.url_whitelisted?('https://facebook.com/something')).to be true
      expect(service.url_whitelisted?('https://facebook.com')).to be false
    end
    it 'checks Konveio url passes through whitelist' do
      expect(service.url_whitelisted?('https://name.konveio.com/something')).to be true
      expect(service.url_whitelisted?('https://name.konveio.com')).to be false
    end
    it 'checks ArcGis url passes through whitelist' do
      expect(service.url_whitelisted?('https://subdomain.arcgis.com/something')).to be true
      expect(service.url_whitelisted?('https://subdomain.arcgis.com')).to be false
    end
  end
end
