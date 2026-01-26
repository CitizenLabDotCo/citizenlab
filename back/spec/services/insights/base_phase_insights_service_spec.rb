require 'rails_helper'

RSpec.describe Insights::BasePhaseInsightsService do
  let(:service) { described_class.new(phase) }

  let(:phase) { create(:single_voting_phase, start_at: 17.days.ago, end_at: 2.days.ago) }
  let!(:permission1) { create(:permission, action: 'voting', permission_scope: phase) }

  describe '#participant_id' do
    it 'returns the user_id when present' do
      expect(service.send(:participant_id, 'item_id', 'user_id', 'user_hash')).to eq('user_id')
    end

    it 'returns user_hash when user_id is not present' do
      expect(service.send(:participant_id, 'item_id', nil, 'user_hash')).to eq('user_hash')
    end

    it 'returns item ID when neither user_id nor user_hash is present' do
      expect(service.send(:participant_id, 'item_id', nil, nil)).to eq('item_id')
    end
  end

  describe '#base_metrics' do
    let(:user1) { create(:user) }

    let(:participation1) { create(:basket_participation, acted_at: 20.days.ago, user: user1) } # before phase start
    let(:participation2) { create(:basket_participation, acted_at: 10.days.ago, user: user1) } # during phase (in week before last)
    let(:participation3) { create(:basket_participation, acted_at: 5.days.ago, user: user1) } # during phase & in last 7 days
    let(:participation4) { create(:basket_participation, acted_at: 1.day.ago, user: user1) } # after phase end

    let(:user2) { create(:user) }
    let(:participation5) { create(:basket_participation, acted_at: 10.days.ago, user: user2) } # during phase (in week before last)
    let(:participation6) { create(:basket_participation, acted_at: 4.days.ago, user: user2) } # during phase & in last 7 days

    let(:participation7) { create(:basket_participation, acted_at: 4.days.ago, user: nil, participant_id: SecureRandom.uuid) } # Anonymous or no user, in last 7 days & before phase end

    let(:participations) { { voting: [participation1, participation2, participation3, participation4, participation5, participation6, participation7] } }
    let(:participant_ids) { participations[:voting].pluck(:participant_id).uniq }

    let(:visits) do
      [
        { acted_at: 10.days.ago, visitor_id: user1.id.to_s }, # during phase (in week before last)
        { acted_at: 5.days.ago, visitor_id: user1.id.to_s },  # during phase & in last 7 days
        { acted_at: 10.days.ago, visitor_id: user2.id.to_s }, # during phase (in week before last)
        { acted_at: 4.days.ago, visitor_id: user2.id.to_s },  # during phase & in last 7 days
        { acted_at: 4.days.ago, visitor_id: 'anonymous_1' },  # during phase & in last 7 days
        { acted_at: 10.days.ago, visitor_id: SecureRandom.uuid } # # during phase (in week before last)
      ]
    end

    it 'calculates base metrics correctly' do
      result = service.send(:base_metrics, participations, participant_ids, visits)

      expect(result).to eq(
        {
          visitors: 4,
          visitors_7_day_percent_change: 0.0, # From 3 (7 to 14 days ago) to 3 (last 7-day period) unique visitors = 0% change
          participants: 3,
          participants_7_day_percent_change: 50.0, # From 2 (7 to 14 days ago) to 3 (last 7-day period) unique participants = 50% increase
          participation_rate_as_percent: 75.0,
          participation_rate_7_day_percent_change: 49.9 # participation_rate_last_7_days: 1.0, participation_rate_previous_7_days: 0.667 = (((1 - 0.667).to_f / 0.667) * 100.0).round(1)
        }
      )
    end
  end

  describe '#demographics_data' do
    it 'only includes data related to fields used in phase-level action permissions' do
      permission1.update!(global_custom_fields: false)

      field1 = create(:custom_field, resource_type: 'User', key: 'single_select1', code: nil, input_type: 'select', title_multiloc: { en: 'Single Select 1' })
      create(:custom_field, resource_type: 'User', key: 'single_select2', code: nil, input_type: 'select', title_multiloc: { en: 'Single Select 2' })

      create(:permissions_custom_field, permission: permission1, custom_field: field1)

      permission2 = create(:permission, action: 'commenting_idea', permission_scope: phase)
      permission2.update!(global_custom_fields: false)

      field3 = create(:custom_field, resource_type: 'User', key: 'single_select3', code: nil, input_type: 'select', title_multiloc: { en: 'Single Select 3' })
      create(:permissions_custom_field, permission: permission2, custom_field: field3)

      participation = create(:basket_participation)

      flattened_participations = [participation]
      participant_ids = flattened_participations.pluck(:participant_id).uniq
      result = service.send(:demographics_data, flattened_participations, participant_ids)

      expect(result.pluck(:key)).to match_array(%w[single_select1 single_select3])
    end

    it 'only includes data related to specific types of user custom fields' do
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
      participant_ids = flattened_participations.pluck(:participant_id).uniq
      result = service.send(:demographics_data, flattened_participations, participant_ids)

      expect(result.pluck(:key)).to match_array(%w[birthyear single_select multi_select checkbox])
    end

    it 'includes base custom_field attributes' do
      birthyear_field = create(:custom_field, resource_type: 'User', key: 'birthyear', code: 'birthyear', input_type: 'number', title_multiloc: { en: 'Birthyear' })
      single_select_field = create(:custom_field, resource_type: 'User', key: 'single_select', code: nil, input_type: 'select', title_multiloc: { en: 'Single Select' })
      multi_select_field = create(:custom_field, resource_type: 'User', key: 'multi_select', code: nil, input_type: 'multiselect', title_multiloc: { en: 'Multi Select' })
      checkbox_field = create(:custom_field, resource_type: 'User', key: 'checkbox', code: nil, input_type: 'checkbox', title_multiloc: { en: 'Checkbox' })

      participation = create(:basket_participation)

      flattened_participations = [participation]
      participant_ids = flattened_participations.pluck(:participant_id).uniq
      result = service.send(:demographics_data, flattened_participations, participant_ids)

      expect(result).to contain_exactly(
        hash_including(id: birthyear_field.id, key: 'birthyear', code: 'birthyear', input_type: 'number', title_multiloc: { 'en' => 'Birthyear' }),
        hash_including(id: single_select_field.id, key: 'single_select', code: nil, input_type: 'select', title_multiloc: { 'en' => 'Single Select' }),
        hash_including(id: multi_select_field.id, key: 'multi_select', code: nil, input_type: 'multiselect', title_multiloc: { 'en' => 'Multi Select' }),
        hash_including(id: checkbox_field.id, key: 'checkbox', code: nil, input_type: 'checkbox', title_multiloc: { 'en' => 'Checkbox' })
      )
    end

    it 'includes base custom_field attributes even when no participations' do
      birthyear_field = create(:custom_field, resource_type: 'User', key: 'birthyear', code: 'birthyear', input_type: 'number', title_multiloc: { en: 'Birthyear' })
      single_select_field = create(:custom_field, resource_type: 'User', key: 'single_select', code: nil, input_type: 'select', title_multiloc: { en: 'Single Select' })
      multi_select_field = create(:custom_field, resource_type: 'User', key: 'multi_select', code: nil, input_type: 'multiselect', title_multiloc: { en: 'Multi Select' })
      checkbox_field = create(:custom_field, resource_type: 'User', key: 'checkbox', code: nil, input_type: 'checkbox', title_multiloc: { en: 'Checkbox' })

      flattened_participations = []
      participant_ids = []
      result = service.send(:demographics_data, flattened_participations, participant_ids)

      expect(result).to contain_exactly(
        hash_including(id: birthyear_field.id, key: 'birthyear', code: 'birthyear', input_type: 'number', title_multiloc: { 'en' => 'Birthyear' }),
        hash_including(id: single_select_field.id, key: 'single_select', code: nil, input_type: 'select', title_multiloc: { 'en' => 'Single Select' }),
        hash_including(id: multi_select_field.id, key: 'multi_select', code: nil, input_type: 'multiselect', title_multiloc: { 'en' => 'Multi Select' }),
        hash_including(id: checkbox_field.id, key: 'checkbox', code: nil, input_type: 'checkbox', title_multiloc: { 'en' => 'Checkbox' })
      )
    end

    context 'single-select field' do
      let!(:single_select_field) { create(:custom_field, resource_type: 'User', key: 'single_select', input_type: 'select', title_multiloc: { en: 'Select one' }) }
      let!(:option_a) { create(:custom_field_option, custom_field: single_select_field, key: 'a', title_multiloc: { en: 'Option A' }) }
      let!(:option_b) { create(:custom_field_option, custom_field: single_select_field, key: 'b', title_multiloc: { en: 'Option B' }) }

      let(:participation1) { create(:basket_participation, user_custom_field_values: { 'single_select' => 'a' }) }
      let(:participation2) { create(:basket_participation, user_custom_field_values: { 'single_select' => 'b' }) }

      let(:flattened_participations) { [participation1, participation2] }
      let(:participant_ids) { flattened_participations.pluck(:participant_id).uniq }

      context 'without reference distribution' do
        it 'includes options and series' do
          result = service.send(:demographics_data, flattened_participations, participant_ids)

          expect(result).to include(
            hash_including(
              key: 'single_select',
              options: {
                'a' => { 'title_multiloc' => { 'en' => 'Option A' }, 'ordering' => 0 },
                'b' => { 'title_multiloc' => { 'en' => 'Option B' }, 'ordering' => 1 }
              },
              series: { 'a' => 1, 'b' => 1, '_blank' => 0 },
              reference_distribution: nil # No reference distribution set
            )
          )
        end

        it 'performs as expected when no participations' do
          result = service.send(:demographics_data, [], [])

          expect(result).to include(
            hash_including(
              key: 'single_select',
              options: {
                'a' => { 'title_multiloc' => { 'en' => 'Option A' }, 'ordering' => 0 },
                'b' => { 'title_multiloc' => { 'en' => 'Option B' }, 'ordering' => 1 }
              },
              series: { 'a' => 0, 'b' => 0, '_blank' => 0 },
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
          result = service.send(:demographics_data, flattened_participations, participant_ids)

          expect(result).to include(
            hash_including(
              key: 'single_select',
              options: {
                'a' => { 'title_multiloc' => { 'en' => 'Option A' }, 'ordering' => 0 },
                'b' => { 'title_multiloc' => { 'en' => 'Option B' }, 'ordering' => 1 }
              },
              series: { 'a' => 1, 'b' => 1, '_blank' => 0 },
              reference_distribution: { 'a' => 480, 'b' => 510 }
            )
          )
        end

        it 'performs as expected when no participations' do
          result = service.send(:demographics_data, [], [])

          expect(result).to include(
            hash_including(
              key: 'single_select',
              options: {
                'a' => { 'title_multiloc' => { 'en' => 'Option A' }, 'ordering' => 0 },
                'b' => { 'title_multiloc' => { 'en' => 'Option B' }, 'ordering' => 1 }
              },
              series: { 'a' => 0, 'b' => 0, '_blank' => 0 },
              reference_distribution: { 'a' => 480, 'b' => 510 }
            )
          )
        end
      end
    end

    context 'multiselect field' do
      let!(:multi_select_field) { create(:custom_field, resource_type: 'User', key: 'multi_select', input_type: 'multiselect', title_multiloc: { en: 'Select one' }) }
      let!(:option_x) { create(:custom_field_option, custom_field: multi_select_field, key: 'x', title_multiloc: { en: 'Option X' }) }
      let!(:option_y) { create(:custom_field_option, custom_field: multi_select_field, key: 'y', title_multiloc: { en: 'Option Y' }) }

      let(:participation1) { create(:basket_participation, user_custom_field_values: { 'multi_select' => ['x'] }) }
      let(:participation2) { create(:basket_participation, user_custom_field_values: { 'multi_select' => %w[x y] }) }
      let(:flattened_participations) { [participation1, participation2] }
      let(:participant_ids) { flattened_participations.pluck(:participant_id).uniq }

      it 'includes options and series for select and multiselect fields' do
        result = service.send(:demographics_data, flattened_participations, participant_ids)

        expect(result).to include(
          hash_including(
            key: 'multi_select',
            options: {
              'x' => { 'title_multiloc' => { 'en' => 'Option X' }, 'ordering' => 0 },
              'y' => { 'title_multiloc' => { 'en' => 'Option Y' }, 'ordering' => 1 }
            },
            series: { 'x' => 2, 'y' => 1, '_blank' => 0 },
            reference_distribution: nil # No reference distribution can be set for multiselect fields
          )
        )
      end

      it 'performs as expected when no participations' do
        result = service.send(:demographics_data, [], [])

        expect(result).to include(
          hash_including(
            key: 'multi_select',
            options: {
              'x' => { 'title_multiloc' => { 'en' => 'Option X' }, 'ordering' => 0 },
              'y' => { 'title_multiloc' => { 'en' => 'Option Y' }, 'ordering' => 1 }
            },
            series: { 'x' => 0, 'y' => 0, '_blank' => 0 },
            reference_distribution: nil # No reference distribution can be set for multiselect fields
          )
        )
      end
    end

    context 'checkbox field' do
      let!(:checkbox_field) { create(:custom_field, resource_type: 'User', key: 'checkbox', input_type: 'checkbox', title_multiloc: { en: 'Check if you agree' }) }

      let(:participation1) { create(:basket_participation, user_custom_field_values: { 'checkbox' => true }) }
      let(:participation2) { create(:basket_participation, user_custom_field_values: { 'checkbox' => false }) }
      let(:flattened_participations) { [participation1, participation2] }
      let(:participant_ids) { flattened_participations.pluck(:participant_id).uniq }

      it 'includes series' do
        result = service.send(:demographics_data, flattened_participations, participant_ids)

        expect(result).to include(
          hash_including(
            key: 'checkbox',
            series: { true => 1, false => 1, '_blank' => 0 },
            reference_distribution: nil # No reference distribution can be set for checkbox fields
          )
        )
      end

      it 'performs as expected when no participations' do
        result = service.send(:demographics_data, [], [])

        expect(result).to include(
          hash_including(
            key: 'checkbox',
            series: { true => 0, false => 0, '_blank' => 0 },
            reference_distribution: nil # No reference distribution can be set for checkbox fields
          )
        )
      end
    end
  end

  describe '#birthyear_demographics_data' do
    let!(:custom_field_birthyear) { create(:custom_field, resource_type: 'User', key: 'birthyear', input_type: 'number', title_multiloc: { en: 'Birthyear' }) }

    let(:participation1) { create(:basket_participation, user_custom_field_values: { 'birthyear' => Date.current.year - 25 }) }
    let(:participation2) { create(:basket_participation, user_custom_field_values: { 'birthyear' => Date.current.year - 25 }) }
    let(:participation3) { create(:basket_participation, user_custom_field_values: { 'birthyear' => Date.current.year - 35 }) }
    let(:participation4) { create(:basket_participation, user_custom_field_values: {}) }

    let(:participations) { { voting: [participation1, participation2, participation3, participation4] } }
    let(:participant_ids) { participations[:voting].pluck(:participant_id).uniq }

    # Ensure consistent date as stats will be different in first six months of year vs last six months
    before { travel_to(Date.parse('2025-10-01')) }

    context 'without reference distribution' do
      it 'calculates demographics data correctly' do
        participant_custom_field_values = service.send(:participants_custom_field_values, participations.values.flatten, participant_ids)
        result = service.send(:birthyear_demographics_data, participant_custom_field_values)

        expect(result).to match({
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

      it 'performs as expected when no participations' do
        participant_custom_field_values = service.send(:participants_custom_field_values, [], [])
        result = service.send(:birthyear_demographics_data, participant_custom_field_values)

        expect(result).to match({
          series: {
            '0-9' => 0,
            '10-19' => 0,
            '20-29' => 0,
            '30-39' => 0,
            '40-49' => 0,
            '50-59' => 0,
            '60-69' => 0,
            '70-79' => 0,
            '80-89' => 0,
            '90+' => 0,
            '_blank' => 0
          },
          reference_distribution: nil
        })
      end
    end

    context 'with reference distribution' do
      before do
        create(
          :binned_distribution,
          custom_field: custom_field_birthyear,
          bins: [18, 25, 35, 45, 55, 65, nil], # Age ranges: <18, 18-25, 25-35, 35-45, 45-65, >65
          counts: [50, 200, 400, 300, 50, 700] # Population in each bin
        )
      end

      it 'calculates demographics data correctly' do
        participant_custom_field_values = service.send(:participants_custom_field_values, participations.values.flatten, participant_ids)
        result = service.send(:birthyear_demographics_data, participant_custom_field_values)

        expect(result).to match({
          series: { '18-24' => 0, '25-34' => 2, '35-44' => 1, '45-54' => 0, '55-64' => 0, '65+' => 0, '_blank' => 1 },
          reference_distribution: { '18-24' => 50, '25-34' => 200, '35-44' => 400, '45-54' => 300, '55-64' => 50, '65+' => 700 }
        })
      end

      it 'performs as expected when no participations' do
        participant_custom_field_values = service.send(:participants_custom_field_values, [], [])
        result = service.send(:birthyear_demographics_data, participant_custom_field_values)

        expect(result).to match({
          series: { '18-24' => 0, '25-34' => 0, '35-44' => 0, '45-54' => 0, '55-64' => 0, '65+' => 0, '_blank' => 0 },
          reference_distribution: { '18-24' => 50, '25-34' => 200, '35-44' => 400, '45-54' => 300, '55-64' => 50, '65+' => 700 }
        })
      end
    end
  end

  describe '#select_or_checkbox_field_demographics_data' do
    let(:participations) { { voting: [participation1, participation2, participation3, participation4] } }
    let(:participant_ids) { participations[:voting].pluck(:participant_id).uniq }

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
          series: { true => 0, false => 2, '_blank' => 2 },
          reference_distribution: nil,
          options: nil
        })
      end
    end
  end

  # Documenting similar behaviour to that in Queries::Analytics::Participation
  # and Queries::Visitors (as on 02-12-2025).
  # i.e. timeseries data simply excludes any date groups with zero counts, and
  # the FE is responsible for filling in gaps if needed.
  describe '#participants_and_visitors_chart_data' do
    it 'handles empty participations and visits data' do
      flattened_participations = []
      visits = []
      result = service.send(:participants_and_visitors_chart_data, flattened_participations, visits)

      expect(result).to eq({ resolution: 'day', timeseries: [] })
    end

    it 'handles empty participations with non-empty visits data' do
      flattened_participations = []
      visits = [
        { acted_at: 10.days.ago.beginning_of_day, visitor_id: 'visitor_1' },
        { acted_at: 9.days.ago.beginning_of_day, visitor_id: 'visitor_2' },
        { acted_at: 9.days.ago.beginning_of_day, visitor_id: 'visitor_3' }
      ]

      result = service.send(:participants_and_visitors_chart_data, flattened_participations, visits)

      expect(result).to eq({
        resolution: 'day',
        timeseries: [
          { date_group: 10.days.ago.beginning_of_day.to_date, visitors: 1, participants: 0 },
          { date_group: 9.days.ago.beginning_of_day.to_date, visitors: 2, participants: 0 }
        ]
      })
    end

    it 'handles non-empty participations with empty visits data' do
      user = create(:user)
      participation1 = create(:basket_participation, acted_at: 8.days.ago, user: user)
      participation2 = create(:basket_participation, acted_at: 7.days.ago, user: user)

      flattened_participations = [participation1, participation2]
      visits = []
      result = service.send(:participants_and_visitors_chart_data, flattened_participations, visits)

      expect(result).to eq({
        resolution: 'day',
        timeseries: [
          { date_group: 8.days.ago.beginning_of_day.to_date, visitors: 0, participants: 1 },
          { date_group: 7.days.ago.beginning_of_day.to_date, visitors: 0, participants: 1 }
        ]
      })
    end
  end

  describe '#chart_resolution' do
    it 'returns "day" for phases shorter than 4 weeks' do
      phase = create(:single_voting_phase, start_at: 20.days.ago, end_at: 1.day.ago)
      service = described_class.new(phase)

      expect(service.send(:chart_resolution)).to eq('day')
    end

    it 'returns "week" for phases between 4 weeks and 6 months' do
      phase = create(:single_voting_phase, start_at: 5.months.ago, end_at: 1.day.ago)
      service = described_class.new(phase)

      expect(service.send(:chart_resolution)).to eq('week')
    end

    it 'returns "month" for phases between 6 months and 24 months' do
      phase = create(:single_voting_phase, start_at: 12.months.ago, end_at: 1.day.ago)
      service = described_class.new(phase)

      expect(service.send(:chart_resolution)).to eq('month')
    end

    it 'uses current time for ongoing phases without end_at' do
      phase = create(:single_voting_phase, start_at: 10.days.ago, end_at: nil)
      service = described_class.new(phase)

      expect(service.send(:chart_resolution)).to eq('day')
    end
  end

  describe '#date_truncate' do
    it 'returns the same date for day resolution' do
      datetime = Time.new(2024, 6, 15, 14, 30, 0)
      expect(service.send(:date_truncate, datetime, 'day')).to eq(Date.new(2024, 6, 15))
    end

    it 'returns the beginning of week for week resolution' do
      datetime = Time.new(2024, 6, 15, 14, 30, 0) # Saturday
      expect(service.send(:date_truncate, datetime, 'week')).to eq(Date.new(2024, 6, 10)) # Monday
    end

    it 'returns the first day of month for month resolution' do
      datetime = Time.new(2024, 6, 15, 14, 30, 0)
      expect(service.send(:date_truncate, datetime, 'month')).to eq(Date.new(2024, 6, 1))
    end
  end

  describe '#phase_has_run_more_than_14_days?' do
    it 'returns false when phase duration is less than 14 days' do
      phase = create(:single_voting_phase, start_at: 15.days.ago, end_at: 2.days.ago)
      service = described_class.new(phase)
      expect(service.send(:phase_has_run_more_than_14_days?)).to be false
    end

    it 'returns false when phase duration is more than 14 days but elapsed time is less than 14 days' do
      phase = create(:single_voting_phase, start_at: 13.days.ago, end_at: 2.days.from_now)
      service = described_class.new(phase)
      expect(service.send(:phase_has_run_more_than_14_days?)).to be false
    end

    it 'returns true when phase duration is more than 14 days and elapsed time is at least 14 days' do
      phase = create(:single_voting_phase, start_at: 20.days.ago, end_at: 1.day.ago)
      service = described_class.new(phase)
      expect(service.send(:phase_has_run_more_than_14_days?)).to be true
    end

    it 'returns false when phase is long enough but started less than 14 days ago' do
      phase = create(:single_voting_phase, start_at: 10.days.ago, end_at: 30.days.from_now)
      service = described_class.new(phase)
      expect(service.send(:phase_has_run_more_than_14_days?)).to be false
    end

    it 'returns true for ongoing phases without end_at when started more than 14 days ago' do
      phase = create(:single_voting_phase, start_at: 20.days.ago, end_at: nil)
      service = described_class.new(phase)
      expect(service.send(:phase_has_run_more_than_14_days?)).to be true
    end

    it 'returns false for ongoing phases without end_at when started less than 14 days ago' do
      phase = create(:single_voting_phase, start_at: 10.days.ago, end_at: nil)
      service = described_class.new(phase)
      expect(service.send(:phase_has_run_more_than_14_days?)).to be false
    end
  end

  describe '#percentage_change' do
    it 'calculates percentage change correctly' do
      expect(service.send(:percentage_change, 100, 150)).to eq(50.0)
      expect(service.send(:percentage_change, 200, 100)).to eq(-50.0)
      expect(service.send(:percentage_change, 50, 75)).to eq(50.0)
      expect(service.send(:percentage_change, 80, 60)).to eq(-25.0)
    end

    it "returns 'last_7_days_compared_with_zero' when old value is zero and new value is not zero" do
      expect(service.send(:percentage_change, 0, 100)).to eq('last_7_days_compared_with_zero')
    end

    it 'returns zero when there is no change' do
      expect(service.send(:percentage_change, 100, 100)).to eq(0.0)
    end

    it 'returns zero when both old and new values are zero' do
      expect(service.send(:percentage_change, 0, 0)).to eq(0.0)
    end

    it 'returns -100.0 when new value is zero' do
      expect(service.send(:percentage_change, 100, 0)).to eq(-100.0)
    end

    it 'returns null when phase less than 14 days old' do
      phase.update(start_at: 10.days.ago)

      expect(service.send(:percentage_change, 100, 150)).to be_nil
    end

    it 'rounds percentage change to one decimal place' do
      expect(service.send(:percentage_change, 3, 4)).to eq(33.3)
      expect(service.send(:percentage_change, 7, 5)).to eq(-28.6)
    end
  end

  describe '#participations_7_day_change' do
    it 'returns nil when phase has not run more than 14 days' do
      phase = create(:single_voting_phase, start_at: 10.days.ago, end_at: 5.days.ago)
      service = described_class.new(phase)
      participations = [create(:basket_participation, acted_at: 9.days.ago)]

      expect(service.send(:participations_7_day_change, participations)).to be_nil
    end

    it 'returns 0.0 when participations is empty' do
      expect(service.send(:participations_7_day_change, [])).to eq(0.0)
    end

    it 'calculates 7-day change correctly' do
      participations = [
        create(:basket_participation, acted_at: 10.days.ago, participant_id: 'user_1'),
        create(:basket_participation, acted_at: 9.days.ago, participant_id: 'user_2'),
        create(:basket_participation, acted_at: 5.days.ago, participant_id: 'user_1'),
        create(:basket_participation, acted_at: 4.days.ago, participant_id: 'user_3')
      ]

      # Unique participants in 7-14 days ago: user_1, user_2 => 2
      # Unique participants in last 7 days: user_1, user_3 => 2
      expect(service.send(:participations_7_day_change, participations)).to eq(0.0)

      # Adding one more participation in the last 7 days
      participations << create(:basket_participation, acted_at: 3.days.ago, participant_id: 'user_4')

      # Unique participants in last 7 days: user_1, user_3, user_4 => 3
      expect(service.send(:participations_7_day_change, participations)).to eq(50.0)
    end
  end
end
