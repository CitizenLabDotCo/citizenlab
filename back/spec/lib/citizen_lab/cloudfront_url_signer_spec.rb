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

  describe '#sign_url' do
    let(:signer) { described_class.new(key_pair_id: key_pair_id, private_key: OpenSSL::PKey::RSA.generate(2048).to_pem) }
    let(:url) { 'https://example.org/uploads/tenant/image/1/photo.jpg' }

    def expires(signed_url)
      Rack::Utils.parse_query(URI(signed_url).query)['Expires'].to_i
    end

    it 'signs a URL the same way for a day, then moves on to the next day' do
      sign_at = ->(time) { travel_to(Time.zone.at(time)) { signer.sign_url(url, expires_in: 1.day) } }
      expiry = expires(sign_at.call(Time.zone.parse('2026-09-17 10:00:00 UTC').to_i))
      # The last moment that still gets this expiry.
      last = expiry - 1.day.to_i

      expect(sign_at.call(last - 1.day.to_i + 1)).to eq sign_at.call(last)
      expect(expires(sign_at.call(last + 1))).to eq expiry + 1.day.to_i
    end

    it 'expires no earlier than asked, and less than a day later' do
      travel_to(Time.zone.parse('2026-09-17 10:00:00 UTC')) do
        earliest = 1.month.from_now.to_i

        expect(expires(signer.sign_url(url))).to be_between(earliest, earliest + 1.day.to_i - 1)
      end
    end

    it 'changes the URLs of different files at different times' do
      offsets = %w[a.jpg b.jpg c.jpg].map { |name| expires(signer.sign_url("https://example.org/uploads/#{name}")) % 1.day.to_i }

      expect(offsets.uniq.size).to eq 3
    end
  end
end
