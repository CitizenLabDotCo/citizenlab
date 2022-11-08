# frozen_string_literal: true

require 'rails_helper'

describe UrlValidationService do
  subject(:service) { described_class.new }

  describe '#whitelisted? and #url_whitelisted?' do
    valid_urls = [
      'https://customervoice.microsoft.com/something',
      'https://citizenlabco.typeform.com/to/I3AaTInh',
      'https://widget.surveymonkey.com/collect/website/js/something.js',
      'https://www.surveymonkey.co.uk/r/ZF632GH',
      'https://docs.google.com/forms/d/e/something/viewform?embedded=true',
      'https://docs.google.com/document/d/1rhGoKtBEMrB118KNgSr9CaiA0-1dR_wozSp4fddD0kE/edit?usp=sharing',
      'https://docs.google.com/forms/d/e/1FAIpQLScdxf9qMpfAEIpMR9q2Zz8F0JqMP4kH_Tk_uKIlaH9603iz3Q/viewform?usp=sf_link',
      'https://docs.google.com/spreadsheets/d/1imf6fBE-YO-6cWe_fLTskxcbfCerHCof_DSUQ9a7Ndc/edit?usp=sharing',
      'https://docs.google.com/presentation/d/1tH9H0iptQPQobd6WVvGbdnh5Oe64XkzkZNO3OIHq5bg/edit?usp=sharing',
      'https://www.google.com/maps/d/embed?mid=1NpY8BKXpxsOSGarew0TN3YGdw3e3XC0',
      'https://surveys.enalyzer.com/?pid=cefb4s4s',
      'https://surveys.enalyzer.com?pid=cefb4s4s',
      'https://survey-xact.dk/LinkCollector?key=something',
      'https://www.survey-xact.dk/LinkCollector?key=something',
      'http://www.survey-xact.dk/LinkCollector?key=2H8CQ8F392C1',
      'https://subdomain.qualtrics.com/jfe/form/something',
      'https://www.smartsurvey.co.uk/LU3JMS',
      'https://smartsurvey.co.uk/LU3JMS',
      'https://www.eventbrite.com/static/widgets/something',
      'https://eventbrite.com/static/widgets/something',
      'https://www.eventbrite.com/e/embed-test-tickets-370340266707',
      'https://public.tableau.com/something',
      'https://public.tableau.com/views/CountyExplorationTool/Dashboard1?:language=en-US&:display_count=n&:origin=viz_share_link&:showVizHome=no&:embed=true',
      'https://datastudio.google.com/embed/something',
      'https://app.powerbi.com/something',
      'https://static.ctctcdn.com/js/something',
      'https://instagram.com/something',
      'https://www.instagram.com/something',
      'https://platform.twitter.com/something',
      'https://facebook.com/something',
      'https://www.facebook.com/something',
      'https://maunakea.konveio.com/sites/maunakea.konveio.com/files/u2/MKMasterPlan-AllParts_Sept2021.pdf',
      'https://www.arcgis.com/something',
      'https://arcgis.com/something',
      'https://arcg.is/1jiOj',
      'https://onedrive.live.com/embed?cid=ECDDF98AA79FDEDB&resid=ECDDF98AA79FDEDB%21145&authkey=AIRY6_880wuOdDc&em=2',
      'http://www.slideshare.net/slideshow/embed_code/key/AYBogCfDlXkgMi',
      'https://online1.snapsurveys.com/interview/deff624d-0604-45bb-a072-0c6da45b22e6',
      'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      'https://btt.abalancingact.com/dummy'
    ]

    invalid_urls = [
      'https://customervoice.microsoft.com',
      'https://microsoft.com/something',
      'https://typeform.com/to/something',
      'https://citizenlabco.typeform.com',
      'https://docs.google.com/forms/bogus/e/something/viewform?embedded=true',
      'https://surveys.enalyzer.com?bogus=something',
      'https://www.survey-xact.dk/LinkCollector?bogus=something',
      'https://qualtrics.com/jfe/form/something',
      'https://subdomain.qualtrics.com/jfe/bogus/something',
      'https://smartsurvey.co.uk',
      'https://tableau.com/something',
      'https://datastudio.google.com/bogus/something',
      'https://static.ctctcdn.com/bogus/something',
      'https://powerbi.com',
      'https://app.powerbi.com',
      'https://instagram.com',
      'https://platform.twitter.com',
      'https://facebook.com',
      'https://konveio.com/something',
      'https://subdomain.arcgis.com',
      'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pd',
      'https://btt.abalancingact/dummy'
    ]

    valid_urls.each do |url|
      it "checks that valid url #{url} passes through the whitelist" do
        expect(service.whitelisted?(url.to_s)).to be true
        expect(service.url_whitelisted?(url.to_s)).to be true
      end
    end

    invalid_urls.each do |url|
      it "checks that invalid url #{url} does not pass through the whitelist" do
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
        'https://vimeo.com/1',
        'https://www.vimeo.com/1',
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
