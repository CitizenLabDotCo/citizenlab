# frozen_string_literal: true

require 'rails_helper'

describe ImpactTracking::SessionHashService do
  let(:service) { described_class.new }

  describe 'generate_for_visitor' do
    it 'generates a different hash for different parameters' do
      ip1 = '1.2.3.4'
      user_agent = 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:64.0) Gecko/20100101 Firefox/64.0'
      ip2 = '4.3.2.1'
      hash1 = service.generate_for_visitor(ip1, user_agent)
      hash2 = service.generate_for_visitor(ip2, user_agent)

      expect(hash1).not_to eq hash2
    end

    it 'generates a hash that doesn\'t contain the passed parameters plaintext' do
      ip = '1.2.3.4'
      user_agent = 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:64.0) Gecko/20100101 Firefox/64.0'
      result = service.generate_for_visitor(ip, user_agent)
      expect(result).to be_present
      expect(result).not_to include(ip)
      expect(result).not_to include(user_agent)
    end

    it 'generates the same hash for the same parameters in the same month' do
      hash1 = nil
      hash2 = nil
      ip = '5.4.3.2'
      user_agent = 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:64.0) Gecko/20100101 Firefox/64.0'
      travel_to(Date.parse('2022-09-03')) do
        hash1 = service.generate_for_visitor(ip, user_agent)
      end

      travel_to(Date.parse('2022-09-28')) do
        hash2 = service.generate_for_visitor(ip, user_agent)
      end

      expect(hash1).to eq hash2
    end

    it 'generate a different hash for the same parameters in a different month' do
      hash1 = nil
      hash2 = nil
      ip = '5.4.3.2'
      user_agent = 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:64.0) Gecko/20100101 Firefox/64.0'
      travel_to(Date.parse('2022-09-03')) do
        hash1 = service.generate_for_visitor(ip, user_agent)
      end

      travel_to(Date.parse('2022-10-01')) do
        hash2 = service.generate_for_visitor(ip, user_agent)
      end

      expect(hash1).not_to eq hash2
    end
  end

  describe 'generate_for_user' do
    before do
      @user1_id = create(:user).id
      @user2_id = create(:user).id
    end

    it 'generates a different hash for a different user' do
      hash1 = service.generate_for_user(@user1_id)
      hash2 = service.generate_for_user(@user2_id)

      expect(hash1).not_to eq hash2
    end

    it 'generates a hash that doesn\'t contain the passed user_id' do
      result = service.generate_for_user(@user1_id)
      expect(result).to be_present
      expect(result).not_to include(@user1_id)
    end

    it 'generates the same hash for the same user in the same month' do
      hash1 = nil
      hash2 = nil
      travel_to(Date.parse('2022-09-03')) do
        hash1 = service.generate_for_user(@user1_id)
      end

      travel_to(Date.parse('2022-09-28')) do
        hash2 = service.generate_for_user(@user1_id)
      end

      expect(hash1).to eq hash2
    end

    it 'generate a different hash for the same user in a different month' do
      hash1 = nil
      hash2 = nil
      travel_to(Date.parse('2022-09-03')) do
        hash1 = service.generate_for_user(@user1_id)
      end

      travel_to(Date.parse('2022-10-01')) do
        hash2 = service.generate_for_user(@user1_id)
      end

      expect(hash1).not_to eq hash2
    end
  end
end
