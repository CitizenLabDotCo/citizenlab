# frozen_string_literal: true

require 'carrierwave/test/matchers'
require 'rails_helper'

RSpec.describe HeaderBgUploader do
  include CarrierWave::Test::Matchers

  let(:uploader) { described_class.new(home_page) }

  # rubocop:disable RSpec/VerifiedDoubles
  # Yes in general it's much more robust to use VerifiedDoubles, but in this test case we really just need any kind of
  # object which we can use with the uploader. It does not need to based on a real class.
  let(:home_page) { double('home_page', header_bg: nil, id: '812451ad-9ff4-47c3-966a-5ebd935f0f73') }
  # rubocop:enable RSpec/VerifiedDoubles

  before do
    described_class.enable_processing = true
    Rails.root.join('spec/fixtures/header.jpg').open { |f| uploader.store!(f) }
  end

  after do
    described_class.enable_processing = false
    uploader.remove!
  end

  it 'creates a large version' do
    expect(uploader.large).to have_dimensions(1920, 640)
  end

  it 'creates a medium version' do
    expect(uploader.medium).to have_dimensions(720, 152)
  end

  it 'creates a small version' do
    expect(uploader.small).to have_dimensions(520, 250)
  end
end
