# frozen_string_literal: true

require 'rails_helper'

# ProcessableUriDownloader is defined in config/initializers/carrierwave.rb.
RSpec.describe ProcessableUriDownloader do
  subject(:downloader) { CarrierWave::Downloader::Base.new(nil) }

  let(:local_url) { 'http://localhost:4000/uploads/header.png?v=1' }

  before { stub_const('ENV', ENV.to_h.merge('DOCKER_BACKEND_HOST' => docker_backend_host)) }

  context 'in development, with DOCKER_BACKEND_HOST set' do
    let(:docker_backend_host) { 'cl-back-web' }

    before { allow(Rails.env).to receive(:development?).and_return(true) }

    it 'sends localhost URLs to the back-end container' do
      expect(downloader.process_uri(local_url).to_s).to eq('http://cl-back-web:4000/uploads/header.png?v=1')
    end

    it 'leaves other hosts alone' do
      url = 'https://cl2-seed-and-template-assets.s3.eu-central-1.amazonaws.com/images/brainstorming_graphic.png'
      expect(downloader.process_uri(url).to_s).to eq(url)
    end

    it 'skips SSRF protection for localhost and the back-end container only' do
      expect(downloader.skip_ssrf_protection?(URI('http://localhost:4000/x'))).to be true
      expect(downloader.skip_ssrf_protection?(URI('http://cl-back-web:4000/x'))).to be true
      expect(downloader.skip_ssrf_protection?(URI('http://169.254.169.254/x'))).to be false
    end
  end

  context 'in development, without DOCKER_BACKEND_HOST' do
    let(:docker_backend_host) { nil }

    before { allow(Rails.env).to receive(:development?).and_return(true) }

    it 'leaves localhost URLs alone' do
      expect(downloader.process_uri(local_url).to_s).to eq(local_url)
    end
  end

  context 'outside development, even with DOCKER_BACKEND_HOST set' do
    let(:docker_backend_host) { 'cl-back-web' }

    before { allow(Rails.env).to receive(:development?).and_return(false) }

    it 'leaves localhost URLs alone' do
      expect(downloader.process_uri(local_url).to_s).to eq(local_url)
    end

    it 'does not skip SSRF protection' do
      expect(downloader.skip_ssrf_protection?(URI('http://localhost:4000/x'))).to be false
      expect(downloader.skip_ssrf_protection?(URI('http://cl-back-web:4000/x'))).to be false
    end
  end
end
