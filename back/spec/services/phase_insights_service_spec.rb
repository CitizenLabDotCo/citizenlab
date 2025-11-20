require 'rails_helper'

describe PhaseInsightsService do
  let(:service) { described_class.new }

  let(:phase) { create(:single_voting_phase) }
  let!(:permission1) { create(:permission, action: 'voting', permission_scope: phase) }

  describe 'demographics_data' do
    it 'only includes data related to specific user custom fields' do
      # Should be included
      create(:custom_field, resource_type: 'User', key: 'birthyear', input_type: 'number')
      create(:custom_field, resource_type: 'User', key: 'single_select', input_type: 'select')
      create(:custom_field, resource_type: 'User', key: 'multi_select', input_type: 'multiselect')
      create(:custom_field, resource_type: 'User', key: 'checkbox', input_type: 'checkbox')

      # Should be excluded
      create(:custom_field, resource_type: 'User', key: 'numeric_not_birthyear', input_type: 'number')
      create(:custom_field, resource_type: 'User', key: 'date', input_type: 'date')
      create(:custom_field, resource_type: 'User', key: 'text', input_type: 'text')
      create(:custom_field, resource_type: 'User', key: 'multiline_text', input_type: 'multiline_text')

      participation = create(:basket_participation)

      flattened_participations = [participation]
      participant_ids = flattened_participations.pluck(:user_id).uniq
      result = service.send(:demographics_data, phase, flattened_participations, participant_ids)

      expect(result.pluck(:key)).to match_array(%w[birthyear single_select multi_select checkbox])
    end

    it 'includes base custom_field attributes' do
      create(:custom_field, resource_type: 'User', key: 'birthyear', code: 'birthyear', input_type: 'number')
      create(:custom_field, resource_type: 'User', key: 'single_select', code: nil, input_type: 'select')
      create(:custom_field, resource_type: 'User', key: 'multi_select', code: nil, input_type: 'multiselect')
      create(:custom_field, resource_type: 'User', key: 'checkbox', code: nil, input_type: 'checkbox')

      participation = create(:basket_participation)

      flattened_participations = [participation]
      participant_ids = flattened_participations.pluck(:user_id).uniq
      result = service.send(:demographics_data, phase, flattened_participations, participant_ids)

      expect(result).to contain_exactly(
        hash_including(key: 'birthyear', code: 'birthyear', input_type: 'number'),
        hash_including(key: 'single_select', code: nil, input_type: 'select'),
        hash_including(key: 'multi_select', code: nil, input_type: 'multiselect'),
        hash_including(key: 'checkbox', code: nil, input_type: 'checkbox')
      )
    end

    context 'single-select field' do
      let!(:single_select_field) { create(:custom_field, resource_type: 'User', key: 'single_select', input_type: 'select', title_multiloc: { en: 'Select one' }) }
      let!(:option_a) { create(:custom_field_option, custom_field: single_select_field, key: 'a', title_multiloc: { en: 'Option A' }) }
      let!(:option_b) { create(:custom_field_option, custom_field: single_select_field, key: 'b', title_multiloc: { en: 'Option B' }) }

      let(:participation1) { create(:basket_participation, user_custom_field_values: { 'single_select' => 'a' }) }
      let(:participation2) { create(:basket_participation, user_custom_field_values: { 'single_select' => 'b' }) }

      let(:flattened_participations) { [participation1, participation2] }
      let(:participant_ids) { flattened_participations.pluck(:user_id).uniq }

      context 'without reference distribution' do
        it 'includes options and series' do
          result = service.send(:demographics_data, phase, flattened_participations, participant_ids)

          expect(result).to include(
            hash_including(
              key: 'single_select',
              r_score: nil, # No reference distribution set
              options: {
                'a' => { 'title_multiloc' => { 'en' => 'Option A' }, 'ordering' => 0 },
                'b' => { 'title_multiloc' => { 'en' => 'Option B' }, 'ordering' => 1 }
              },
              series: { 'a' => 1, 'b' => 1, '_blank' => 0 },
              reference_distribution: nil # No reference distribution set
            )
          )
        end
      end

      context 'with reference distribution' do
        before do
          create(
            :categorical_distribution,
            custom_field: single_select_field,
            population_counts: [480, 510] # Option A, Option B counts
          )
        end

        it 'includes options, series, reference distribution and r_score' do
          result = service.send(:demographics_data, phase, flattened_participations, participant_ids)

          expect(result).to include(
            hash_including(
              key: 'single_select',
              r_score: 0.9411764705882353,
              options: {
                'a' => { 'title_multiloc' => { 'en' => 'Option A' }, 'ordering' => 0 },
                'b' => { 'title_multiloc' => { 'en' => 'Option B' }, 'ordering' => 1 }
              },
              series: { 'a' => 1, 'b' => 1, '_blank' => 0 },
              reference_distribution: { 'a' => 480, 'b' => 510 }
            )
          )
        end
      end
    end

    context 'multiselect field' do
      it 'includes options and series for select and multiselect fields' do
        multi_select_field = create(:custom_field, resource_type: 'User', key: 'multi_select', code: nil, input_type: 'multiselect')
        create(:custom_field_option, custom_field: multi_select_field, key: 'x', title_multiloc: { en: 'Option X' })
        create(:custom_field_option, custom_field: multi_select_field, key: 'y', title_multiloc: { en: 'Option Y' })

        participation1 = create(:basket_participation, user_custom_field_values: { 'multi_select' => ['x'], 'checkbox' => true })
        participation2 = create(:basket_participation, user_custom_field_values: { 'multi_select' => %w[x y], 'checkbox' => false })

        flattened_participations = [participation1, participation2]
        participant_ids = flattened_participations.pluck(:user_id).uniq
        result = service.send(:demographics_data, phase, flattened_participations, participant_ids)

        expect(result).to include(
          hash_including(
            key: 'multi_select',
            r_score: nil, # No reference distribution can be set for multiselect fields
            options: {
              'x' => { 'title_multiloc' => { 'en' => 'Option X' }, 'ordering' => 0 },
              'y' => { 'title_multiloc' => { 'en' => 'Option Y' }, 'ordering' => 1 }
            },
            series: { 'x' => 2, 'y' => 1, '_blank' => 0 },
            reference_distribution: nil # No reference distribution can be set for multiselect fields
          )
        )
      end
    end
  end

  describe 'birthyear_demographics_data' do
    let!(:custom_field_birthyear) { create(:custom_field, resource_type: 'User', key: 'birthyear', input_type: 'number', title_multiloc: { en: 'Birthyear' }) }

    let(:participation1) { create(:basket_participation, user_custom_field_values: { 'birthyear' => Date.current.year - 25 }) }
    let(:participation2) { create(:basket_participation, user_custom_field_values: { 'birthyear' => Date.current.year - 25 }) }
    let(:participation3) { create(:basket_participation, user_custom_field_values: { 'birthyear' => Date.current.year - 35 }) }
    let(:participation4) { create(:basket_participation, user_custom_field_values: {}) }

    let(:participations) { { voting: [participation1, participation2, participation3, participation4] } }
    let(:participant_ids) { participations[:voting].pluck(:user_id).uniq }

    it 'calculates demographics data correctly when no reference distribution' do
      participant_custom_field_values = service.send(:participants_custom_field_values, participations.values.flatten, participant_ids)
      result = service.send(:birthyear_demographics_data, participant_custom_field_values)

      expect(result).to match({
        r_score: nil,
        series: {
          '0-9' => 0,
          '10-19' => 0,
          '20-29' => 2,
          '30-39' => 1,
          '40-49' => 0,
          '50-59' => 0,
          '60-69' => 0,
          '70-79' => 0,
          '80-89' => 0,
          '90+' => 0,
          '_blank' => 1
        },
        reference_distribution: nil
      })
    end

    it 'calculates demographics data correctly when reference distribution is present' do
      create(
        :binned_distribution,
        custom_field: custom_field_birthyear,
        bins: [18, 25, 35, 45, 55, 65, nil], # Age ranges: <18, 18-25, 25-35, 35-45, 45-65, >65
        counts: [50, 200, 400, 300, 50, 700] # Population in each bin
      )

      participant_custom_field_values = service.send(:participants_custom_field_values, participations.values.flatten, participant_ids)
      result = service.send(:birthyear_demographics_data, participant_custom_field_values)

      expect(result).to match({
        r_score: 0.0,
        series: { '18-24' => 0, '25-34' => 2, '35-44' => 1, '45-54' => 0, '55-64' => 0, '65+' => 0, '_blank' => 1 },
        reference_distribution: { '18-24' => 50, '25-34' => 200, '35-44' => 400, '45-54' => 300, '55-64' => 50, '65+' => 700 }
      })
    end
  end

  describe 'select_or_checkbox_field_demographics_data' do
    let(:participations) { { voting: [participation1, participation2, participation3, participation4] } }
    let(:participant_ids) { participations[:voting].pluck(:user_id).uniq }

    context 'with single-select field' do
      let!(:custom_field_single_select) { create(:custom_field, resource_type: 'User', key: 'single_select', input_type: 'select', title_multiloc: { en: 'Select one' }) }
      let!(:option_a) { create(:custom_field_option, custom_field: custom_field_single_select, key: 'a', title_multiloc: { en: 'Option A' }) }
      let!(:option_b) { create(:custom_field_option, custom_field: custom_field_single_select, key: 'b', title_multiloc: { en: 'Option B' }) }

      let(:participation1) { create(:basket_participation, user_custom_field_values: { 'single_select' => 'a' }) }
      let(:participation2) { create(:basket_participation, user_custom_field_values: { 'single_select' => 'a' }) }
      let(:participation3) { create(:basket_participation, user_custom_field_values: { 'single_select' => 'b' }) }
      let(:participation4) { create(:basket_participation, user_custom_field_values: {}) }

      it 'calculates demographics data correctly when no reference distribution' do
        participant_custom_field_values = service.send(:participants_custom_field_values, participations.values.flatten, participant_ids)
        result = service.send(:select_or_checkbox_field_demographics_data, participant_custom_field_values, custom_field_single_select)

        expect(result).to match({
          r_score: nil,
          series: { 'a' => 2, 'b' => 1, '_blank' => 1 },
          reference_distribution: nil,
          options: {
            'a' => { 'title_multiloc' => { 'en' => 'Option A' }, 'ordering' => 0 },
            'b' => { 'title_multiloc' => { 'en' => 'Option B' }, 'ordering' => 1 }
          }
        })
      end

      it 'calculates demographics data correctly when reference distribution is present' do
        create(
          :categorical_distribution,
          custom_field: custom_field_single_select,
          population_counts: [480, 510]
        )

        participant_custom_field_values = service.send(:participants_custom_field_values, participations.values.flatten, participant_ids)
        result = service.send(:select_or_checkbox_field_demographics_data, participant_custom_field_values, custom_field_single_select)

        expect(result).to match({
          r_score: 0.47058823529411764,
          series: { 'a' => 2, 'b' => 1, '_blank' => 1 },
          reference_distribution: { 'a' => 480, 'b' => 510 },
          options: {
            'a' => { 'title_multiloc' => { 'en' => 'Option A' }, 'ordering' => 0 },
            'b' => { 'title_multiloc' => { 'en' => 'Option B' }, 'ordering' => 1 }
          }
        })
      end
    end

    context 'with multi-select field' do
      let!(:custom_field_multi_select) { create(:custom_field, resource_type: 'User', key: 'multi_select', input_type: 'multiselect', title_multiloc: { en: 'Select one' }) }
      let!(:option_a) { create(:custom_field_option, custom_field: custom_field_multi_select, key: 'a', title_multiloc: { en: 'Option A' }) }
      let!(:option_b) { create(:custom_field_option, custom_field: custom_field_multi_select, key: 'b', title_multiloc: { en: 'Option B' }) }

      let(:participation1) { create(:basket_participation, user_custom_field_values: { 'multi_select' => ['a'] }) }
      let(:participation2) { create(:basket_participation, user_custom_field_values: { 'multi_select' => %w[a b] }) }
      let(:participation3) { create(:basket_participation, user_custom_field_values: { 'multi_select' => ['b'] }) }
      let(:participation4) { create(:basket_participation, user_custom_field_values: {}) }

      # We currently do not support the creation of reference distributions for multiselect fields in the front-end,
      # nor would our existing back-end implementation make sense for multiselect fields.
      it 'calculates demographics data correctly' do
        participant_custom_field_values = service.send(:participants_custom_field_values, participations.values.flatten, participant_ids)
        result = service.send(:select_or_checkbox_field_demographics_data, participant_custom_field_values, custom_field_multi_select)

        expect(result).to match({
          r_score: nil,
          series: { 'a' => 2, 'b' => 2, '_blank' => 1 },
          reference_distribution: nil,
          options: {
            'a' => { 'title_multiloc' => { 'en' => 'Option A' }, 'ordering' => 0 },
            'b' => { 'title_multiloc' => { 'en' => 'Option B' }, 'ordering' => 1 }
          }
        })
      end
    end

    context 'with checkbox field' do
      let!(:custom_field_checkbox) { create(:custom_field, resource_type: 'User', key: 'checkbox', input_type: 'checkbox', title_multiloc: { en: 'Check if you agree' }) }

      let(:participation1) { create(:basket_participation, user_custom_field_values: { 'checkbox' => false }) }
      let(:participation2) { create(:basket_participation, user_custom_field_values: { 'checkbox' => false }) }
      let(:participation3) { create(:basket_participation, user_custom_field_values: {}) }
      let(:participation4) { create(:basket_participation, user_custom_field_values: {}) }

      # We currently do not support the creation of reference distributions for checkbox fields in the front-end,
      # and the back-end currently only supports categorical distributions for select fields.
      it 'calculates demographics data correctly' do
        participant_custom_field_values = service.send(:participants_custom_field_values, participations.values.flatten, participant_ids)
        result = service.send(:select_or_checkbox_field_demographics_data, participant_custom_field_values, custom_field_checkbox)

        expect(result).to match({
          r_score: nil,
          series: { true => 0, false => 2, '_blank' => 2 },
          reference_distribution: nil,
          options: nil
        })
      end
    end
  end
end
