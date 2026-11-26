# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::ScalewaySnsMessage do
  # A throwaway PKI: root CA -> intermediate CA -> signing certificate, plus a foreign CA.
  def issue_certificate(subject, issuer: nil, issuer_key: nil, ca: false)
    key = OpenSSL::PKey::RSA.new(2048)

    # Fields
    cert = OpenSSL::X509::Certificate.new
    cert.version = 2
    cert.serial = SecureRandom.random_number(2**31)
    cert.subject = OpenSSL::X509::Name.parse("/CN=#{subject}")
    cert.issuer = issuer ? issuer.subject : cert.subject
    cert.public_key = key.public_key
    cert.not_before = 1.minute.ago
    cert.not_after = 1.hour.from_now

    # Extensions say what the certificate may be used for:
    # issuing other certificates (CA) or signing.
    factory = OpenSSL::X509::ExtensionFactory.new
    factory.subject_certificate = cert
    factory.issuer_certificate = issuer || cert
    cert.add_extension(factory.create_extension('basicConstraints', ca ? 'CA:TRUE' : 'CA:FALSE', true))
    cert.add_extension(factory.create_extension('keyUsage', ca ? 'keyCertSign, cRLSign' : 'digitalSignature', true))

    # Signed by the issuer's key, or by its own key for a root CA.
    cert.sign(issuer_key || key, OpenSSL::Digest.new('SHA256'))

    [cert, key]
  end

  # Built once per run: 2048-bit keys are slow to generate.
  let_it_be(:pki) do
    root, root_key = issue_certificate('Test MnQ Root', ca: true)
    intermediate, intermediate_key = issue_certificate('Test MnQ', issuer: root, issuer_key: root_key, ca: true)
    signing_cert, signing_key = issue_certificate('sns.mnq.fr-par.scaleway.com', issuer: intermediate, issuer_key: intermediate_key)
    foreign_cert, foreign_key = issue_certificate('evil')

    trust_chain = Tempfile.new(%w[trust-chain .pem])
    trust_chain.write(root.to_pem, intermediate.to_pem)
    trust_chain.flush

    { signing_cert:, signing_key:, foreign_cert:, foreign_key:, trust_chain: }
  end

  after(:all) { pki[:trust_chain].close! } # rubocop:disable RSpec/BeforeAfterAll

  let(:certificate_url) { 'https://messaging.s3.fr-par.scw.cloud/fr-par/sns/sns_certificate_test.pem' }
  let(:topic_arn) { 'arn:scw:sns:fr-par:project-uuid:tem-events' }
  let(:event) do
    {
      type: 'email_delivered',
      email_id: 'email-uuid',
      email_headers: [{ key: 'X-Govocal-Delivery-Id', value: 'delivery-uuid' }]
    }
  end

  # Builds and signs an envelope the way SNS does: `Key\nvalue\n` for each signed key present, in order.
  def signed_envelope(type:, key: pki[:signing_key], version: '1', **fields)
    envelope = {
      'Type' => type,
      'MessageId' => SecureRandom.uuid,
      'TopicArn' => topic_arn,
      'Message' => event.to_json,
      'Timestamp' => Time.now.utc.iso8601(3),
      'SignatureVersion' => version,
      'SigningCertURL' => certificate_url,
      'UnsubscribeURL' => 'https://sns.mnq.fr-par.scaleway.com/?Action=Unsubscribe&SubscriptionArn=x'
    }.merge(fields)

    signed_keys = if type == 'Notification'
      %w[Message MessageId Subject Timestamp TopicArn Type]
    else
      %w[Message MessageId SubscribeURL Timestamp Token TopicArn Type]
    end

    string = signed_keys.filter_map { |k| "#{k}\n#{envelope[k]}\n" if envelope.key?(k) }.join
    envelope['Signature'] = Base64.strict_encode64(key.sign(version == '1' ? 'SHA1' : 'SHA256', string))
    envelope
  end

  before do
    described_class.trust_chain_path = pki[:trust_chain].path
    described_class.expected_topic_arn = topic_arn
    Rails.cache.clear
    stub_request(:get, certificate_url).to_return(status: 200, body: pki[:signing_cert].to_pem)
  end

  after do
    described_class.trust_chain_path = nil
    described_class.expected_topic_arn = nil
  end

  it 'accepts a notification signed by a certificate issued by the trusted chain' do
    message = described_class.parse!(signed_envelope(type: 'Notification').to_json)

    expect(message.type).to eq('Notification')
    expect(message.topic_arn).to eq(topic_arn)
    expect(message.event).to include('type' => 'email_delivered', 'email_id' => 'email-uuid')
  end

  it 'accepts a version 2 signature' do
    message = described_class.parse!(signed_envelope(type: 'Notification', version: '2').to_json)
    expect(message.event['type']).to eq('email_delivered')
  end

  it 'exposes the subscription URL of a subscription confirmation' do
    subscribe_url = 'https://sns.mnq.fr-par.scaleway.com/?Action=ConfirmSubscription&TopicArn=x&Token=y'
    envelope = signed_envelope(type: 'SubscriptionConfirmation', 'SubscribeURL' => subscribe_url, 'Token' => 'y').to_json
    message = described_class.parse!(envelope)

    expect(message.subscribe_url).to eq(subscribe_url)
  end

  it 'does not expose fields that are neither signed nor checked' do
    # `SubscribeURL` is not covered by the signature of a notification.
    envelope = signed_envelope(type: 'Notification', 'SubscribeURL' => 'https://attacker.example/')
    message = described_class.parse!(envelope.to_json)

    expect(message.subscribe_url).to be_nil
    expect(message.envelope).not_to include('SubscribeURL', 'UnsubscribeURL')
  end

  it 'cannot be instantiated without going through verification' do
    expect { described_class.new({}) }.to raise_error(NoMethodError)
  end

  it 'refuses a message whose signature does not match its content' do
    envelope = signed_envelope(type: 'Notification')
    envelope['Message'] = { type: 'email_delivered', email_headers: [{ key: 'X-Govocal-Delivery-Id', value: 'other' }] }.to_json

    expect { described_class.parse!(envelope.to_json) }.to raise_error(described_class::InvalidMessage, /signature/)
  end

  it 'refuses a certificate that is not issued by the trusted chain' do
    stub_request(:get, certificate_url).to_return(status: 200, body: pki[:foreign_cert].to_pem)

    envelope = signed_envelope(type: 'Notification', key: pki[:foreign_key]).to_json

    expect { described_class.parse!(envelope) }
      .to raise_error(described_class::InvalidMessage, /not issued by Scaleway/)
  end

  it 'refuses an oversized certificate' do
    stub_request(:get, certificate_url).to_return(status: 200, body: 'x' * (described_class::MAX_CERTIFICATE_BYTES + 1))

    expect { described_class.parse!(signed_envelope(type: 'Notification').to_json) }
      .to raise_error(described_class::InvalidMessage, /too large/)
  end

  it 'refuses a certificate URL outside the Scaleway bucket without fetching it' do
    foreign_url = 'https://messaging.s3.fr-par.scw.cloud.attacker.example/fr-par/sns/cert.pem'

    expect { described_class.parse!(signed_envelope(type: 'Notification', 'SigningCertURL' => foreign_url).to_json) }
      .to raise_error(described_class::InvalidMessage, /SigningCertURL/)
    expect(a_request(:get, foreign_url)).not_to have_been_made
  end

  describe 'topic' do
    let(:foreign_topic_arn) { 'arn:scw:sns:fr-par:project-other:their-topic' }

    it 'refuses a correctly signed notification from another topic' do
      envelope = signed_envelope(type: 'Notification', 'TopicArn' => foreign_topic_arn).to_json

      expect { described_class.parse!(envelope) }.to raise_error(described_class::InvalidMessage, /TopicArn/)
      expect(a_request(:get, certificate_url)).not_to have_been_made # It should not fetch the certificate.
    end

    it 'refuses a correctly signed subscription confirmation from another topic' do
      subscribe_url = 'https://sns.mnq.fr-par.scaleway.com/?Action=ConfirmSubscription&TopicArn=x&Token=y'

      envelope = signed_envelope(
        type: 'SubscriptionConfirmation',
        'TopicArn' => foreign_topic_arn,
        'SubscribeURL' => subscribe_url,
        'Token' => 'y'
      ).to_json

      expect { described_class.parse!(envelope) }
        .to raise_error(described_class::InvalidMessage, /TopicArn/)
    end

    it 'refuses every envelope when no topic is configured' do
      described_class.expected_topic_arn = nil
      stub_const('ENV', ENV.to_h.except('SCW_TEM_TOPIC_ARN'))

      expect { described_class.parse!(signed_envelope(type: 'Notification').to_json) }
        .to raise_error(described_class::InvalidMessage, /no expected topic/)
    end

    it 'reads the expected topic from the environment' do
      described_class.expected_topic_arn = nil
      topic_arn = 'arn:scw:sns:fr-par:project-uuid:from-env'
      stub_const('ENV', ENV.to_h.merge('SCW_TEM_TOPIC_ARN' => topic_arn))

      expect(described_class.expected_topic_arn).to eq(topic_arn)
    end
  end

  it 'refuses bodies that are not SNS envelopes' do
    expect { described_class.parse!('not json') }.to raise_error(described_class::InvalidMessage, /JSON/)
    expect { described_class.parse!('[]') }.to raise_error(described_class::InvalidMessage, /object/)
    expect { described_class.parse!(signed_envelope(type: 'Notification', 'Type' => 'UnsubscribeConfirmation').to_json) }
      .to raise_error(described_class::InvalidMessage, /Type/)
  end

  it 'fetches a signing certificate once per URL' do
    2.times { described_class.parse!(signed_envelope(type: 'Notification').to_json) }

    expect(a_request(:get, certificate_url)).to have_been_made.once
  end
end
