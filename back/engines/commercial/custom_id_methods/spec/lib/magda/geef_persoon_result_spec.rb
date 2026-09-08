# frozen_string_literal: true

require 'rails_helper'

describe CustomIdMethods::Magda::GeefPersoonResult do
  def fixture(name)
    File.read(File.expand_path("../../fixtures/magda/#{name}", __dir__))
  end

  describe '.from_xml' do
    it 'parses a found person' do
      result = described_class.from_xml(fixture('geef_persoon_found.xml'), referte: 'ref-1')

      expect(result).to be_found
      expect(result).to have_attributes(
        postal_code: '2880',
        nis_code: '12007',
        birth_date_string: '1990-05-15',
        birth_date: Date.new(1990, 5, 15),
        http_status: 200,
        referte: 'ref-1',
        uitzonderingen: []
      )
      expect(result.raw_xml).to include('GeefPersoonResponse')
    end

    it 'maps a level-3 "Onbestaand INSZ" uitzondering to not found' do
      result = described_class.from_xml(fixture('geef_persoon_not_found.xml'))

      expect(result.status).to eq :not_found
      expect(result.not_found?).to be true
      expect(result).not_to be_error
      expect(result.uitzondering_codes).to eq ['30003']
      expect(result.uitzonderingen.first).to have_attributes(type: 'FOUT', origin: 'RR', diagnose: 'Onbestaand INSZ')
    end

    it 'maps a level-2 authorisation uitzondering to an error' do
      result = described_class.from_xml(fixture('geef_persoon_no_machtiging.xml'))

      expect(result).to be_error
      expect(result.error_message).to include('13001', 'Geen machtiging')
      expect(result.uitzondering_codes).to eq ['13001']
    end

    it 'maps a SOAP fault to an error' do
      result = described_class.from_xml(fixture('geef_persoon_soap_fault.xml'), http_status: 500)

      expect(result).to be_error
      expect(result.error_message).to include('SOAP fault', '10001')
    end

    it 'maps an HTTP error without a usable body to an error' do
      result = described_class.from_xml('', http_status: 503)

      expect(result).to be_error
      expect(result.error_message).to eq 'HTTP 503'
    end

    it 'maps an unexpected 200 body to an error' do
      result = described_class.from_xml('<html><body>Access denied</body></html>', http_status: 200)

      expect(result).to be_error
      expect(result.error_message).to include('Unexpected response')
    end

    it 'treats a person with a warning uitzondering as found' do
      xml = fixture('geef_persoon_found.xml').sub(
        '<Inhoud>',
        '<Uitzonderingen><Uitzondering><Identificatie>30004</Identificatie><Type>WAARSCHUWING</Type><Diagnose>Persoon heeft een nieuw INSZ verkregen</Diagnose></Uitzondering></Uitzonderingen><Inhoud>'
      )
      result = described_class.from_xml(xml)

      expect(result).to be_found
      expect(result.postal_code).to eq '2880'
      expect(result.uitzondering_codes).to eq ['30004']
    end
  end

  describe '#birth_date' do
    def result_with_birth_date(value)
      described_class.new(status: :found, birth_date_string: value)
    end

    it 'resolves an unknown day to the last day of the month' do
      expect(result_with_birth_date('2014-02-00').birth_date).to eq Date.new(2014, 2, 28)
    end

    it 'resolves an unknown month and day to 31 December' do
      expect(result_with_birth_date('2014-00-00').birth_date).to eq Date.new(2014, 12, 31)
    end

    it 'is nil for an unknown year, a blank value or garbage' do
      expect(result_with_birth_date('0000-00-00').birth_date).to be_nil
      expect(result_with_birth_date(nil).birth_date).to be_nil
      expect(result_with_birth_date('2014-13-45').birth_date).to be_nil
    end
  end

  describe '.service_error' do
    it 'wraps the exception' do
      result = described_class.service_error(Timeout::Error.new('execution expired'), referte: 'ref-2')

      expect(result).to be_error
      expect(result.error_message).to eq 'Timeout::Error: execution expired'
      expect(result.referte).to eq 'ref-2'
    end
  end
end
