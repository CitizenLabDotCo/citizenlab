# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analysis::LLM::GPT54 do
  let(:service) { described_class.new }

  describe 'token_count' do
    it 'counts tokens even though tiktoken does not know the gpt-5 series' do
      expect(Tiktoken.encoding_for_model(described_class.gpt_model)).to be_nil
      expect(service.token_count('Hello, how are you?')).to be > 0
    end
  end

  describe 'chat' do
    it 'does not send sampling parameters' do
      expect(service.response_client)
        .to receive(:create)
        .with(parameters: hash_excluding(:temperature, :top_p))
        .and_return(nil)

      service.chat('Hello?')
    end

    it 'sends the gpt-5.4 deployment as model' do
      expect(service.response_client)
        .to receive(:create)
        .with(parameters: hash_including(model: 'gpt-5.4'))
        .and_return(nil)

      service.chat('Hello?')
    end
  end
end
