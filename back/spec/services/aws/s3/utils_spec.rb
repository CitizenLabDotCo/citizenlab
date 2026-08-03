# frozen_string_literal: true

require 'rails_helper'

describe Aws::S3::Utils do
  describe '.default_client' do
    # These examples assert the REAL endpoint the AWS SDK resolves for the built
    # client (client.config.endpoint), not a stubbed value. This is what actually
    # determines which host every request hits, so it proves Scaleway support.

    before do
      stub_env(
        'AWS_REGION' => 'eu-central-1',
        'AWS_ACCESS_KEY_ID' => 'test-key',
        'AWS_SECRET_ACCESS_KEY' => 'test-secret',
        'AWS_S3_ENDPOINT' => endpoint_env
      )
    end

    context 'when AWS_S3_ENDPOINT is unset (AWS)' do
      let(:endpoint_env) { nil }

      it 'targets AWS S3 with virtual-host addressing' do
        client = described_class.default_client

        expect(client.config.endpoint.to_s).to eq('https://s3.eu-central-1.amazonaws.com')
        expect(client.config.force_path_style).to be(false)
        expect(client.config.region).to eq('eu-central-1')
      end
    end

    context 'when AWS_S3_ENDPOINT points to Scaleway' do
      let(:endpoint_env) { 'https://s3.fr-par.scw.cloud' }

      it 'targets the custom endpoint with path-style addressing' do
        client = described_class.default_client

        expect(client.config.endpoint.to_s).to eq('https://s3.fr-par.scw.cloud')
        expect(client.config.force_path_style).to be(true)
      end

      it 'builds a working path-style object URL against the custom endpoint' do
        client = described_class.default_client
        url = Aws::S3::Object.new('my-bucket', 'uploads/logo.png', client: client).public_url

        expect(url).to eq('https://s3.fr-par.scw.cloud/my-bucket/uploads/logo.png')
      end
    end

    context 'when AWS_S3_ENDPOINT is blank' do
      let(:endpoint_env) { '' }

      it 'is treated as unset and targets AWS' do
        client = described_class.default_client

        expect(client.config.endpoint.to_s).to eq('https://s3.eu-central-1.amazonaws.com')
        expect(client.config.force_path_style).to be(false)
      end
    end
  end
end
