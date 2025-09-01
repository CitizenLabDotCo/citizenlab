# frozen_string_literal: true

require 'rails_helper'

describe CitizenLab::CloudfrontUrlSigner do
  let(:key_pair_id) { 'test-key-pair-id' }
  let(:private_key) { "-----BEGIN PRIVATE KEY-----\n123123\n-----END PRIVATE KEY-----" }

  describe '#initialize' do
    before do
      stub_const(
        'ENV',
        ENV.except('CLOUDFRONT_KEY_PAIR_ID', 'CLOUDFRONT_PRIVATE_KEY', 'CLOUDFRONT_PRIVATE_KEY_PATH')
      )
    end

    it 'raises MissingConfigurationError when key_pair_id is missing' do
      expect { described_class.new(private_key: private_key) }
        .to raise_error(described_class::MissingConfigurationError)
    end

    it 'raises MissingConfigurationError when private_key is missing' do
      expect { described_class.new(key_pair_id: key_pair_id) }
        .to raise_error(described_class::MissingConfigurationError)
    end

    it 'initializes with provided key_pair_id and private_key' do
      expect(Aws::CloudFront::UrlSigner)
        .to receive(:new)
        .with(key_pair_id: key_pair_id, private_key: private_key)

      described_class.new(key_pair_id: key_pair_id, private_key: private_key)
    end

    it 'initializes with environment variables' do
      stub_const('ENV', ENV.merge(
        'CLOUDFRONT_KEY_PAIR_ID' => key_pair_id,
        'CLOUDFRONT_PRIVATE_KEY' => private_key
      ))

      expect(Aws::CloudFront::UrlSigner)
        .to receive(:new)
        .with(key_pair_id: key_pair_id, private_key: private_key)

      described_class.new
    end

    it 'initializes with environment variables and private key path' do
      allow(File).to receive(:read).with('path/to/private/key').and_return(private_key)
      stub_const('ENV', ENV.merge(
        'CLOUDFRONT_KEY_PAIR_ID' => key_pair_id,
        'CLOUDFRONT_PRIVATE_KEY_PATH' => 'path/to/private/key'
      ))

      expect(Aws::CloudFront::UrlSigner)
        .to receive(:new)
        .with(key_pair_id: key_pair_id, private_key: private_key)

      described_class.new
    end
  end
end
