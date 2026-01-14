# frozen_string_literal: true

require 'rails_helper'

describe UrlValidationService do
  subject(:service) { described_class.new }

  describe '#video_whitelisted?' do
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
        'https://dreambroker.com/channel/something/iframe/something',
        'https://www.videoask.com/fo7kzkcxv'
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
        expect(service.video_whitelisted?(url.to_s)).to be true
      end
    end

    it 'checks that invalid video urls do not pass through whitelist' do
      invalid_video_urls.each do |url|
        expect(service.video_whitelisted?(url.to_s)).to be false
      end
    end
  end
end
