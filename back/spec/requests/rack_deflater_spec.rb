# frozen_string_literal: true

require 'rails_helper'

describe 'Rack::Deflater' do
  let(:request) { Rack::MockRequest.new(Cl2Back::Application) }

  it 'gzips JSON responses when the client accepts gzip' do
    response = request.get('/web_api/v1/app_configuration', 'HTTP_ACCEPT_ENCODING' => 'gzip')

    expect(response.headers['Content-Encoding']).to eq('gzip')
    expect(response.headers['Vary']).to include('Accept-Encoding')

    body = Zlib::GzipReader.new(StringIO.new(response.body)).read
    expect(JSON.parse(body)).to include('data')
  end

  it 'does not compress when the client does not accept gzip' do
    response = request.get('/web_api/v1/app_configuration')

    expect(response.headers['Content-Encoding']).to be_nil
    expect(JSON.parse(response.body)).to include('data')
  end

  it 'compresses at the fastest level' do
    json = { data: Array.new(2_000) { |i| { id: i, title: "Title #{i}" } } }.to_json
    app = Rack::Deflater.new(
      ->(_env) { [200, { 'Content-Type' => 'application/json' }, [json]] },
      sync: false
    )

    response = Rack::MockRequest.new(app).get('/', 'HTTP_ACCEPT_ENCODING' => 'gzip')

    expect(response.body.bytesize).to eq(Zlib.gzip(json, level: Zlib::BEST_SPEED).bytesize)
  end
end
