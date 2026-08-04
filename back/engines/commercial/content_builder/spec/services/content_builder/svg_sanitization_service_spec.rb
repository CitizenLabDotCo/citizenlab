# frozen_string_literal: true

require 'rails_helper'

describe ContentBuilder::SvgSanitizationService do
  let(:service) { described_class.new }

  def wrap(body)
    %(<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">#{body}</svg>)
  end

  it 'keeps the drawing instructions intact' do
    output = service.sanitize wrap('<circle cx="12" cy="12" r="10" fill="#04884C"/>')

    expect(output).to include '<circle'
    expect(output).to include 'fill="#04884C"'
    expect(output).to include 'viewBox="0 0 24 24"'
  end

  it 'removes script elements' do
    output = service.sanitize wrap('<script>alert(document.cookie)</script><rect width="24" height="24"/>')

    expect(output).not_to include 'script'
    expect(output).not_to include 'alert'
    expect(output).to include '<rect'
  end

  it 'removes foreignObject elements, which can carry arbitrary HTML' do
    output = service.sanitize wrap('<foreignObject><body xmlns="http://www.w3.org/1999/xhtml">hi</body></foreignObject>')

    expect(output).not_to include 'foreignObject'
    expect(output).not_to include 'hi'
  end

  it 'removes event handler attributes whatever their casing' do
    output = service.sanitize wrap('<rect width="24" height="24" onload="alert(1)" onMouseOver="alert(2)"/>')

    expect(output).not_to include 'alert'
    expect(output).not_to include 'onload'
    expect(output).not_to include 'onMouseOver'
    expect(output).to include '<rect'
  end

  it 'removes javascript: links, under any namespace prefix' do
    output = service.sanitize <<~SVG
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xl="http://www.w3.org/1999/xlink">
        <a href="javascript:alert(1)"><rect width="24" height="24"/></a>
        <use xl:href="javascript:alert(2)"/>
      </svg>
    SVG

    expect(output).not_to include 'javascript:'
    expect(output).to include '<rect'
  end

  it 'removes references to remote documents' do
    output = service.sanitize wrap('<use href="https://evil.example.com/payload.svg#icon"/>')

    expect(output).not_to include 'evil.example.com'
  end

  it 'keeps same-document fragment references, which gradients and <use> rely on' do
    output = service.sanitize wrap(
      '<defs><linearGradient id="g"><stop offset="0"/></linearGradient></defs>' \
      '<rect width="24" height="24" fill="url(#g)"/><use href="#g"/>'
    )

    expect(output).to include 'href="#g"'
    expect(output).to include 'fill="url(#g)"'
  end

  it 'keeps inline raster data' do
    href = 'data:image/png;base64,iVBORw0KGgo='
    output = service.sanitize wrap(%(<image href="#{href}"/>))

    expect(output).to include href
  end

  it 'removes a doctype, so entity expansion cannot be declared' do
    output = service.sanitize <<~SVG
      <?xml version="1.0"?>
      <!DOCTYPE svg [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
      <svg xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24"/></svg>
    SVG

    expect(output).not_to include 'DOCTYPE'
    expect(output).not_to include 'ENTITY'
    expect(output).not_to include 'etc/passwd'
  end

  it 'removes processing instructions, which can pull in a remote stylesheet' do
    output = service.sanitize <<~SVG
      <?xml version="1.0"?>
      <?xml-stylesheet href="https://evil.example.com/x.xsl" type="text/xsl"?>
      <svg xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24"/></svg>
    SVG

    expect(output).not_to include 'xml-stylesheet'
    expect(output).not_to include 'evil.example.com'
  end

  it 'rejects content that is not an SVG document' do
    expect { service.sanitize '<html><body>not an svg</body></html>' }
      .to raise_error described_class::InvalidSvgError
    expect { service.sanitize 'not markup at all' }
      .to raise_error described_class::InvalidSvgError
  end
end
