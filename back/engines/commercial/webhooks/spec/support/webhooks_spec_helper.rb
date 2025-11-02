# frozen_string_literal: true

RSpec.configure do |config|
  # Stub DNS resolution ONLY for webhooks engine specs to avoid network calls during validation
  # We scope this to only files in the webhooks directory using metadata[:file_path]
  config.before do |example|
    # Only stub for specs in the webhooks engine
    if example.metadata[:file_path].to_s.include?('engines/commercial/webhooks/')
      allow(Resolv).to receive(:getaddresses).and_call_original
      allow(Resolv).to receive(:getaddresses).with(any_args).and_return(['93.184.216.34'])
    end
  end
end
