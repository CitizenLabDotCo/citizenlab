# frozen_string_literal: true

require 'rails_helper'
require_relative '../../support/magda_test_certificate'

describe 'MAGDA repertorium clients' do # rubocop:disable RSpec/DescribeClass -- two sibling clients share the setup
  let(:inschrijving_endpoint) { CustomIdMethods::Magda::RegistreerInschrijvingClient::ENDPOINTS.fetch('tni') }
  let(:uitschrijving_endpoint) { CustomIdMethods::Magda::RegistreerUitschrijvingClient::ENDPOINTS.fetch('tni') }
  let(:config) do
    {
      magda_environment: 'tni',
      magda_certificate: MagdaTestCertificate.certificate_pem,
      magda_private_key: MagdaTestCertificate.private_key_pem,
      magda_uri: 'bornem.be/govocal/ipdc77332-aip',
      magda_hoedanigheidscode: 'ipdc77332'
    }
  end
  let(:insz) { '01234567993' }
  let(:referte) { 'e8176ee5-0eda-430c-a9b8-abc32d3a23da' }
  let(:now) { ActiveSupport::TimeZone['Europe/Brussels'].parse('2026-08-26 10:15:07') }

  def fixture(name)
    File.read(File.expand_path("../../fixtures/magda/#{name}", __dir__))
  end

  def stub_magda(endpoint, body:, status: 200)
    captured = nil
    stub_request(:post, endpoint)
      .with { |request| captured = request }
      .to_return(status: status, body: body, headers: { 'Content-Type' => 'text/xml;charset=UTF-8' })
    -> { captured }
  end

  def without_namespaces(xml)
    doc = Nokogiri::XML(xml)
    doc.remove_namespaces!
    doc
  end

  describe CustomIdMethods::Magda::RegistreerInschrijvingClient do
    let(:client) { described_class.from_config(config) }

    it 'posts the RegistreerInschrijving request and parses a successful registration' do
      request = stub_magda(inschrijving_endpoint, body: fixture('registreer_inschrijving_ok.xml'))

      result = client.call(insz, referte: referte, now: now, begin_date: Date.new(2026, 8, 26))

      expect(result).to be_ok
      expect(result).to have_attributes(resultaat: '1', referte: referte, http_status: 200)

      sent = request.call
      raw = Nokogiri::XML(sent.body)
      expect(raw.at_xpath('//*[local-name()="RegistreerInschrijving"]').namespace.href).to eq described_class::NAMESPACE

      doc = without_namespaces(sent.body)
      expect(doc.at_xpath('/Envelope/Body/RegistreerInschrijving/Verzoek')).to be_present
      expect(doc.at_xpath('//Context/Naam').text).to eq 'RegistreerInschrijving'
      expect(doc.at_xpath('//Context/Versie').text).to eq '02.00.0000'
      expect(doc.at_xpath('//Context/Bericht/Afzender/Identificatie').text).to eq 'bornem.be/govocal/ipdc77332-aip'
      expect(doc.at_xpath('//Context/Bericht/Afzender/Hoedanigheid').text).to eq 'ipdc77332'
      inschrijving = doc.at_xpath('//Vragen/Vraag/Inhoud/Inschrijving')
      expect(inschrijving.at_xpath('Identificatie').text).to eq 'bornem.be/govocal/ipdc77332-aip'
      expect(inschrijving.at_xpath('Hoedanigheid').text).to eq 'ipdc77332'
      expect(inschrijving.at_xpath('INSZ').text).to eq insz
      expect(inschrijving.at_xpath('Periode/Begin').text).to eq '2026-08-26'
      expect(inschrijving.at_xpath('Periode/Einde')).to be_nil
      expect(doc.at_xpath('/Envelope/Header/Security/Signature')).to be_present
    end

    it 'parses a failed registration with its uitzondering' do
      stub_magda(inschrijving_endpoint, body: fixture('registreer_inschrijving_failed.xml'))

      result = client.call(insz)

      expect(result).not_to be_ok
      expect(result).to be_error
      expect(result.status).to eq :failed
      expect(result.resultaat).to eq '0'
      expect(result.error_message).to include('20002')
      expect(result.uitzondering_codes).to eq ['20002']
    end

    it 'parses a SOAP fault as an error' do
      stub_magda(inschrijving_endpoint, body: fixture('geef_persoon_soap_fault.xml'), status: 500)

      result = client.call(insz)

      expect(result.status).to eq :error
      expect(result.error_message).to include('10001')
    end

    it 'returns an error on transport problems' do
      stub_request(:post, inschrijving_endpoint).to_timeout

      result = client.call(insz, referte: referte)

      expect(result).to be_error
      expect(result.referte).to eq referte
    end

    it 'resolves the endpoint from the environment' do
      expect(described_class.configured?(config)).to be true
      expect(described_class.from_config(config).endpoint).to eq described_class::ENDPOINTS.fetch('tni')
    end
  end

  describe CustomIdMethods::Magda::RegistreerUitschrijvingClient do
    let(:client) { described_class.from_config(config) }

    it 'posts the RegistreerUitschrijving request without a Periode' do
      request = stub_magda(uitschrijving_endpoint, body: fixture('registreer_inschrijving_ok.xml'))

      result = client.call(insz, referte: referte, now: now)

      expect(result).to be_ok
      sent = request.call
      raw = Nokogiri::XML(sent.body)
      expect(raw.at_xpath('//*[local-name()="RegistreerUitschrijving"]').namespace.href).to eq described_class::NAMESPACE

      doc = without_namespaces(sent.body)
      uitschrijving = doc.at_xpath('/Envelope/Body/RegistreerUitschrijving/Verzoek/Vragen/Vraag/Inhoud/Uitschrijving')
      expect(uitschrijving.at_xpath('INSZ').text).to eq insz
      expect(uitschrijving.at_xpath('Identificatie').text).to eq 'bornem.be/govocal/ipdc77332-aip'
      expect(uitschrijving.at_xpath('Periode')).to be_nil
    end

    it 'resolves the endpoint from the environment' do
      expect(described_class.configured?(config)).to be true
      expect(described_class.from_config(config).endpoint).to eq described_class::ENDPOINTS.fetch('tni')
    end
  end
end
