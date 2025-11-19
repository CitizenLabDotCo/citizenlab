require 'rails_helper'

describe PhaseInsightsService do
  let(:service) { described_class.new }

  let(:phase) { create(:single_voting_phase) }

  let(:participation) { create(:basket_participation, :with_votes, vote_count: 15) }

  it 'does a thing' do
    expect(participation).to match({
      id: be_a(String),
      action: 'voting',
      acted_at: be_a(Time),
      classname: 'Basket',
      user_id: be_a(String),
      user_custom_field_values: {},
      votes: 15
    })
  end

  describe 'demographics_data' do
    let!(:permission1) { create(:permission, action: 'voting', permission_scope: phase) }
    let!(:custom_field_birthyear) { create(:custom_field, resource_type: 'User', key: 'birthyear', input_type: 'number', title_multiloc: { en: 'Birthyear' }) }

    let(:user1) { create(:user, custom_field_values: { birthyear: 1999 }) }

    let(:participation) { create(:basket_participation, user: user1) }

    let(:participations) { { voting: [participation] } }
    let(:participant_ids) { participations[:voting].pluck(:user_id).uniq }

    it 'calculates demographics data correctly' do
      result = service.send(:demographics_data, phase, participations.values.flatten, participant_ids)
      
      expect(result).to eq([
        {
          id: custom_field_birthyear.id,
          key: 'birthyear',
          code: nil,
          r_score: nil,
          title_multiloc: { 'en' => 'Birthyear' },
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
        }
      ])
    end
  end
end
