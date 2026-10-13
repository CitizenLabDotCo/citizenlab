# frozen_string_literal: true

require 'rails_helper'

# These rules are the whole redirect_uri allowlist: whatever creates a
# Doorkeeper::Application, the rules configured in
# config/initializers/doorkeeper.rb (forbid_redirect_uri + force_ssl_in_redirect_uri)
# must refuse any scheme a browser would execute.
describe Doorkeeper::Application do
  describe 'redirect_uri validation' do
    using RSpec::Parameterized::TableSyntax

    where(:case_name, :redirect_uri, :valid) do
      'https URI'                 | 'https://client.example.com/cb'             | true
      # RFC 8252 loopback callbacks, which is what MCP clients register.
      # force_ssl_in_redirect_uri exempts them, so http must stay valid here.
      'loopback host'             | 'http://localhost:33418/cb'                 | true
      'loopback IPv4'             | 'http://127.0.0.1:33418/cb'                 | true
      'loopback IPv6'             | 'http://[::1]:33418/cb'                     | true
      # RFC 8252 exempts the loopback *interface*, not just 127.0.0.1.
      'loopback IPv4 range'       | 'http://127.0.0.2:33418/cb'                 | true
      'non-loopback http URI'     | 'http://client.example.com/cb'              | false
      'javascript scheme'         | 'javascript:alert(document.cookie)'         | false
      'javascript with authority' | 'javascript://x%0Aalert(document.cookie)'   | false
      'data scheme'               | 'data:text/html,<script>alert(1)</script>'  | false
      'vbscript scheme'           | 'vbscript:msgbox(1)'                        | false
      'https plus hostile URI'    | "https://ok.example.com/cb\njavascript://x%0Aalert(1)" | false
      'loopback host with upcase' | 'http://LOCALHOST:33418/cb' | true
    end

    with_them do
      it 'accepts only http(s), and http only on loopback' do
        application = described_class.new(name: 'Test MCP Client', redirect_uri: redirect_uri, confidential: false)

        expect(application.valid?).to eq valid
      end
    end
  end
end
