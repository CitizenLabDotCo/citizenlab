# frozen_string_literal: true

require 'rails_helper'

RSpec.describe GotenbergClient do
  subject(:client) { described_class.new }

  before { allow(client).to receive(:up?).and_return(true) } # rubocop:disable RSpec/SubjectStub

  describe '#render_html_to_pdf' do
    it 'raises HttpError on non-2xx response' do
      url = "#{ENV.fetch('GOTENBERG_PDF_URL', 'http://gotenberg:3000')}/forms/chromium/convert/html"
      stub_request(:post, url).to_return(status: 500, body: 'Internal Server Error')

      expect { client.render_html_to_pdf('<html></html>') }
        .to raise_error(GotenbergClient::HttpError) do |error|
        expect(error.status).to eq(500)
        expect(error.body).to eq('Internal Server Error')
      end
    end
  end
end
