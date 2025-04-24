# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CustomFieldBins::AgeBin do
  before do
    travel_to Time.zone.local(2025, 3, 21)
  end

  describe 'Default factory' do
    it 'is valid' do
      expect(build(:age_bin)).to be_valid
    end
  end

  describe 'validations' do
    it 'validates a range with infinity as valid' do
      bin = build(:age_bin, range: 20...Float::INFINITY)
      expect(bin).to be_valid
    end
  end

  describe '#in_bin?' do
    let(:age_counter) { instance_double(UserCustomFields::AgeCounter) }
    let(:bin) { build(:age_bin, range: 20...40) }

    it 'returns true when the birthyear is in the range' do
      expect(bin.in_bin?(1990)).to be true
    end

    it 'returns false when the birthyear is not in the range' do
      expect(bin.in_bin?(2010)).to be false
      expect(bin.in_bin?(1970)).to be false
    end

    it 'returns false for nil' do
      expect(bin.in_bin?(nil)).to be false
    end

    it 'it deals well with an open-ended range' do
      bin = build(:age_bin, range: 20...nil)
      expect(bin.in_bin?(1990)).to be true
      expect(bin.in_bin?(2010)).to be false
      expect(bin.in_bin?(nil)).to be false
    end
  end

  describe '#filter_by_bin' do
    let(:custom_field) { create(:custom_field_birthyear) }
    let(:bin) { create(:age_bin, custom_field:, range: 20...40) }
    let(:scope) { User.all }

    it 'filters the scope by birthyear in the range' do
      user1 = create(:user, custom_field_values: { custom_field.key => 1990 })
      user2 = create(:user, custom_field_values: { custom_field.key => 2010 })
      user3 = create(:user, custom_field_values: { custom_field.key => nil })
      user4 = create(:user)

      filtered_scope = bin.filter_by_bin(scope)

      expect(filtered_scope).to include(user1)
      expect(filtered_scope).not_to include(user2)
      expect(filtered_scope).not_to include(user3)
      expect(filtered_scope).not_to include(user4)
    end
  end

  describe '.generate_bins' do
    let(:custom_field) { create(:custom_field_birthyear) }

    context 'when bins already exist' do
      let!(:bin) { create(:age_bin, custom_field:) }

      it 'does not create new bins' do
        expect do
          described_class.generate_bins(custom_field)
        end.not_to change(described_class, :count)
      end
    end

    context 'when bins do not exist' do
      it 'creates 5 age bins with predefined ranges' do
        expect do
          described_class.generate_bins(custom_field)
        end.to change(described_class, :count).by(5)
      end
    end
  end
end
