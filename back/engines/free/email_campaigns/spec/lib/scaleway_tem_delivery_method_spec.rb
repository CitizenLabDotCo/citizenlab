# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::ScalewayTemDeliveryMethod do
  subject(:delivery_method) { described_class.new(secret_key: 'scw-secret', project_id: 'project-uuid') }

  let(:endpoint) { 'https://api.scaleway.com/transactional-email/v1alpha1/regions/fr-par/emails' }
  let(:mail) do
    Mail.new(
      from: '"Ville de Bruxelles" <participation@mail.brussels.be>',
      to: '"Ann Peeters" <ann@example.com>',
      reply_to: 'support@brussels.be',
      subject: 'New phase',
      body: '<p>Hello</p>',
      content_type: 'text/html; charset=UTF-8'
    ).tap { |m| m['X-GoVocal-Delivery-Id'] = 'delivery-uuid' }
  end
  let(:success) do
    { status: 200, headers: { 'Content-Type' => 'application/json' }, body: { emails: [{ id: 'email-uuid' }] }.to_json }
  end

  it 'posts the message to the TEM API with the project credentials' do
    stub_request(:post, endpoint).to_return(success)

    delivery_method.deliver!(mail)

    expect(a_request(:post, endpoint).with(
      headers: { 'X-Auth-Token' => 'scw-secret' },
      body: hash_including('project_id' => 'project-uuid')
    )).to have_been_made
  end

  it 'maps addresses, content and non-structural headers onto the API payload' do
    payload = nil
    stub_request(:post, endpoint)
      .with { |req| payload = JSON.parse(req.body) }
      .to_return(success)

    delivery_method.deliver!(mail)

    expect(payload).to include(
      'from' => { 'email' => 'participation@mail.brussels.be', 'name' => 'Ville de Bruxelles' },
      'to' => [{ 'email' => 'ann@example.com', 'name' => 'Ann Peeters' }],
      'subject' => 'New phase',
      'html' => '<p>Hello</p>'
    )
    expect(payload['additional_headers']).to contain_exactly(
      { 'key' => 'Reply-To', 'value' => 'support@brussels.be' },
      { 'key' => 'X-GoVocal-Delivery-Id', 'value' => 'delivery-uuid' }
    )
    expect(payload).not_to have_key('text') # the mail has no plain-text part, only HTML
  end

  it 'raises a permanent error on client errors' do
    stub_request(:post, endpoint).to_return(
      status: 400, headers: { 'Content-Type' => 'application/json' }, body: { message: 'invalid from' }.to_json
    )

    expect { delivery_method.deliver!(mail) }.to raise_error(described_class::PermanentError, /400.*invalid from/)
  end

  it 'raises a transient error on rate limiting, server errors and network failures' do
    stub_request(:post, endpoint).to_return(status: 429).then.to_return(status: 503).then.to_timeout

    3.times do
      expect { delivery_method.deliver!(mail) }.to raise_error(described_class::TransientError)
    end
  end

  it 'treats a Scaleway transient_state_error as transient' do
    stub_request(:post, endpoint).to_return(
      status: 409, headers: { 'Content-Type' => 'application/json' }, body: { type: 'transient_state_error', message: 'domain is being checked' }.to_json
    )

    expect { delivery_method.deliver!(mail) }.to raise_error(described_class::TransientError, /409.*being checked/)
  end

  it 'requires the credentials' do
    expect { described_class.new(project_id: 'p') }.to raise_error(ArgumentError, /secret_key/)
  end
end
