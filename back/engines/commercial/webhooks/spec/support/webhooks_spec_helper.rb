# frozen_string_literal: true

RSpec.configure do |config|
  # Stub DNS resolution ONLY for webhooks engine specs to avoid network calls during validation
  config.before do |example|
    allow(Resolv).to receive(:getaddresses).and_call_original
    allow(Resolv).to receive(:getaddresses).with(a_string_matching(/webhook.example.com.*/)).and_return(['93.184.216.34'])
  end
end