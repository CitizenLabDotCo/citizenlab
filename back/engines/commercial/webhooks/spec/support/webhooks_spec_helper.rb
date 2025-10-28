# frozen_string_literal: true

RSpec.configure do |config|
  # Stub DNS resolution globally for webhook tests to avoid network calls
  config.before(:each) do
    allow(Resolv).to receive(:getaddresses).and_return(['93.184.216.34'])
  end
end
