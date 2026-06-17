# frozen_string_literal: true

require 'rails_helper'

# NemLog-in rotates the IdP signing certificates embedded in the broker metadata
# periodically. Once the embedded cert expires, SAML responses fail at runtime
# with "Invalid Signature on SAML Response" and logins break.
#
# This guard fails one month before any bundled signing certificate expires, so
# the metadata can be refreshed from the published broker metadata ahead of time:
# https://www.nemlog-in.dk/metadata/#broker-idp
context 'NemLog-in IdP metadata signing certificates' do
  renewal_lead_time = 1.month

  def signing_certificates(metadata_xml_file)
    doc = Nokogiri::XML(File.read(metadata_xml_file))
    doc.remove_namespaces!
    # A KeyDescriptor with no `use` covers both signing and encryption.
    doc.xpath('//KeyDescriptor[not(@use) or @use="signing"]//X509Certificate').map do |node|
      OpenSSL::X509::Certificate.new(Base64.decode64(node.text))
    end
  end

  CustomIdMethods::NemlogIn::NemlogInOmniauth::ENVIRONMENTS.each do |environment, config|
    context "for the :#{environment} environment" do
      let(:certificates) { signing_certificates(config[:metadata_xml_file]) }

      it 'bundles at least one signing certificate' do
        expect(certificates).not_to be_empty
      end

      it 'has signing certificates valid for at least another month' do
        certificates.each do |cert|
          expect(cert.not_after).to be > (Time.now.utc + renewal_lead_time),
            "The NemLog-in :#{environment} IdP signing certificate (#{cert.subject}) " \
            "expires at #{cert.not_after.utc.iso8601}. Refresh the metadata from " \
            'https://www.nemlog-in.dk/metadata/#broker-idp'
        end
      end
    end
  end
end
