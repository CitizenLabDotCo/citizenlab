# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CustomFieldBins::RangeBin do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:range_bin)).to be_valid
    end
  end

  describe '#in_bin?' do
    let(:bin) { build(:range_bin, range: 10...20) }

    it 'returns true for a value within the range' do
      expect(bin.in_bin?(15)).to be true
    end

    it 'returns false for a value outside the range' do
      expect(bin.in_bin?(5)).to be false
      expect(bin.in_bin?(20)).to be false
    end

    it 'returns false for nil' do
      expect(bin.in_bin?(nil)).to be false
    end
  end

  describe '.generate_bins' do
    context 'when bins already exist' do
      let!(:custom_field) { create(:custom_field_number) }
      let!(:bin) { create(:range_bin, custom_field: custom_field) }

      it 'does not create new bins' do
        expect do
          described_class.generate_bins(custom_field)
        end.not_to change(described_class, :count)
      end
    end

    context 'when bins do not exist' do
      let!(:custom_field) { create(:custom_field_number) }
      let!(:low_user) { create(:user, custom_field_values: { custom_field.key => 5 }) }
      let!(:high_user) { create(:user, custom_field_values: { custom_field.key => 20 }) }

      it 'creates bins for the specified range and bin count' do
        expect do
          described_class.generate_bins(custom_field)
        end.to change(described_class, :count).by(4)

        bins = described_class.all
        expect(bins.size).to eq(4)

        ranges = bins.map(&:range)
        expect(ranges).to include(5...9)
        expect(ranges).to include(9...13)
        expect(ranges).to include(13...16)
        expect(ranges).to include(16...20)
      end

      it 'handles custom lower and upper bounds' do
        expect do
          described_class.generate_bins(custom_field, lower_bound: 10, upper_bound: 50, bin_count: 2)
        end.to change(described_class, :count).by(2)

        bins = described_class.all
        expect(bins.size).to eq(2)

        ranges = bins.map(&:range)
        expect(ranges).to include(10...30)
        expect(ranges).to include(30...50)
      end

      it 'does not create bins if the interval is zero' do
        expect do
          described_class.generate_bins(custom_field, lower_bound: 10, upper_bound: 10)
        end.not_to change(described_class, :count)
      end
    end
  end
end
