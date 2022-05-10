require 'rails_helper'

describe UrlValidationService do
  subject(:service) { described_class.new }

  describe '#whitelisted?' do
    it 'checks YouTube url passes through whitelist' do
      expect(service.whitelisted?('https://www.youtube.com/embed/something?showinfo=0')).to be true
      expect(service.whitelisted?('https://youtube.com/embed/something?showinfo=0')).to be true
      expect(service.whitelisted?('https://www.youtube.com/embed')).to be false
    end
    it 'checks Vimeo url passes through whitelist' do
      expect(service.whitelisted?('https://player.vimeo.com/video/1')).to be true
      expect(service.whitelisted?('https://player.vimeo.com/1')).to be false
      expect(service.whitelisted?('https://vimeo.com/1')).to be true
      expect(service.whitelisted?('https://www.vimeo.com/1')).to be true
    end
    it 'checks Wistia url passes through whitelist' do
      expect(service.whitelisted?('https://subdomain.wistia.com/medias/something')).to be true
      expect(service.whitelisted?('https://wistia.com/medias/something')).to be true
      expect(service.whitelisted?('https://www.wistia.com/medias/something')).to be true
      expect(service.whitelisted?('https://www.wistia.com')).to be false
    end
    it 'checks DailyMotion url passes through whitelist' do
      expect(service.whitelisted?('https://www.dailymotion.com/embed/video/something')).to be true
      expect(service.whitelisted?('https://dailymotion.com/embed/video/something')).to be true
      expect(service.whitelisted?('https://www.dailymotion.com/embed')).to be false
    end
    it 'checks VideoTool url passes through whitelist' do
      expect(service.whitelisted?('https://media.videotool.dk/?vn=1')).to be true
      expect(service.whitelisted?('https://videotool.dk/?vn=1')).to be false
      expect(service.whitelisted?('https://www.media.videotool.dk/?vn=1')).to be false
    end
    it 'checks DreamBroker url passes through whitelist' do
      expect(service.whitelisted?('https://www.dreambroker.com/channel/something/iframe/something')).to be true
      expect(service.whitelisted?('https://dreambroker.com/channel/something/iframe/something')).to be true
      expect(service.whitelisted?('https://www.dreambroker.com/channel')).to be false
    end
    it 'checks Microsoft Forms url passes through whitelist' do
      expect(service.whitelisted?('https://customervoice.microsoft.com/something')).to be true
      expect(service.whitelisted?('https://customervoice.microsoft.com')).to be false
      expect(service.whitelisted?('https://microsoft.com/something')).to be false
    end
    it 'checks Typeform url passes through whitelist' do
      expect(service.whitelisted?('https://citizenlabco.typeform.com/to/something')).to be true
      expect(service.whitelisted?('https://citizenlabco.typeform.com')).to be false
      expect(service.whitelisted?('https://typeform.com/to/something')).to be false
    end
    it 'checks SurveyMonkey url passes through whitelist' do
      expect(service.whitelisted?('https://widget.surveymonkey.com/collect/website/js/something.js')).to be true
      expect(service.whitelisted?('https://widget.surveymonkey.com')).to be false
    end
    it 'checks Google Forms url passes through whitelist' do
      expect(service.whitelisted?('https://docs.google.com/forms/d/e/something/viewform?embedded=true')).to be true
      expect(service.whitelisted?('https://docs.google.com/forms/bogus/e/something/viewform?embedded=true')).to be false
    end
    it 'checks Enalyzer url passes through whitelist' do
      expect(service.whitelisted?('https://surveys.enalyzer.com/?pid=something')).to be true
      expect(service.whitelisted?('https://surveys.enalyzer.com?pid=something')).to be true
      expect(service.whitelisted?('https://surveys.enalyzer.com?bogus=something')).to be false
    end
    it 'checks SurveyXact url passes through whitelist' do
      expect(service.whitelisted?('https://www.survey-xact.dk/LinkCollector?key=something')).to be true
      expect(service.whitelisted?('https://survey-xact.dk/LinkCollector?key=something')).to be true
      expect(service.whitelisted?('https://www.survey-xact.dk/LinkCollector?bogus=something')).to be false
    end
    it 'checks Qualtrics url passes through whitelist' do
      expect(service.whitelisted?('https://subdomain.qualtrics.com/jfe/form/something')).to be true
      expect(service.whitelisted?('https://subdomain.qualtrics.com/jfe/bogus/something')).to be false
      expect(service.whitelisted?('https://qualtrics.com/jfe/form/something')).to be false
    end
    it 'checks SmartSurvey url passes through whitelist' do
      expect(service.whitelisted?('https://www.smartsurvey.co.uk/something')).to be true
      expect(service.whitelisted?('https://smartsurvey.co.uk/something')).to be true
    end
    it 'checks Eventbrite url passes through whitelist' do
      expect(service.whitelisted?('https://www.eventbrite.com/static/widgets/something')).to be true
      expect(service.whitelisted?('https://eventbrite.com/static/widgets/something')).to be true
    end
    it 'checks Tableau url passes through whitelist' do
      expect(service.whitelisted?('https://public.tableau.com/something')).to be true
      expect(service.whitelisted?('https://tableau.com/something')).to be false
    end
    it 'checks DataStudio url passes through whitelist' do
      expect(service.whitelisted?('https://datastudio.google.com/embed/something')).to be true
      expect(service.whitelisted?('https://datastudio.google.com/bogus/something')).to be false
    end
    it 'checks PowerBI url passes through whitelist' do
      expect(service.whitelisted?('https://app.powerbi.com/something')).to be true
      expect(service.whitelisted?('https://app.powerbi.com')).to be false
      expect(service.whitelisted?('https://powerbi.com')).to be false
    end
    it 'checks Constant Contact url passes through whitelist' do
      expect(service.whitelisted?('https://static.ctctcdn.com/js/something},')).to be true
      expect(service.whitelisted?('https://static.ctctcdn.com/bogus/something},')).to be false
    end
    it 'checks Instagram url passes through whitelist' do
      expect(service.whitelisted?('https://instagram.com/something')).to be true
      expect(service.whitelisted?('https://www.instagram.com/something')).to be true
      expect(service.whitelisted?('https://instagram.com')).to be false
    end
    it 'checks Twitter url passes through whitelist' do
      expect(service.whitelisted?('https://platform.twitter.com/something')).to be true
      expect(service.whitelisted?('https://platform.twitter.com')).to be false
    end
    it 'checks Facebook url passes through whitelist' do
      expect(service.whitelisted?('https://facebook.com/something')).to be true
      expect(service.whitelisted?('https://www.facebook.com/something')).to be true
      expect(service.whitelisted?('https://facebook.com')).to be false
    end
    it 'checks Konveio url passes through whitelist' do
      expect(service.whitelisted?('https://subdomain.konveio.com/something')).to be true
      expect(service.whitelisted?('https://konveio.com/something')).to be false
    end
    it 'checks ArcGis url passes through whitelist' do
      expect(service.whitelisted?('https://www.arcgis.com/something')).to be true
      expect(service.whitelisted?('https://arcgis.com/something')).to be true
      expect(service.whitelisted?('https://subdomain.arcgis.com')).to be false
    end
  end
end
