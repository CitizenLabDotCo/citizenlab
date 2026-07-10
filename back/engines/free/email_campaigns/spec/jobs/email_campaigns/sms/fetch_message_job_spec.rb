# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Sms::FetchMessageJob do
  let(:provider) { instance_double(EmailCampaigns::Sms::Providers::Twilio) }
  let(:delivery) do
    EmailCampaigns::Sms::Delivery.create!(body: 'hi', status: 'delivered', message_sid: 'SM_1')
  end

  before do
    allow(EmailCampaigns::Sms::Providers::Twilio).to receive(:new).and_return(provider)
  end

  it 'stores what the provider says the message cost' do
    allow(provider).to receive(:fetch_message)
      .with('SM_1')
      .and_return(num_segments: 3, price: BigDecimal('-0.0225'), price_unit: 'usd')

    described_class.perform_now(delivery.id)

    expect(delivery.reload).to have_attributes(
      num_segments: 3,
      price: BigDecimal('-0.0225'),
      price_unit: 'usd'
    )
  end

  # Twilio bills at hand-off to the carrier, so the price is normally settled by the time
  # a terminal status arrives -- but it never is for a message that never got that far.
  it 'stores the segment count even when the provider has not billed the message' do
    allow(provider).to receive(:fetch_message)
      .and_return(num_segments: 1, price: nil, price_unit: nil)

    described_class.perform_now(delivery.id)

    expect(delivery.reload).to have_attributes(num_segments: 1, price: nil, price_unit: nil)
  end

  # A message that failed before a sender was assigned cost zero segments and was never
  # billed. Recording that as zero keeps it distinguishable from a delivery that has not
  # been read back at all, whose num_segments is still null.
  it 'records zero segments for a message that never reached a sender' do
    allow(provider).to receive(:fetch_message)
      .and_return(num_segments: 0, price: nil, price_unit: nil)

    described_class.perform_now(delivery.id)

    expect(delivery.reload).to have_attributes(num_segments: 0, price: nil)
  end

  it 'does nothing for a delivery the provider never accepted' do
    unsent = EmailCampaigns::Sms::Delivery.create!(body: 'hi', status: 'failed')
    expect(provider).not_to receive(:fetch_message)

    described_class.perform_now(unsent.id)

    expect(unsent.reload.num_segments).to be_nil
  end

  it 'raises on a transient provider error so the job is retried' do
    allow(provider).to receive(:fetch_message)
      .and_raise(EmailCampaigns::Sms::ProviderError::RateLimit, 'slow down')

    expect { described_class.perform_now(delivery.id) }
      .to raise_error(EmailCampaigns::Sms::ProviderError::RateLimit)
    expect(delivery.reload.num_segments).to be_nil
  end
end
