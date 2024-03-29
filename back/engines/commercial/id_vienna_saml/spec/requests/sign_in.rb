# This file is not used by specs. It should be run manually.
# See the instructions in back/engines/commercial/id_vienna_saml/README.md.

XML = <<~XML
  <?xml version="1.0" encoding="UTF-8"?>
  <saml2p:Response xmlns:saml2p="urn:oasis:names:tc:SAML:2.0:protocol"
    Destination="https://mitgestalten.wien.gv.at/auth/vienna_citizen/callback"
    ID="_06b2634e9e395133b1831a168c7f77a0" InResponseTo="_d610b483-2fba-4746-8279-8747aa31dde1"
    IssueInstant="2024-01-30T16:48:01.064Z" Version="2.0">
    <saml2:Issuer xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">
      https://mein.wien.gv.at/stdportal-idp/extern.wien.gv.at</saml2:Issuer>
    <ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
      <ds:SignedInfo>
        <ds:CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#" />
        <ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256" />
        <ds:Reference URI="#_06b2634e9e395133b1831a168c7f77a0">
          <ds:Transforms>
            <ds:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature" />
            <ds:Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#" />
          </ds:Transforms>
          <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256" />
          <ds:DigestValue>KTNSXKvNpQzicBiJB8pAP195W2IZCXH9TnEzUyqcZGU=</ds:DigestValue>
        </ds:Reference>
      </ds:SignedInfo>
      <ds:SignatureValue>Some signature</ds:SignatureValue>
      <ds:KeyInfo>
        <ds:X509Data>
          <ds:X509Certificate>Some certificate</ds:X509Certificate>
        </ds:X509Data>
      </ds:KeyInfo>
    </ds:Signature>
    <saml2p:Status>
      <saml2p:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success" />
    </saml2p:Status>
    <saml2:Assertion xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion"
      ID="_2b3f97349f9a3c7562ca0d971a27916b" IssueInstant="2024-01-30T16:48:01.064Z" Version="2.0">
      <saml2:Issuer>https://mein.wien.gv.at/stdportal-idp/extern.wien.gv.at</saml2:Issuer>
      <saml2:Subject>
        <saml2:NameID Format="urn:oasis:names:tc:SAML:2.0:nameid-format:transient"
          NameQualifier="https://mein.wien.gv.at/stdportal-idp/extern.wien.gv.at"
          SPNameQualifier="CitizenLabWien" xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">
          _9fcbc9be11f834dc7a8225370eec9ec6</saml2:NameID>
        <saml2:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer">
          <saml2:SubjectConfirmationData Address="10.153.249.3"
            InResponseTo="_d610b483-2fba-4746-8279-8747aa31dde1"
            NotOnOrAfter="2024-01-30T16:53:01.074Z"
            Recipient="https://mitgestalten.wien.gv.at/auth/vienna_citizen/callback" />
        </saml2:SubjectConfirmation>
      </saml2:Subject>
      <saml2:Conditions NotBefore="2024-01-30T16:48:01.064Z" NotOnOrAfter="2024-01-30T16:53:01.064Z">
        <saml2:AudienceRestriction>
          <saml2:Audience>CitizenLabWien</saml2:Audience>
        </saml2:AudienceRestriction>
      </saml2:Conditions>
      <saml2:AuthnStatement AuthnInstant="2024-01-30T16:48:00.930Z"
        SessionIndex="_c26c280706687c63feae833bdc2ae2cb">
        <saml2:SubjectLocality Address="10.153.249.3" />
        <saml2:AuthnContext>
          <saml2:AuthnContextClassRef>http://www.ref.gv.at/ns/names/agiz/pvp/secclass/0</saml2:AuthnContextClassRef>
        </saml2:AuthnContext>
      </saml2:AuthnStatement>
      <saml2:AttributeStatement>
        <saml2:Attribute FriendlyName="TXID" Name="http://lfrz.at/stdportal/names/pvp2/txid"
          NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri">
          <saml2:AttributeValue>174800$2ru7w@8999p1</saml2:AttributeValue>
        </saml2:Attribute>
        <saml2:Attribute FriendlyName="PARTICIPANT-ID" Name="urn:oid:1.2.40.0.10.2.1.1.71"
          NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri">
          <saml2:AttributeValue>AT:VKZ:L9</saml2:AttributeValue>
        </saml2:Attribute>
        <saml2:Attribute FriendlyName="MAIL" Name="urn:oid:0.9.2342.19200300.100.1.3"
          NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri">
          <saml2:AttributeValue>alexander4@citizenlab.co</saml2:AttributeValue>
        </saml2:Attribute>
        <saml2:Attribute FriendlyName="OU" Name="urn:oid:2.5.4.11"
          NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri">
          <saml2:AttributeValue>Magistrat Wien</saml2:AttributeValue>
        </saml2:Attribute>
        <saml2:Attribute FriendlyName="PRINCIPAL-NAME" Name="urn:oid:1.2.40.0.10.2.1.1.261.20"
          NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri">
          <saml2:AttributeValue>Ryh</saml2:AttributeValue>
        </saml2:Attribute>
        <saml2:Attribute FriendlyName="PVP-VERSION" Name="urn:oid:1.2.40.0.10.2.1.1.261.10"
          NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri">
          <saml2:AttributeValue>2.1</saml2:AttributeValue>
        </saml2:Attribute>
        <saml2:Attribute FriendlyName="USERID" Name="urn:oid:0.9.2342.19200300.100.1.1"
          NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri">
          <saml2:AttributeValue>dyn.alexanderqwe@wien.gv.at</saml2:AttributeValue>
        </saml2:Attribute>
        <saml2:Attribute FriendlyName="OU-OKZ" Name="urn:oid:1.2.40.0.10.2.1.1.153"
          NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri">
          <saml2:AttributeValue>L9</saml2:AttributeValue>
        </saml2:Attribute>
        <saml2:Attribute FriendlyName="ROLES" Name="urn:oid:1.2.40.0.10.2.1.1.261.30"
          NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri">
          <saml2:AttributeValue>access()</saml2:AttributeValue>
        </saml2:Attribute>
        <saml2:Attribute FriendlyName="PARTICIPANT-OKZ" Name="urn:oid:1.2.40.0.10.2.1.1.261.24"
          NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri">
          <saml2:AttributeValue>L9</saml2:AttributeValue>
        </saml2:Attribute>
        <saml2:Attribute FriendlyName="SECCLASS" Name="urn:oid:1.2.40.0.10.2.1.1.261.110"
          NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri">
          <saml2:AttributeValue>0</saml2:AttributeValue>
        </saml2:Attribute>
        <saml2:Attribute FriendlyName="GIVEN-NAME" Name="urn:oid:2.5.4.42"
          NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri">
          <saml2:AttributeValue>Alex</saml2:AttributeValue>
        </saml2:Attribute>
        <saml2:Attribute FriendlyName="OU-GV-OU-ID" Name="urn:oid:1.2.40.0.10.2.1.1.3"
          NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri">
          <saml2:AttributeValue>AT:VKZ:L9</saml2:AttributeValue>
        </saml2:Attribute>
        <saml2:Attribute FriendlyName="GID" Name="urn:oid:1.2.40.0.10.2.1.1.1"
          NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri">
          <saml2:AttributeValue>AT:L9:10:magwien.gv.at/dyn.alexanderqwe</saml2:AttributeValue>
        </saml2:Attribute>
        <saml2:Attribute FriendlyName="GV-OU-DOMAIN"
          Name="http://lfrz.at/stdportal/names/pvp/gvoudomain"
          NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri">
          <saml2:AttributeValue>magwien.gv.at</saml2:AttributeValue>
        </saml2:Attribute>
      </saml2:AttributeStatement>
    </saml2:Assertion>
  </saml2p:Response>
XML

def apply_skip_saml_validation_monkey_patch
  skip_saml_validation_monkey_patch = <<~RUBY
    # DON'T COMMIT IT!
    class OneLogin::RubySaml::Response
      def soft
        true
      end
    end
  RUBY

  monkey_patch_file_path = 'back/engines/commercial/id_vienna_saml/app/lib/id_vienna_saml/citizen_saml_omniauth.rb'
  monkey_patch_file = File.read(monkey_patch_file_path)
  if monkey_patch_file.include?(skip_saml_validation_monkey_patch)
    puts 'Monkey patch already applied'
  else
    File.write(monkey_patch_file_path, skip_saml_validation_monkey_patch + monkey_patch_file)
    puts "\e[32mApplied monkey patch\e[0m"
    sleep 2
    `touch back/tmp/restart.txt`
    sleep 2
  end
end

def send_saml_response
  # `curl --verbose http://localhost:4000/auth/vienna_citizen/callback -XPOST -F 'SAMLResponse=#{Base64.encode64(XML).delete("\n")}'`
  require 'net/http'
  require 'uri'
  require 'base64'

  uri = URI.parse('http://localhost:4000/auth/vienna_citizen/callback')
  request = Net::HTTP::Post.new(uri)
  request.set_form_data(
    'SAMLResponse' => Base64.encode64(XML).delete("\n")
  )

  req_options = {
    use_ssl: uri.scheme == 'https'
  }

  response = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
    http.request(request)
  end

  puts response.body
  puts
  pp response.each_header.to_a

  puts
  puts response['Location'].include?('error') ? "\e[31mERROR!\e[0m" : "\e[32mSUCCESS!\e[0m"
end

def create_html_page_with_saml_form
  html = <<~HTML
    <!-- DON'T COMMIT IT! -->
    <html>
      <body>
        <form action="http://localhost:4000/auth/vienna_citizen/callback" method="post">
          <input type="hidden" name="SAMLResponse" value="#{Base64.encode64(XML).delete("\n")}">
          <input type="submit" value="Sign in with Vienna SAML">
        </form>
      </body>
    </html>
  HTML

  File.write('./saml_form.html', html)
  puts
  puts "\e[32mAlso created HTML page with SAML form.\e[0m"
  `google-chrome ./saml_form.html`
  sleep 1
  `rm ./saml_form.html`
end

apply_skip_saml_validation_monkey_patch
send_saml_response
create_html_page_with_saml_form
