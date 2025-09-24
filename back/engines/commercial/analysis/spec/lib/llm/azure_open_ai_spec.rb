# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analysis::LLM::AzureOpenAI do
  before { allow(ErrorReporter).to receive(:report_msg) }

  let(:subclass) do
    Class.new(described_class) do
      def self.gpt_model
        'gpt-vocal'
      end
    end
  end
  let(:service) { subclass.new }

  describe 'chat' do
    before { allow(service).to receive(:sleep) } # Don't sleep while testing

    it 'reports error when response is 429 and retries is 0' do
      allow(service.instance_variable_get(:@client)).to(
        receive(:chat).and_raise(Faraday::TooManyRequestsError.new(status: 429))
      )
      expect { service.chat('fake prompt', retries: 0) }.to raise_error(Faraday::TooManyRequestsError)
      expect(ErrorReporter).to have_received :report_msg
    end

    it 'retries when response is 429 and retries > 0' do
      allow(service).to receive(:chat_with_retry).with(retries: 3, parameters: anything).and_call_original
      allow(service.instance_variable_get(:@client)).to(
        receive(:chat).and_raise(Faraday::TooManyRequestsError.new(status: 429))
      )
      fake_response = { 'choices' => [{ 'message' => { 'content' => 'fake response' } }] }
      allow(service).to receive(:chat_with_retry).with(retries: 2, parameters: anything).and_return(fake_response)
      expect(service.chat('fake prompt', retries: 3)).to eq 'fake response'
      expect(service).to have_received(:chat_with_retry).twice
      expect(ErrorReporter).not_to have_received :report_msg
    end

    it 'reports error when response is not 429 and retries > 0' do
      allow(service.instance_variable_get(:@client)).to(
        receive(:chat).and_raise(Faraday::TooManyRequestsError.new(status: 400))
      )
      expect { service.chat('fake prompt', retries: 3) }.to raise_error(Faraday::TooManyRequestsError)
      expect(ErrorReporter).to have_received :report_msg
    end

    it 'returns when response is ok' do
      fake_response = { 'choices' => [{ 'message' => { 'content' => 'fake response' } }] }
      allow(service.instance_variable_get(:@client)).to(
        receive(:chat).and_return(fake_response)
      )
      expect(service.chat('fake prompt')).to eq 'fake response'
      expect(ErrorReporter).not_to have_received :report_msg
    end
  end

  describe 'usable_context_window' do
    it 'applies headroom ratio to the context window for safety margin' do
      raw_context_window = 1000
      stubbed_headroom_ratio = 0.5 # 50% safety margin
      expected_usable_window = 500

      expect(service)
        .to receive(:context_window)
        .and_return(raw_context_window)

      expect(subclass)
        .to receive(:headroom_ratio)
        .and_return(stubbed_headroom_ratio)

      expect(service.usable_context_window).to eq(expected_usable_window)
    end
  end
end
