# frozen_string_literal: true

require 'rails_helper'
require 'savon/mock/spec_helper'

describe CustomIdMethods::NemlogIn::KkiLocationApi do
  let(:cpr_number) { '1234567890' }
  let(:base_uri) { 'http://api.example.com/' }
  let(:full_uri) { base_uri + cpr_number }

  before do
    configuration = AppConfiguration.instance
    settings = configuration.settings
    settings['kki_location_api'] = {
      allowed: true,
      enabled: true,
      uri: base_uri,
      username: 'username',
      password: 'password',
      custom_headers: 'h1: value1, h2: value2'
    }
    configuration.save!
  end

  it 'returns municipality code' do
    stub_request(:get, full_uri).to_return(
      body: '{"cprMunicipalityCode": "123"}',
      headers: { 'Content-Type' => 'application/json' }
    )

    result = described_class.new.municipality_code(cpr_number)
    expect(result).to eq('123')
  end

  it 'logs error if response is not successful' do
    stub_request(:get, full_uri).to_return(status: 500)

    expect(ErrorReporter).to receive(:report_msg).and_call_original
    result = described_class.new.municipality_code(cpr_number)
    expect(result).to be_nil
  end
end
