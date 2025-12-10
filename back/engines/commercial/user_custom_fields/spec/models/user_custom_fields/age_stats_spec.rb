require 'rails_helper'

RSpec.describe UserCustomFields::AgeStats do
  describe '.calculate' do
    let!(:custom_field_birthyear) { create(:custom_field, resource_type: 'User', key: 'birthyear', input_type: 'number', title_multiloc: { en: 'Birthyear' }) }
    let(:current_year) { Date.current.year }

    context 'with array of custom field values' do
      let(:custom_field_values) do
        [
          { 'birthyear' => (current_year - 25).to_s }, # Age 25
          { 'birthyear' => (current_year - 35).to_s }, # Age 35
          { 'birthyear' => (current_year - 45).to_s }, # Age 45
          { 'birthyear' => (current_year - 65).to_s }, # Age 65
          { 'birthyear' => '' }, # Unknown age
          { 'birthyear' => 'invalid' }, # Unknown age
          { 'birthyear' => nil } # Unknown age
        ]
      end

      it 'calculates age statistics correctly' do
        result = described_class.calculate(custom_field_values)

        expect(result).to be_a(described_class)
        expect(result.user_count).to eq(7)
        expect(result.binned_counts).to be_an(Array)
        expect(result.unknown_age_count).to eq(3) # 3 unknown ages
        expect(result.bins).to be_an(Array)
      end

      it 'bins ages into correct ranges' do
        result = described_class.calculate(custom_field_values)

        # Should have some binned counts for the 4 known ages
        expect(result.binned_counts.sum).to eq(4) # 4 known birthyears
        expect(result.unknown_age_count).to eq(3) # 3 unknown birthyears
      end

      it 'uses default age bins when no reference distribution exists' do
        result = described_class.calculate(custom_field_values)

        # Should use AgeCounter's default bins
        expect(result.bins).to eq([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, nil])
        expect(result.binned_counts.length).to eq(10) # 10 bins
      end
    end

    context 'with reference distribution' do
      let!(:binned_distribution) do
        create(
          :binned_distribution,
          custom_field: custom_field_birthyear,
          bins: [18, 30, 50, 65, nil],
          counts: [100, 200, 150, 50]
        )
      end

      let(:custom_field_values) do
        [
          { 'birthyear' => (current_year - 25).to_s }, # Age 25 -> bin 18-30
          { 'birthyear' => (current_year - 35).to_s }, # Age 35 -> bin 30-50
          { 'birthyear' => (current_year - 55).to_s }, # Age 55 -> bin 50-65
          { 'birthyear' => (current_year - 75).to_s }  # Age 75 -> bin 65+
        ]
      end

      it 'uses reference distribution bins' do
        result = described_class.calculate(custom_field_values)

        expect(result.reference_distribution).to eq(binned_distribution)
        expect(result.bins).to eq([18, 30, 50, 65, nil])
        expect(result.population_counts).to eq([100, 200, 150, 50])
      end

      it 'distributes ages according to reference bins' do
        result = described_class.calculate(custom_field_values)

        # Each age should go into one bin
        expect(result.binned_counts.sum).to eq(4)
        expect(result.unknown_age_count).to eq(0)
      end
    end

    context 'with empty data' do
      let(:custom_field_values) { [] }

      it 'handles empty input' do
        result = described_class.calculate(custom_field_values)

        expect(result.user_count).to eq(0)
        expect(result.binned_counts.sum).to eq(0)
        expect(result.unknown_age_count).to eq(0)
      end
    end

    context 'with all unknown ages' do
      let(:custom_field_values) do
        [
          { 'birthyear' => '' },
          { 'birthyear' => nil },
          { 'birthyear' => 'invalid' }
        ]
      end

      it 'counts all as unknown' do
        result = described_class.calculate(custom_field_values)

        expect(result.user_count).to eq(3)
        expect(result.binned_counts.sum).to eq(0) # No valid ages binned
        expect(result.unknown_age_count).to eq(3) # All unknown
      end
    end

    context 'with edge case birthyears' do
      let(:custom_field_values) do
        [
          { 'birthyear' => current_year.to_s },        # Age 0 (newborn)
          { 'birthyear' => (current_year - 120).to_s } # Age 120 (very old)
        ]
      end

      it 'handles extreme ages' do
        result = described_class.calculate(custom_field_values)

        expect(result.user_count).to eq(2)
        expect(result.binned_counts.sum).to eq(2) # Both ages should be binned
        expect(result.unknown_age_count).to eq(0)
      end
    end
  end
end
