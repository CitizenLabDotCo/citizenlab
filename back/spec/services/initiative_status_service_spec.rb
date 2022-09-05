# frozen_string_literal: true

require 'rails_helper'

describe InitiativeStatusService do
  let(:service) { described_class.new }

  describe '#automated_transitions!' do
    before do
      @initiative = create(:initiative)
      configuration = AppConfiguration.instance
      configuration.settings['initiatives'] = {
        enabled: true,
        allowed: true,
        voting_threshold: 2,
        days_limit: 20,
        threshold_reached_message: { 'en' => 'Threshold reached' },
        eligibility_criteria: { 'en' => 'Eligibility criteria' }
      }
      configuration.save!

      @status_proposed = create(:initiative_status_proposed)
      @status_expired = create(:initiative_status_expired)
      @status_threshold_reached = create(:initiative_status_threshold_reached)
      @status_answered = create(:initiative_status_answered)
      @status_ineligible = create(:initiative_status_ineligible)
    end

    it 'transitions when voting threshold was reached' do
      create(
        :initiative_status_change,
        initiative: @initiative, initiative_status: @status_proposed
      )
      create_list(:vote, 3, votable: @initiative, mode: 'up')

      service.automated_transitions!

      expect(@initiative.reload.initiative_status.code).to eq 'threshold_reached'
    end

    it 'transitions when expired' do
      create(
        :initiative_status_change,
        initiative: @initiative, initiative_status: @status_proposed
      )

      travel_to(Time.now + 22.days) do
        service.automated_transitions!
        expect(@initiative.reload.initiative_status.code).to eq 'expired'
      end
    end

    it 'remains proposed if not expired nor threshold reached' do
      create(
        :initiative_status_change,
        initiative: @initiative, initiative_status: @status_proposed
      )
      create_list(:vote, 1, votable: @initiative, mode: 'up')

      travel_to(Time.now + 15.days) do
        service.automated_transitions!
        expect(@initiative.reload.initiative_status.code).to eq 'proposed'
      end
    end
  end

  describe 'transition_type' do
    before do
      @status_proposed = create(:initiative_status_proposed)
      @status_expired = create(:initiative_status_expired)
      @status_threshold_reached = create(:initiative_status_threshold_reached)
      @status_answered = create(:initiative_status_answered)
      @status_ineligible = create(:initiative_status_ineligible)
    end

    it 'labels the threshold_reached status as automatic' do
      expect(service.transition_type(@status_threshold_reached)).to eq 'automatic'
    end

    it 'labels the ineligible status as manual' do
      expect(service.transition_type(@status_ineligible)).to eq 'manual'
    end
  end
end
