# frozen_string_literal: true

require 'rails_helper'

RSpec.describe WebhookUrlValidator do
  let(:subscription) { Webhooks::Subscription.new(name: 'Test', events: ['idea.created']) }

  describe 'URL validation' do
    it 'accepts valid HTTPS URLs' do
      subscription.url = 'https://webhook.example.com/receive'
      allow(Resolv).to receive(:getaddresses).and_return(['93.184.216.34']) # example.com public IP

      expect(subscription).to be_valid
    end

    it 'rejects invalid URLs' do
      subscription.url = 'ht!tp://invalid url with spaces'
      expect(subscription).not_to be_valid
      expect(subscription.errors[:url]).to include('is not a valid URL')
    end

    it 'rejects URLs without hostname' do
      subscription.url = 'https://'
      expect(subscription).not_to be_valid
      expect(subscription.errors[:url]).to include('must include a hostname')
    end

    it 'rejects URLs that do not resolve' do
      subscription.url = 'https://nonexistent-domain-12345.com'
      allow(Resolv).to receive(:getaddresses).and_raise(Resolv::ResolvError)

      expect(subscription).not_to be_valid
      expect(subscription.errors[:url]).to include('hostname does not resolve')
    end
  end

  describe 'HTTPS enforcement' do
    context 'in production' do
      before { allow(Rails.env).to receive(:development?).and_return(false) }

      it 'requires HTTPS' do
        subscription.url = 'http://webhook.example.com'
        expect(subscription).not_to be_valid
        expect(subscription.errors[:url]).to include('must use HTTPS')
      end

      it 'accepts HTTPS' do
        subscription.url = 'https://webhook.example.com'
        allow(Resolv).to receive(:getaddresses).and_return(['93.184.216.34'])

        expect(subscription).to be_valid
      end
    end

    context 'in development' do
      before { allow(Rails.env).to receive(:development?).and_return(true) }

      it 'accepts HTTP' do
        subscription.url = 'http://webhook.example.com'
        allow(Resolv).to receive(:getaddresses).and_return(['93.184.216.34'])

        expect(subscription).to be_valid
      end

      it 'accepts HTTPS' do
        subscription.url = 'https://webhook.example.com'
        allow(Resolv).to receive(:getaddresses).and_return(['93.184.216.34'])

        expect(subscription).to be_valid
      end
    end
  end

  describe 'SSRF protection' do
    context 'localhost blocking' do
      before { allow(Rails.env).to receive(:development?).and_return(false) }

      it 'blocks localhost hostname' do
        subscription.url = 'https://localhost:3000'
        allow(Resolv).to receive(:getaddresses).and_return(['127.0.0.1'])

        expect(subscription).not_to be_valid
        expect(subscription.errors[:url]).to include('cannot be an internal or private address')
      end

      it 'blocks IPv4 loopback (127.0.0.1)' do
        subscription.url = 'https://127.0.0.1:6379'
        allow(Resolv).to receive(:getaddresses).and_return(['127.0.0.1'])

        expect(subscription).not_to be_valid
      end

      it 'blocks other loopback addresses (127.0.0.2)' do
        subscription.url = 'https://127.0.0.2'
        allow(Resolv).to receive(:getaddresses).and_return(['127.0.0.2'])

        expect(subscription).not_to be_valid
      end

      it 'blocks IPv6 loopback (::1)' do
        subscription.url = 'https://[::1]:6379'
        allow(Resolv).to receive(:getaddresses).and_return(['::1'])

        expect(subscription).not_to be_valid
      end
    end

    context 'private network blocking' do
      it 'blocks private class A (10.0.0.0/8)' do
        subscription.url = 'https://10.0.0.1'
        allow(Resolv).to receive(:getaddresses).and_return(['10.0.0.1'])

        expect(subscription).not_to be_valid
      end

      it 'blocks private class B (172.16.0.0/12)' do
        ['172.16.0.1', '172.20.0.1', '172.31.255.255'].each do |ip|
          subscription.url = "https://#{ip}"
          allow(Resolv).to receive(:getaddresses).and_return([ip])

          expect(subscription).not_to be_valid
        end
      end

      it 'blocks private class C (192.168.0.0/16)' do
        subscription.url = 'https://192.168.1.1'
        allow(Resolv).to receive(:getaddresses).and_return(['192.168.1.1'])

        expect(subscription).not_to be_valid
      end
    end

    context 'cloud metadata endpoint blocking' do
      it 'blocks link-local addresses (169.254.0.0/16)' do
        subscription.url = 'https://169.254.1.1'
        allow(Resolv).to receive(:getaddresses).and_return(['169.254.1.1'])

        expect(subscription).not_to be_valid
      end

      it 'blocks AWS/GCP/Azure metadata endpoint' do
        subscription.url = 'https://169.254.169.254/latest/meta-data'
        allow(Resolv).to receive(:getaddresses).and_return(['169.254.169.254'])

        expect(subscription).not_to be_valid
      end
    end

    context 'IPv6 blocking' do
      it 'blocks IPv6 private addresses (fd00::/8)' do
        subscription.url = 'https://[fd00::1]'
        allow(Resolv).to receive(:getaddresses).and_return(['fd00::1'])

        expect(subscription).not_to be_valid
      end

      it 'blocks IPv6 link-local (fe80::/10)' do
        subscription.url = 'https://[fe80::1]'
        allow(Resolv).to receive(:getaddresses).and_return(['fe80::1'])

        expect(subscription).not_to be_valid
      end
    end

    context 'current network blocking' do
      it 'blocks 0.0.0.0/8' do
        subscription.url = 'https://0.0.0.1'
        allow(Resolv).to receive(:getaddresses).and_return(['0.0.0.1'])

        expect(subscription).not_to be_valid
      end
    end

    context 'DNS rebinding protection' do
      it 'validates resolved IP, not just the hostname' do
        # Evil domain that resolves to private IP
        subscription.url = 'https://evil.com'
        allow(Resolv).to receive(:getaddresses).and_return(['10.0.0.1'])

        expect(subscription).not_to be_valid
        expect(subscription.errors[:url]).to include('cannot be an internal or private address')
      end

      it 'checks all resolved IP addresses' do
        # Domain with multiple A records including private IP
        subscription.url = 'https://example.com'
        allow(Resolv).to receive(:getaddresses).and_return(['93.184.216.34', '10.0.0.1'])

        expect(subscription).not_to be_valid
      end
    end
  end

  describe 'localhost in development' do
    before { allow(Rails.env).to receive(:development?).and_return(true) }

    it 'allows localhost' do
      subscription.url = 'http://localhost:3000'
      allow(Resolv).to receive(:getaddresses).and_return(['127.0.0.1'])

      expect(subscription).to be_valid
    end

    it 'allows 127.0.0.1' do
      subscription.url = 'http://127.0.0.1:3000'
      allow(Resolv).to receive(:getaddresses).and_return(['127.0.0.1'])

      expect(subscription).to be_valid
    end

    it 'allows IPv6 ::1' do
      subscription.url = 'http://[::1]:3000'
      allow(Resolv).to receive(:getaddresses).with('[::1]').and_return(['::1'])

      expect(subscription).to be_valid
    end
  end

  describe 'public IPs' do
    it 'allows valid public IPv4 addresses' do
      subscription.url = 'https://93.184.216.34' # example.com
      allow(Resolv).to receive(:getaddresses).and_return(['93.184.216.34'])

      expect(subscription).to be_valid
    end

    it 'allows valid public domains' do
      subscription.url = 'https://webhook.example.com'
      allow(Resolv).to receive(:getaddresses).and_return(['93.184.216.34'])

      expect(subscription).to be_valid
    end
  end

  describe 'edge cases' do
    it 'handles DNS resolution returning empty array' do
      subscription.url = 'https://empty-response.com'
      allow(Resolv).to receive(:getaddresses).and_return([])

      expect(subscription).not_to be_valid
      expect(subscription.errors[:url]).to include('hostname does not resolve')
    end

    it 'handles invalid IP address format' do
      subscription.url = 'https://test.com'
      allow(Resolv).to receive(:getaddresses).and_return(['not-an-ip'])

      expect(subscription).not_to be_valid
      expect(subscription.errors[:url].any? { |msg| msg.include?('invalid IP address') }).to be true
    end
  end
end
