require 'rails_helper'

describe UrlValidationService do
  subject(:service) { described_class.new }

  describe '#whitelisted? and #url_whitelisted?' do
    let :valid_urls do
      [
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
        'https://smartsurvey.co.uk/something',
        'https://www.eventbrite.com/static/widgets/something',
        'https://eventbrite.com/static/widgets/something',
        'https://public.tableau.com/something',
        'https://datastudio.google.com/embed/something',
        'https://app.powerbi.com/something',
        'https://static.ctctcdn.com/js/something',
        'https://instagram.com/something',
        'https://www.instagram.com/something',
        'https://platform.twitter.com/something',
        'https://facebook.com/something',
        'https://www.facebook.com/something',
        'https://subdomain.konveio.com/something',
        'https://www.arcgis.com/something',
        'https://arcgis.com/something'
      ]
    end
    let :invalid_urls do
      [
        'https://customervoice.microsoft.com',
        'https://microsoft.com/something',
        'https://typeform.com/to/something',
        'https://citizenlabco.typeform.com',
        'https://widget.surveymonkey.com',
        'https://docs.google.com/forms/bogus/e/something/viewform?embedded=true',
        'https://surveys.enalyzer.com?bogus=something',
        'https://www.survey-xact.dk/LinkCollector?bogus=something',
        'https://qualtrics.com/jfe/form/something',
        'https://subdomain.qualtrics.com/jfe/bogus/something',
        'https://smartsurvey.co.uk',
        'https://eventbrite.com/bogus/widgets/something',
        'https://tableau.com/something',
        'https://datastudio.google.com/bogus/something',
        'https://static.ctctcdn.com/bogus/something',
        'https://powerbi.com',
        'https://app.powerbi.com',
        'https://instagram.com',
        'https://platform.twitter.com',
        'https://facebook.com',
        'https://konveio.com/something',
        'https://subdomain.arcgis.com'
      ]
    end

    it 'checks that valid urls pass through whitelist' do
      valid_urls.each do |url|
        expect(service.whitelisted?(url.to_s)).to be true
        expect(service.url_whitelisted?(url.to_s)).to be true
      end
    end

    it 'checks that invalid urls do not pass through whitelist' do
      invalid_urls.each do |url|
        expect(service.whitelisted?(url.to_s)).to be false
        expect(service.url_whitelisted?(url.to_s)).to be false
      end
    end
  end

  describe '#whitelisted? and #video_whitelisted?' do
    let :valid_video_urls do
        [
        'https://www.youtube.com/embed/something?showinfo=0',
        'https://youtube.com/embed/something?showinfo=0',
        'https://player.vimeo.com/video/1',
        'https://vimeo.com/1',
        'https://www.vimeo.com/1',
        'https://subdomain.wistia.com/medias/something',
        'https://wistia.com/medias/something',
        'https://www.wistia.com/medias/something',
        'https://www.dailymotion.com/embed/video/something',
        'https://dailymotion.com/embed/video/something',
        'https://media.videotool.dk/?vn=1',
        'https://www.dreambroker.com/channel/something/iframe/something',
        'https://dreambroker.com/channel/something/iframe/something'
      ]
    end
    let :invalid_video_urls do
      [
        'https://www.youtube.com/embed',
        'https://player.vimeo.com/1',
        'https://www.wistia.com',
        'https://www.dailymotion.com/embed',
        'https://videotool.dk/?vn=1',
        'https://www.media.videotool.dk/?vn=1',
        'https://www.dreambroker.com/channel'
      ]
    end

    it 'checks that valid video urls pass through whitelist' do
      valid_video_urls.each do |url|
        expect(service.whitelisted?(url.to_s)).to be true
        expect(service.video_whitelisted?(url.to_s)).to be true
      end
    end

    it 'checks that invalid video urls do not pass through whitelist' do
      invalid_video_urls.each do |url|
        expect(service.whitelisted?(url.to_s)).to be false
        expect(service.video_whitelisted?(url.to_s)).to be false
      end
    end
  end
end
