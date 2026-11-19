# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::MetadataInterceptor do
  let(:message) do
    Mail.new(from: '"Ville de Bruxelles" <participation@mail.brussels.be>', to: 'ann@example.com').tap do |m|
      m[EmailCampaigns::ApplicationMailer::TENANT_ID_HEADER] = 'tenant-uuid'
      m[EmailCampaigns::ApplicationMailer::DELIVERY_ID_HEADER] = 'delivery-uuid'
    end
  end

  it 'prepares messages delivered through Mailgun' do
    message.delivery_method(Railgun::Mailer, api_key: 'key-test', domain: 'mg.example.org')

    described_class.delivering_email(message)

    expect(message[:domain].value).to eq('mail.brussels.be')
    expect(message.mailgun_variables).to eq(
      'cl_tenant_id' => 'tenant-uuid',
      'cl_delivery_id' => 'delivery-uuid'
    )
  end

  it 'leaves messages for other delivery methods untouched' do
    message.delivery_method(Mail::TestMailer)

    described_class.delivering_email(message)

    expect(message.mailgun_variables).to be_nil
    expect(message[:domain]).to be_nil
  end
end
