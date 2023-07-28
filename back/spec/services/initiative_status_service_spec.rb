# frozen_string_literal: true

require 'rails_helper'

describe InitiativeStatusService do
  let(:service) { described_class.new }

  let!(:status_review_pending) { create(:initiative_status_review_pending) }
  let!(:status_rejected_on_review) { create(:initiative_status_rejected_on_review) }
  let!(:status_proposed) { create(:initiative_status_proposed) }
  let!(:status_expired) { create(:initiative_status_expired) }
  let!(:status_threshold_reached) { create(:initiative_status_threshold_reached) }
  let!(:status_answered) { create(:initiative_status_answered) }
  let!(:status_ineligible) { create(:initiative_status_ineligible) }

  describe '#automated_transitions!' do
    before do
      @initiative = create(:initiative)
      configuration = AppConfiguration.instance
      configuration.settings['initiatives'] = {
        enabled: true,
        allowed: true,
        reacting_threshold: 2,
        days_limit: 20,
        threshold_reached_message: { 'en' => 'Threshold reached' },
        eligibility_criteria: { 'en' => 'Eligibility criteria' }
      }
      configuration.save!
    end

    it 'transitions when voting threshold was reached' do
      create(
        :initiative_status_change,
        initiative: @initiative, initiative_status: status_proposed
      )
      create_list(:reaction, 3, reactable: @initiative, mode: 'up')

      service.automated_transitions!

      expect(@initiative.reload.initiative_status.code).to eq 'threshold_reached'
    end

    it 'transitions when expired' do
      create(
        :initiative_status_change,
        initiative: @initiative, initiative_status: status_proposed
      )

      travel_to(Time.now + 22.days) do
        service.automated_transitions!
        expect(@initiative.reload.initiative_status.code).to eq 'expired'
      end
    end

    it 'remains proposed if not expired nor threshold reached' do
      create(
        :initiative_status_change,
        initiative: @initiative, initiative_status: status_proposed
      )
      create_list(:reaction, 1, reactable: @initiative, mode: 'up')

      travel_to(Time.now + 15.days) do
        service.automated_transitions!
        expect(@initiative.reload.initiative_status.code).to eq 'proposed'
      end
    end
  end

  describe 'transition_type' do
    it 'labels the threshold_reached status as automatic' do
      expect(service.transition_type(status_threshold_reached)).to eq 'automatic'
    end

    it 'labels the ineligible status as manual' do
      expect(service.transition_type(status_ineligible)).to eq 'manual'
    end

    it 'labels the review_pending status as manual' do
      expect(service.transition_type(status_review_pending)).to eq 'manual'
    end

    it 'labels the rejected_on_review status as manual' do
      expect(service.transition_type(status_rejected_on_review)).to eq 'manual'
    end

    context 'when review feature is fully activated' do
      before do
        SettingsService.new.activate_feature! 'initiative_review'

        configuration = AppConfiguration.instance
        configuration.settings['initiatives'] = {
          enabled: true,
          allowed: true,
          require_review: true, # This is also required to activate the feature
          reacting_threshold: 2,
          days_limit: 20,
          threshold_reached_message: { 'en' => 'Threshold reached' },
          eligibility_criteria: { 'en' => 'Eligibility criteria' }
        }
        configuration.save!
      end

      it 'is active' do
        expect(Initiative.review_required?).to be true
      end

      it 'labels the review_pending status as automatic' do
        expect(service.transition_type(status_review_pending)).to eq 'automatic'
      end

      it 'labels the proposed status as manual' do
        expect(service.transition_type(status_proposed)).to eq 'manual'
      end
    end

    context 'when review feature is not fully activated' do
      it 'is not active' do
        expect(Initiative.review_required?).to be false
      end

      it 'labels the review_pending status as manual' do
        expect(service.transition_type(status_review_pending)).to eq 'manual'
      end

      it 'labels the proposed status as automatic' do
        expect(service.transition_type(status_proposed)).to eq 'automatic'
      end
    end
  end
end
