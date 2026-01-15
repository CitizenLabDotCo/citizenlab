# frozen_string_literal: true

require 'rails_helper'

RSpec.describe VisitorHashService do
  let(:service) { described_class.new }

  before do
    allow(ENV).to receive(:fetch).with('VISITOR_HASH_SALT').and_return('test-salt-for-specs')
  end

  describe '#generate_for_visitor' do
    it 'generates a consistent hash for the same IP and user agent' do
      hash1 = service.generate_for_visitor('192.168.1.1', 'Mozilla/5.0')
      hash2 = service.generate_for_visitor('192.168.1.1', 'Mozilla/5.0')
      expect(hash1).to eq(hash2)
    end

    it 'generates different hashes for different IPs' do
      hash1 = service.generate_for_visitor('192.168.1.1', 'Mozilla/5.0')
      hash2 = service.generate_for_visitor('192.168.1.2', 'Mozilla/5.0')
      expect(hash1).not_to eq(hash2)
    end

    it 'generates different hashes for different user agents' do
      hash1 = service.generate_for_visitor('192.168.1.1', 'Mozilla/5.0')
      hash2 = service.generate_for_visitor('192.168.1.1', 'Chrome/90.0')
      expect(hash1).not_to eq(hash2)
    end

    it 'returns a SHA256 hex string' do
      hash = service.generate_for_visitor('192.168.1.1', 'Mozilla/5.0')
      expect(hash).to match(/^[a-f0-9]{64}$/)
    end
  end

  describe 'salt configuration' do
    it 'raises an error when VISITOR_HASH_SALT is not configured' do
      allow(ENV).to receive(:fetch).with('VISITOR_HASH_SALT').and_raise(KeyError)
      expect { service.generate_for_visitor('192.168.1.1', 'Mozilla/5.0') }.to raise_error(KeyError)
    end
  end
end
