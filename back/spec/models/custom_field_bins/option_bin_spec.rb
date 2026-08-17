# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CustomFieldBins::OptionBin do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:option_bin)).to be_valid
    end
  end

  describe '#in_bin?' do
    context 'with a select field' do
      let(:option) { create(:custom_field_option, key: 'option1') }
      let(:bin) { build(:option_bin, custom_field_option: option, custom_field: option.custom_field) }

      it 'returns true for the option key' do
        expect(bin.in_bin?('option1')).to be true
      end

      it 'returns false for a different option key' do
        expect(bin.in_bin?('option2')).to be false
      end

      it 'returns false for nil' do
        expect(bin.in_bin?(nil)).to be false
      end
    end

    context 'with a multi-select field' do
      let(:option) { create(:custom_field_option, key: 'option1') }
      let(:bin) { build(:option_bin, custom_field_option: option) }

      it 'returns true when the option key is in the array' do
        expect(bin.in_bin?(%w[option1 option2])).to be true
      end

      it 'returns false when the option key is not in the array' do
        expect(bin.in_bin?(%w[option2 option3])).to be false
      end
    end

    context 'with the domicile field' do
      let(:field) { create(:custom_field_domicile) }
      let(:area) { create(:area) }
      let(:bin) { build(:option_bin, custom_field: field, custom_field_option: area.custom_field_option) }

      it 'returns true when the area ID is in the array' do
        expect(bin.in_bin?([area.id])).to be true
      end

      it 'returns false when the area ID is not in the array' do
        expect(bin.in_bin?([create(:area).id])).to be false
      end
    end
  end

  describe '#generate_bins' do
    context 'when bins already exist' do
      let!(:custom_field) { create(:custom_field_select) }
      let!(:option) { create(:custom_field_option, custom_field:) }
      let!(:bin) { create(:option_bin, custom_field:, custom_field_option: option) }

      it 'does not create new bins' do
        expect do
          described_class.generate_bins(custom_field)
        end.not_to change(described_class, :count)
      end
    end

    context 'when bins do not exist' do
      context 'for select input type' do
        let!(:custom_field) { create(:custom_field_select) }
        let!(:option1) { create(:custom_field_option, custom_field:, key: 'option1') }
        let!(:option2) { create(:custom_field_option, custom_field:, key: 'option2') }

        it 'creates bins for each option' do
          expect do
            described_class.generate_bins(custom_field)
          end.to change(described_class, :count).by(2)

          bins = described_class.all
          expect(bins.pluck(:custom_field_option_id)).to contain_exactly(option1.id, option2.id)
        end
      end

      context 'for multi_select input type' do
        let!(:custom_field) { create(:custom_field_multiselect) }
        let!(:option1) { create(:custom_field_option, custom_field:, key: 'option1') }
        let!(:option2) { create(:custom_field_option, custom_field:, key: 'option2') }
        let!(:option3) { create(:custom_field_option, custom_field:, key: 'option3') }

        it 'creates bins for each option' do
          expect do
            described_class.generate_bins(custom_field)
          end.to change(described_class, :count).by(3)

          bins = described_class.all
          expect(bins.pluck(:custom_field_option_id)).to contain_exactly(option1.id, option2.id, option3.id)
        end
      end
    end
  end
end
