# frozen_string_literal: true

require 'rails_helper'
require 'socket'

# Live regression test: converting an office document must render only that
# document's own embedded content - the Gotenberg LibreOffice worker must not
# fetch a URL the document links to.
#
# This talks to a real Gotenberg (the docker-compose service), so it is skipped
# when none is reachable - including on CI, which has no Gotenberg service. Run
# it locally against the pinned image.
RSpec.describe GotenbergClient, type: :service do
  subject(:client) { described_class.new }

  before { skip 'Gotenberg not reachable' unless client.send(:up?) }

  it 'does not fetch a document-linked URL during LibreOffice conversion' do
    hits = []
    server = TCPServer.new('0.0.0.0', 0)
    port = server.addr[1]
    # Address the Gotenberg container can reach us on: our IP on the shared
    # docker network (not loopback, which would resolve inside Gotenberg).
    host = Socket.ip_address_list.find { |a| a.ipv4? && !a.ipv4_loopback? }&.ip_address

    listener = Thread.new do
      loop do
        conn = server.accept
        hits << conn.gets
        conn.write("HTTP/1.1 200 OK\r\nContent-Length: 0\r\n\r\n")
        conn.close
      end
    rescue IOError
      # server closed - stop accepting
    end

    fodt = StringIO.new(linked_image_fodt("http://#{host}:#{port}/probe.png"))
    pdf = client.render_libreoffice_to_pdf(fodt, 'application/vnd.oasis.opendocument.text', 'probe.fodt')

    expect(pdf.read(5)).to eq('%PDF-') # conversion still succeeds
    expect(hits).to be_empty # but the worker made no outbound request
  ensure
    server&.close
    listener&.join(1)
  end

  # Flat ODT (single XML file, no zip) with one linked image set to load on open.
  def linked_image_fodt(href)
    <<~XML
      <?xml version="1.0" encoding="UTF-8"?>
      <office:document
          xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
          xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
          xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0"
          office:version="1.2"
          office:mimetype="application/vnd.oasis.opendocument.text">
       <office:body>
        <office:text>
         <text:p>
          <draw:frame svg:width="3cm" svg:height="3cm" text:anchor-type="paragraph">
           <draw:image xlink:href="#{href}" xlink:type="simple" xlink:show="embed" xlink:actuate="onLoad"/>
          </draw:frame>
         </text:p>
        </office:text>
       </office:body>
      </office:document>
    XML
  end
end
