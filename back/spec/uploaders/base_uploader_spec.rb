# frozen_string_literal: true

require 'rails_helper'

RSpec.describe BaseUploader do
  let(:uploader) { described_class }

  describe '.use_fog_engine?' do
    before do
      allow(Rails.env).to receive(:test?).and_return(false)
      allow(uploader).to receive(:fog_credentials).and_return('some credentials')
      allow(uploader).to receive(:fog_directory).and_return('some directory')
    end

    it 'returns false in test' do
      allow(Rails.env).to receive(:test?).and_return(true)

      expect(uploader.use_fog_engine?).to be(false)
    end

    it 'returns true in development if ENV[\'USE_AWS_S3_IN_DEV\'] == \'true\'' do
      allow(Rails.env).to receive(:development?).and_return(true)
      # using expect will reveal all ENV vars in case of failure
      allow(ENV).to receive(:[]).with('USE_AWS_S3_IN_DEV').and_return('true')

      expect(uploader.use_fog_engine?).to be(true)
    end

    it 'returns false in development if ENV[\'USE_AWS_S3_IN_DEV\'] != \'true\'' do
      allow(Rails.env).to receive(:development?).and_return(true)
      # using expect will reveal all ENV vars in case of failure
      allow(ENV).to receive(:[]).with('USE_AWS_S3_IN_DEV').and_return(nil)

      expect(uploader.use_fog_engine?).to be(false)
    end

    it 'returns true in production' do
      allow(Rails.env).to receive(:production?).and_return(true)

      expect(uploader.use_fog_engine?).to be(true)
    end
  end
end
