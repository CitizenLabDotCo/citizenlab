# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ParticipationDevice do
  describe '.hash_device' do
    let(:project_id) { SecureRandom.uuid }
    let(:device_hash) { described_class.hash_device(project_id, '1.2.3.4', 'Firefox') }

    it 'is the same for the same project, IP and user agent' do
      expect(described_class.hash_device(project_id, '1.2.3.4', 'Firefox')).to eq device_hash
    end

    it 'differs between projects' do
      expect(described_class.hash_device(SecureRandom.uuid, '1.2.3.4', 'Firefox')).not_to eq device_hash
    end

    it 'differs between IPs and between user agents' do
      expect(described_class.hash_device(project_id, '1.2.3.5', 'Firefox')).not_to eq device_hash
      expect(described_class.hash_device(project_id, '1.2.3.4', 'Safari')).not_to eq device_hash
    end

    it 'is not a plain hash of the inputs' do
      expect(device_hash).not_to eq Digest::SHA256.hexdigest([project_id, '1.2.3.4', 'Firefox'].join("\n"))
    end
  end
end
