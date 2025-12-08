# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CustomFieldBins::ValueBin do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:value_bin)).to be_valid
    end
  end

  describe '#in_bin?' do
    context 'with a single value' do
      let(:bin) { build(:value_bin, values: [1]) }

      it 'returns true for the value in the bin' do
        expect(bin.in_bin?(1)).to be true
      end

      it 'returns false for a value not in the bin' do
        expect(bin.in_bin?(2)).to be false
      end
    end

    context 'with multiple values' do
      let(:bin) { build(:value_bin, values: [1, 2]) }

      it 'returns true for values in the bin' do
        expect(bin.in_bin?(1)).to be true
        expect(bin.in_bin?(2)).to be true
      end

      it 'returns false for values not in the bin' do
        expect(bin.in_bin?(3)).to be false
        expect(bin.in_bin?(nil)).to be false
      end
    end
  end

  describe '#filter_by_bin' do
    let(:scope) { Idea.all }

    context 'with a custom field of type checkbox' do
      let(:bin) { create(:value_bin, custom_field: create(:custom_field_checkbox), values: [true]) }

      it 'filters the scope by the bin values' do
        idea1 = create(:idea, custom_field_values: { bin.custom_field.key => true })
        idea2 = create(:idea, custom_field_values: { bin.custom_field.key => false })

        filtered_scope = bin.filter_by_bin(scope)

        expect(filtered_scope).to include(idea1)
        expect(filtered_scope).not_to include(idea2)
      end
    end

    context 'with a custom field of type linear_scale' do
      let(:bin) { create(:value_bin, custom_field: create(:custom_field_linear_scale), values: [1]) }

      it 'filters the scope by the bin values' do
        idea1 = create(:idea, custom_field_values: { bin.custom_field.key => 1 })
        idea2 = create(:idea, custom_field_values: { bin.custom_field.key => 2 })

        filtered_scope = bin.filter_by_bin(scope)

        expect(filtered_scope).to include(idea1)
        expect(filtered_scope).not_to include(idea2)
      end
    end
  end

  describe '#generate_bins' do
    let(:custom_field) { create(:custom_field_linear_scale) }

    context 'when bins already exist' do
      let!(:custom_field) { create(:custom_field_linear_scale) }
      let!(:bin) { create(:value_bin, custom_field:) }

      it 'does not create new bins' do
        expect do
          described_class.generate_bins(custom_field)
        end.not_to change(described_class, :count)
      end
    end

    context 'when bins do not exist' do
      context 'for checkbox input type' do
        let(:custom_field) { create(:custom_field_checkbox) }

        it 'creates true and false bins' do
          expect do
            described_class.generate_bins(custom_field)
          end.to change(described_class, :count).by(2)

          expect(described_class.all.pluck(:values)).to contain_exactly([true], [false])
        end
      end

      context 'for linear_scale input type' do
        let(:custom_field) { create(:custom_field_linear_scale, maximum: 3) }

        it 'creates bins for each value in the range' do
          expect do
            described_class.generate_bins(custom_field)
          end.to change(described_class, :count).by(3)

          expect(described_class.all.pluck(:values)).to contain_exactly([1], [2], [3])
        end
      end
    end
  end
end
