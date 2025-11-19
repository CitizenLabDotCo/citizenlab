require 'rails_helper'

describe PhaseInsightsService do
  let(:service) { described_class.new }

  # let(:phase) { create(:single_voting_phase) }
  # let!(:permission1) { create(:permission, action: 'voting', permission_scope: phase) }

  describe 'birthyear_demographics_data' do
    let!(:custom_field_birthyear) { create(:custom_field, resource_type: 'User', key: 'birthyear', input_type: 'number', title_multiloc: { en: 'Birthyear' }) }

    let(:user1) { create(:user, custom_field_values: { birthyear: Date.current.year - 25 }) } # Age 25

    let(:participation) { create(:basket_participation, user: user1) }

    let(:participations) { { voting: [participation] } }
    let(:participant_ids) { participations[:voting].pluck(:user_id).uniq }

    it 'calculates demographics data correctly when no reference distribution' do
      participant_custom_field_values = service.send(:participants_custom_field_values, participations.values.flatten, participant_ids)
      result = service.send(:birthyear_demographics_data, participant_custom_field_values)

      expect(result).to match({
        r_score: nil,
        series: {
          '0-9' => 0,
          '10-19' => 0,
          '20-29' => 1,
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
        series: { '18-24' => 0, '25-34' => 1, '35-44' => 0, '45-54' => 0, '55-64' => 0, '65+' => 0, '_blank' => 0 },
        reference_distribution: { '18-24' => 50, '25-34' => 200, '35-44' => 400, '45-54' => 300, '55-64' => 50, '65+' => 700 }
      })
    end
  end
end
