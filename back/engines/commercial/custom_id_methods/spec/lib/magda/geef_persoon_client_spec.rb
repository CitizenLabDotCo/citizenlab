# frozen_string_literal: true

require 'rails_helper'
require_relative '../../support/magda_test_certificate'

describe CustomIdMethods::Magda::GeefPersoonClient do
  let(:endpoint) { described_class::ENDPOINTS.fetch('tni') }
  let(:sign) { false }
  let(:hoedanigheid) { 'ipdc77332' }
  let(:client) do
    described_class.new(
      environment: 'tni',
      certificate: MagdaTestCertificate.certificate_pem,
      private_key: MagdaTestCertificate.private_key_pem,
      uri: 'bornem.be/govocal/ipdc77332-aip',
      hoedanigheidscode: hoedanigheid,
      sign: sign
    )
  end
  let(:referte) { 'd7176ee5-0eda-430c-a9b8-abc32d3a23da' }
  let(:now) { ActiveSupport::TimeZone['Europe/Brussels'].parse('2026-08-24 10:15:08') }
  let(:insz) { '01234567993' }

  def fixture(name)
    File.read(File.expand_path("../../fixtures/magda/#{name}", __dir__))
  end

  def stub_magda(body: fixture('geef_persoon_found.xml'), status: 200)
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

  describe '#call' do
    it 'posts the GeefPersoon request and parses a found person' do
      request = stub_magda

      result = client.call(insz, referte: referte, now: now)

      expect(result).to be_found
      expect(result).to have_attributes(postal_code: '2880', nis_code: '12007', birth_date: Date.new(1990, 5, 15), referte: referte, http_status: 200)

      sent = request.call
      expect(sent.headers['Soapaction']).to eq '""'
      expect(sent.headers['Content-Type']).to start_with 'text/xml'

      raw = Nokogiri::XML(sent.body)
      operation = raw.at_xpath('//*[local-name()="GeefPersoon"]')
      expect(operation.namespace.href).to eq described_class::NAMESPACE
      expect(raw.at_xpath('//*[local-name()="Verzoek"]').namespace).to be_nil

      doc = without_namespaces(sent.body)
      expect(doc.at_xpath('/Envelope/Body/GeefPersoon/Verzoek')).to be_present
      expect(doc.at_xpath('//Context/Naam').text).to eq 'GeefPersoon'
      expect(doc.at_xpath('//Context/Versie').text).to eq '02.02.0000'
      expect(doc.at_xpath('//Context/Bericht/Type').text).to eq 'VRAAG'
      expect(doc.at_xpath('//Context/Bericht/Tijdstip/Datum').text).to eq '2026-08-24'
      expect(doc.at_xpath('//Context/Bericht/Tijdstip/Tijd').text).to eq '10:15:08.000'
      expect(doc.at_xpath('//Context/Bericht/Afzender/Identificatie').text).to eq 'bornem.be/govocal/ipdc77332-aip'
      expect(doc.at_xpath('//Context/Bericht/Afzender/Referte').text).to eq referte
      expect(doc.at_xpath('//Context/Bericht/Afzender/Hoedanigheid').text).to eq 'ipdc77332'
      expect(doc.at_xpath('//Context/Bericht/Afzender/Gebruiker')).to be_nil
      expect(doc.at_xpath('//Context/Bericht/Ontvanger')).to be_nil
      expect(doc.at_xpath('//Vragen/Vraag/Referte').text).to eq referte
      expect(doc.at_xpath('//Vragen/Vraag/Inhoud/Criteria/INSZ').text).to eq insz
      expect(doc.at_xpath('//Vragen/Vraag/Inhoud/Bron').text).to eq 'RR'
      expect(doc.at_xpath('//Vragen/Vraag/Inhoud/Taal').text).to eq 'nl'
      expect(doc.at_xpath('/Envelope/Header/Security')).to be_nil
      expect(sent.body).not_to include('xmlns=""')
      expect(sent.body).not_to match(/^[ \t]*\n/)
    end

    it 'uses a fresh UUID referte and the current Brussels time by default' do
      request = stub_magda

      result = client.call(insz)

      doc = without_namespaces(request.call.body)
      expect(result.referte).to match(/\A\h{8}-\h{4}-\h{4}-\h{4}-\h{12}\z/)
      expect(doc.at_xpath('//Afzender/Referte').text).to eq result.referte
      expect(doc.at_xpath('//Vraag/Referte').text).to eq result.referte
      expect(doc.at_xpath('//Tijdstip/Tijd').text).to match(/\A\d{2}:\d{2}:\d{2}\.000\z/)
    end

    context 'without hoedanigheid' do
      let(:hoedanigheid) { nil }

      it 'omits the element' do
        request = stub_magda
        client.call(insz, referte: referte, now: now)
        expect(without_namespaces(request.call.body).at_xpath('//Afzender/Hoedanigheid')).to be_nil
      end
    end

    it 'escapes XML special characters' do
      request = stub_magda
      client.call('<&>', referte: referte, now: now)
      expect(without_namespaces(request.call.body).at_xpath('//INSZ').text).to eq '<&>'
    end

    it 'parses not found' do
      stub_magda(body: fixture('geef_persoon_not_found.xml'))
      expect(client.call(insz).status).to eq :not_found
    end

    it 'parses a missing repertorium inschrijving as not_registered' do
      stub_magda(body: fixture('geef_persoon_not_registered.xml'))
      result = client.call(insz)
      expect(result.status).to eq :not_registered
      expect(result.not_registered?).to be true
      expect(result).not_to be_error
      expect(result.uitzondering_codes).to eq ['40003']
    end

    it 'also reads the nested 02.00-style address fields' do
      nested = fixture('geef_persoon_found.xml')
        .sub('<Postcode>2880</Postcode>', '<Gemeente><NISCode>12007</NISCode><PostCode>2880</PostCode></Gemeente>')
        .sub('<NISCodeGemeente>12007</NISCodeGemeente>', '')
      stub_magda(body: nested)
      result = client.call(insz)
      expect(result).to have_attributes(postal_code: '2880', nis_code: '12007')
    end

    it 'parses an authorisation uitzondering as an error' do
      stub_magda(body: fixture('geef_persoon_no_machtiging.xml'))
      result = client.call(insz)
      expect(result).to be_error
      expect(result.uitzondering_codes).to eq ['13001']
    end

    it 'parses a SOAP fault as an error' do
      stub_magda(body: fixture('geef_persoon_soap_fault.xml'), status: 500)
      result = client.call(insz)
      expect(result).to be_error
      expect(result.error_message).to include('10001')
    end

    it 'returns an error for an HTTP error without SOAP body' do
      stub_magda(body: 'Service Unavailable', status: 503)
      result = client.call(insz)
      expect(result).to be_error
      expect(result.http_status).to eq 503
    end

    it 'returns an error on timeout' do
      stub_request(:post, endpoint).to_timeout
      result = client.call(insz, referte: referte)
      expect(result).to be_error
      expect(result.referte).to eq referte
    end

    it 'returns an error when the connection fails' do
      stub_request(:post, endpoint).to_raise(Errno::ECONNREFUSED)
      expect(client.call(insz)).to be_error
    end

    it 'returns an error for an unusable certificate' do
      broken = described_class.new(
        environment: 'tni', certificate: 'not a pem', private_key: MagdaTestCertificate.private_key_pem,
        uri: 'x'
      )
      result = broken.call(insz)
      expect(result).to be_error
      expect(result.error_message).to include('OpenSSL')
    end

    context 'with WS-Security signing' do
      let(:sign) { true }

      it 'signs the body with the certificate' do
        request = stub_magda
        client.call(insz, referte: referte, now: now)

        doc = without_namespaces(request.call.body)
        expect(doc.at_xpath('/Envelope/Header/Security/BinarySecurityToken')).to be_present
        expect(doc.at_xpath('/Envelope/Header/Security/Signature/SignedInfo')).to be_present
        expect(doc.at_xpath('/Envelope/Header/Security/Signature/SignatureValue').text).to be_present
        expect(doc.at_xpath('/Envelope/Body/GeefPersoon/Verzoek/Vragen/Vraag/Inhoud/Criteria/INSZ').text).to eq insz
      end
    end
  end

  describe '.configured? and .from_config' do
    let(:config) do
      {
        magda_environment: 'tni',
        magda_certificate: MagdaTestCertificate.certificate_pem,
        magda_private_key: MagdaTestCertificate.private_key_pem,
        magda_uri: 'bornem.be/govocal/ipdc77332-aip',
        magda_hoedanigheidscode: 'ipdc77332'
      }
    end

    it 'needs certificate, private key and uri' do
      expect(described_class.configured?(config)).to be true
      expect(described_class.configured?(config.except(:magda_hoedanigheidscode))).to be true
      expect(described_class.configured?(config.except(:magda_certificate))).to be false
      expect(described_class.configured?(config.merge(magda_uri: ''))).to be false
      expect(described_class.configured?(nil)).to be false
    end

    it 'builds a client from the config, defaulting to the production environment' do
      built = described_class.from_config(config)
      expect(built).to have_attributes(endpoint: endpoint, uri: 'bornem.be/govocal/ipdc77332-aip', hoedanigheidscode: 'ipdc77332', sign: true)
      expect(described_class.from_config(config.except(:magda_environment)).endpoint).to eq described_class::ENDPOINTS.fetch('production')
    end
  end
end
