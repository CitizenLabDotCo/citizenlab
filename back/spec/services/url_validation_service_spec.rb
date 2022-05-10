require 'rails_helper'

describe UrlValidationService do
  subject(:service) { described_class.new }

  describe '#url_whitelisted?' do
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
      expect(service.url_whitelisted?('https://survey-xact.dk/LinkCollector?key=something')).to be true
      expect(service.url_whitelisted?('https://www.survey-xact.dk/LinkCollector?bogus=something')).to be false
    end
    it 'checks Qualtrics url passes through whitelist' do
      expect(service.url_whitelisted?('https://subdomain.qualtrics.com/jfe/form/something')).to be true
      expect(service.url_whitelisted?('https://subdomain.qualtrics.com/jfe/bogus/something')).to be false
      expect(service.url_whitelisted?('https://qualtrics.com/jfe/form/something')).to be false
    end
    it 'checks SmartSurvey url passes through whitelist' do
      expect(service.url_whitelisted?('https://www.smartsurvey.co.uk/something')).to be true
      expect(service.url_whitelisted?('https://smartsurvey.co.uk/something')).to be true
    end
    it 'checks Eventbrite url passes through whitelist' do
      expect(service.url_whitelisted?('https://www.eventbrite.com/static/widgets/something')).to be true
      expect(service.url_whitelisted?('https://eventbrite.com/static/widgets/something')).to be true
    end
    it 'checks Tableau url passes through whitelist' do
      expect(service.url_whitelisted?('https://public.tableau.com/something')).to be true
      expect(service.url_whitelisted?('https://tableau.com/something')).to be false
    end
    it 'checks DataStudio url passes through whitelist' do
      expect(service.url_whitelisted?('https://datastudio.google.com/embed/something')).to be true
      expect(service.url_whitelisted?('https://datastudio.google.com/bogus/something')).to be false
    end
    it 'checks PowerBI url passes through whitelist' do
      expect(service.url_whitelisted?('https://app.powerbi.com/something')).to be true
      expect(service.url_whitelisted?('https://app.powerbi.com')).to be false
      expect(service.url_whitelisted?('https://powerbi.com')).to be false
    end
    it 'checks Constant Contact url passes through whitelist' do
      expect(service.url_whitelisted?('https://static.ctctcdn.com/js/something},')).to be true
      expect(service.url_whitelisted?('https://static.ctctcdn.com/bogus/something},')).to be false
    end
    it 'checks Instagram url passes through whitelist' do
      expect(service.url_whitelisted?('https://instagram.com/something')).to be true
      expect(service.url_whitelisted?('https://www.instagram.com/something')).to be true
      expect(service.url_whitelisted?('https://instagram.com')).to be false
    end
    it 'checks Twitter url passes through whitelist' do
      expect(service.url_whitelisted?('https://platform.twitter.com/something')).to be true
      expect(service.url_whitelisted?('https://platform.twitter.com')).to be false
    end
    it 'checks Facebook url passes through whitelist' do
      expect(service.url_whitelisted?('https://facebook.com/something')).to be true
      expect(service.url_whitelisted?('https://www.facebook.com/something')).to be true
      expect(service.url_whitelisted?('https://facebook.com')).to be false
    end
    it 'checks Konveio url passes through whitelist' do
      expect(service.url_whitelisted?('https://subdomain.konveio.com/something')).to be true
      expect(service.url_whitelisted?('https://konveio.com/something')).to be false
    end
    it 'checks ArcGis url passes through whitelist' do
      expect(service.url_whitelisted?('https://www.arcgis.com/something')).to be true
      expect(service.url_whitelisted?('https://arcgis.com/something')).to be true
      expect(service.url_whitelisted?('https://subdomain.arcgis.com')).to be false
    end
  end
end
