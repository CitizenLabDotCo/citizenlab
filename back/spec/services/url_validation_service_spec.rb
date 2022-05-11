require 'rails_helper'

describe UrlValidationService do
  subject(:service) { described_class.new }

  describe '#whitelisted?' do
    VALID_URLS = [
      'https://customervoice.microsoft.com/something',
      'https://citizenlabco.typeform.com/to/something',
      'https://widget.surveymonkey.com/collect/website/js/something.js',
      'https://docs.google.com/forms/d/e/something/viewform?embedded=true',
      'https://surveys.enalyzer.com/?pid=something',
      'https://surveys.enalyzer.com?pid=something',
      'https://survey-xact.dk/LinkCollector?key=something',
      'https://www.survey-xact.dk/LinkCollector?key=something',
      'https://subdomain.qualtrics.com/jfe/form/something',
      'https://www.smartsurvey.co.uk/something',
      'https://www.eventbrite.com/static/widgets/something',
      'https://public.tableau.com/something',
      'https://datastudio.google.com/embed/something',
      'https://app.powerbi.com/something',
      'https://static.ctctcdn.com/js/something',
      'https://instagram.com/something',
      'https://platform.twitter.com/something',
      'https://facebook.com/something',
      'https://subdomain.konveio.com/something',
      'https://www.arcgis.com/something'
    ]
    INVALID_URLS = [
      'https://microsoft.com/something',
      'https://typeform.com/to/something',
      'https://widget.surveymonkey.com',
      'https://docs.google.com/forms/bogus/e/something/viewform?embedded=true',
      'https://surveys.enalyzer.com?bogus=something',
      'https://www.survey-xact.dk/LinkCollector?bogus=something',
      'https://qualtrics.com/jfe/form/something',
      'https://smartsurvey.co.uk',
      'https://eventbrite.com/bogus/widgets/something',
      'https://tableau.com/something',
      'https://datastudio.google.com/bogus/something',
      'https://static.ctctcdn.com/bogus/something',
      'https://instagram.com',
      'https://platform.twitter.com',
      'https://facebook.com',
      'https://konveio.com/something',
      'https://subdomain.arcgis.com'
    ]
    VALID_VIDEO_URLS = [
      'https://www.youtube.com/embed/something?showinfo=0',
      'https://player.vimeo.com/video/1',
      'https://subdomain.wistia.com/medias/something',
      'https://www.dailymotion.com/embed/video/something',
      'https://media.videotool.dk/?vn=1',
      'https://www.dreambroker.com/channel/something/iframe/something'
    ]
    INVALID_VIDEO_URLS = [
      'https://www.youtube.com/embed',
      'https://player.vimeo.com/1',
      'https://www.wistia.com',
      'https://www.dailymotion.com/embed',
      'https://videotool.dk/?vn=1',
      'https://www.dreambroker.com/channel'
    ]

    it 'checks that valid urls pass through whitelist' do
      VALID_URLS.each do |url|
        expect(service.whitelisted?("#{url}")).to be true
        expect(service.url_whitelisted?("#{url}")).to be true
      end
    end
    it 'checks that invalid urls do not pass through whitelist' do
      INVALID_URLS.each do |url|
        expect(service.whitelisted?("#{url}")).to be false
        expect(service.url_whitelisted?("#{url}")).to be false
      end
    end
    it 'checks that valid video urls pass through whitelist' do
      VALID_VIDEO_URLS.each do |url|
        expect(service.whitelisted?("#{url}")).to be true
        expect(service.video_whitelisted?("#{url}")).to be true
      end
    end
    it 'checks that invalid video urls do not pass through whitelist' do
      INVALID_VIDEO_URLS.each do |url|
        expect(service.whitelisted?("#{url}")).to be false
        expect(service.video_whitelisted?("#{url}")).to be false
      end
    end
  end

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
      expect(service.url_whitelisted?('https://smartsurvey.co.uk')).to be false
      expect(service.url_whitelisted?('https://smartsurvey.co.uk/something')).to be true
    end
    it 'checks Eventbrite url passes through whitelist' do
      expect(service.url_whitelisted?('https://www.eventbrite.com/static/widgets/something')).to be true
      expect(service.url_whitelisted?('https://eventbrite.com/static/widgets/something')).to be true
      expect(service.url_whitelisted?('https://eventbrite.com/bogus/widgets/something')).to be false
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
      expect(service.url_whitelisted?('https://static.ctctcdn.com/js/something,')).to be true
      expect(service.url_whitelisted?('https://static.ctctcdn.com/bogus/something,')).to be false
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

  describe '#video_whitelisted?' do
    it 'checks YouTube url passes through whitelist' do
      expect(service.video_whitelisted?('https://www.youtube.com/embed/something?showinfo=0')).to be true
      expect(service.video_whitelisted?('https://youtube.com/embed/something?showinfo=0')).to be true
      expect(service.video_whitelisted?('https://www.youtube.com/embed')).to be false
    end
    it 'checks Vimeo url passes through whitelist' do
      expect(service.video_whitelisted?('https://player.vimeo.com/video/1')).to be true
      expect(service.video_whitelisted?('https://player.vimeo.com/1')).to be false
      expect(service.video_whitelisted?('https://vimeo.com/1')).to be true
      expect(service.video_whitelisted?('https://www.vimeo.com/1')).to be true
    end
    it 'checks Wistia url passes through whitelist' do
      expect(service.video_whitelisted?('https://subdomain.wistia.com/medias/something')).to be true
      expect(service.video_whitelisted?('https://wistia.com/medias/something')).to be true
      expect(service.video_whitelisted?('https://www.wistia.com/medias/something')).to be true
      expect(service.video_whitelisted?('https://www.wistia.com')).to be false
    end
    it 'checks DailyMotion url passes through whitelist' do
      expect(service.video_whitelisted?('https://www.dailymotion.com/embed/video/something')).to be true
      expect(service.video_whitelisted?('https://dailymotion.com/embed/video/something')).to be true
      expect(service.video_whitelisted?('https://www.dailymotion.com/embed')).to be false
    end
    it 'checks VideoTool url passes through whitelist' do
      expect(service.video_whitelisted?('https://media.videotool.dk/?vn=1')).to be true
      expect(service.video_whitelisted?('https://videotool.dk/?vn=1')).to be false
      expect(service.video_whitelisted?('https://www.media.videotool.dk/?vn=1')).to be false
    end
    it 'checks DreamBroker url passes through whitelist' do
      expect(service.video_whitelisted?('https://www.dreambroker.com/channel/something/iframe/something')).to be true
      expect(service.video_whitelisted?('https://dreambroker.com/channel/something/iframe/something')).to be true
      expect(service.video_whitelisted?('https://www.dreambroker.com/channel')).to be false
    end
  end
end
