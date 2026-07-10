# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Sms::Providers::Twilio do
  subject(:provider) { described_class.new }

  include_context 'with sms feature enabled'

  describe '#fetch_message' do
    let(:message) do
      instance_double(
        Twilio::REST::Api::V2010::AccountContext::MessageInstance,
        num_segments: num_segments,
        price: price,
        price_unit: price_unit
      )
    end
    let(:num_segments) { '3' }
    let(:price) { '-0.02250' }
    let(:price_unit) { 'usd' }

    before do
      messages = instance_double(Twilio::REST::Api::V2010::AccountContext::MessageContext, fetch: message)
      v2010 = instance_double(Twilio::REST::Api::V2010)
      api = instance_double(Twilio::REST::Api)
      client = instance_double(Twilio::REST::Client)

      allow(v2010).to receive(:messages).with('SM_1').and_return(messages)
      allow(api).to receive(:v2010).and_return(v2010)
      allow(client).to receive(:api).and_return(api)
      allow(Twilio::REST::Client).to receive(:new).and_return(client)
    end

    it 'casts the provider strings into a segment count and a signed price' do
      expect(provider.fetch_message('SM_1')).to eq(
        num_segments: 3,
        price: BigDecimal('-0.0225'),
        price_unit: 'usd'
      )
    end

    context 'when the message has not been billed yet' do
      let(:price) { nil }
      let(:price_unit) { nil }

      it 'reports no price rather than a zero one' do
        expect(provider.fetch_message('SM_1')).to include(num_segments: 3, price: nil, price_unit: nil)
      end
    end

    context 'when the price is an empty string' do
      let(:price) { '' }
      let(:price_unit) { '' }

      it 'reports no price' do
        expect(provider.fetch_message('SM_1')).to include(price: nil, price_unit: nil)
      end
    end

    # A message that failed before a sender was assigned really did cost zero segments.
    # Reporting that as zero, rather than as nothing, keeps it distinguishable from a
    # delivery we have never read back — on which num_segments is still null.
    context 'when no sender was ever assigned' do
      let(:num_segments) { '0' }
      let(:price) { nil }

      it 'reports zero segments' do
        expect(provider.fetch_message('SM_1')).to include(num_segments: 0, price: nil)
      end
    end
  end
end
