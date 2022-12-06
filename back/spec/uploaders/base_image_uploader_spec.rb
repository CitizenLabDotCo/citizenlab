# frozen_string_literal: true

require 'carrierwave/test/matchers'
require 'rails_helper'

RSpec.describe BaseImageUploader do
  let(:uploader) { described_class.new }

  it 'whitelists exactly [jpg jpeg gif png webp svg]' do
    expect(uploader.extension_allowlist).to match_array %w[jpg jpeg gif png webp svg]
    expect(uploader.content_type_allowlist).to match_array %w[jpg jpeg gif png webp svg]
    expect(uploader.extension_denylist).to be_blank
    expect(uploader.content_type_denylist).to be_blank
  end
end
