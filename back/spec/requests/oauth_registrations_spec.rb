# frozen_string_literal: true

require 'rails_helper'

# RFC 7591 Dynamic Client Registration. The endpoint is public and
# unauthenticated, so its redirect_uri scheme allowlist is what stops anyone from
# registering a client whose redirect_uri runs script in the platform origin once
# the SPA consent screen navigates to it (on approve as well as on deny).
describe Oauth::RegistrationsController do
  let(:headers) { { 'CONTENT_TYPE' => 'application/json' } }

  def register(redirect_uris, client_name: 'Test MCP Client')
    post '/oauth/registrations',
      params: { client_name: client_name, redirect_uris: redirect_uris }.to_json,
      headers: headers
  end

  describe 'POST /oauth/registrations' do
    it 'registers a client with an https redirect_uri' do
      expect { register(['https://client.example.com/oauth/callback']) }
        .to change(Doorkeeper::Application, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(response.parsed_body['client_id']).to be_present
      expect(response.parsed_body['redirect_uris']).to eq ['https://client.example.com/oauth/callback']
    end

    # RFC 8252: native apps get their authorization code on a loopback http
    # callback, and those apps are what this endpoint exists for. The guard is on
    # the scheme, not on https, precisely so loopback registration keeps working.
    it 'registers a client with a loopback http redirect_uri' do
      expect { register(['http://localhost:33418/callback']) }
        .to change(Doorkeeper::Application, :count).by(1)

      expect(response).to have_http_status(:created)
    end

    it 'registers a client with several valid redirect_uris' do
      register(['https://a.example.com/cb', 'http://127.0.0.1:5000/cb'])

      expect(response).to have_http_status(:created)
      expect(response.parsed_body['redirect_uris']).to eq ['https://a.example.com/cb', 'http://127.0.0.1:5000/cb']
    end

    # The other side of the error-code split: a failure that has nothing to do
    # with redirect_uri keeps the generic RFC 7591 code.
    it 'reports a non-redirect_uri problem with the generic error code' do
      expect { register(['https://ok.example.com/cb'], client_name: nil) }
        .not_to change(Doorkeeper::Application, :count)

      expect(response).to have_http_status(:bad_request)
      expect(response.parsed_body['error']).to eq 'invalid_client_metadata'
    end

    describe 'redirect_uri scheme allowlist' do
      using RSpec::Parameterized::TableSyntax

      where(:case_name, :redirect_uris) do
        'javascript scheme'           | ['javascript:alert(document.cookie)']
        # Parses as a URI with a host, so it survives Doorkeeper's default validators.
        'javascript with authority'   | ['javascript://x%0Aalert(document.cookie)']
        'javascript in mixed case'    | ['JavaScript:alert(1)']
        'data scheme'                 | ['data:text/html,<script>alert(1)</script>']
        'vbscript scheme'             | ['vbscript:msgbox(1)']
        # Doorkeeper stores redirect URIs newline-separated and splits them on
        # whitespace, so a URI smuggled into one entry would become a second
        # registered redirect_uri. A prefix check on the entry would miss it.
        'newline-smuggled URI'        | ["https://ok.example.com/cb\njavascript://x%0Aalert(1)"]
        'valid URI plus hostile one'  | ['https://ok.example.com/cb', 'javascript:alert(1)']
        'relative URI'                | ['/oauth/callback']
        'scheme-relative URI'         | ['//evil.example.com/cb']
        'URI with a fragment'         | ['https://ok.example.com/cb#fragment']
        'no redirect_uris'            | []
        'non-string entry'            | [{ 'uri' => 'https://ok.example.com/cb' }]
        # Passes the controller allowlist (http is a valid scheme) and is refused one layer down
        # by force_ssl_in_redirect_uri. Same code either way.
        'plaintext non-loopback URI' | ['http://client.example.com/cb']
      end

      with_them do
        it 'is rejected with invalid_redirect_uri and registers nothing' do
          expect { register(redirect_uris) }.not_to change(Doorkeeper::Application, :count)

          expect(response).to have_http_status(:bad_request)
          expect(response.parsed_body['error']).to eq 'invalid_redirect_uri'
        end
      end
    end
  end
end
