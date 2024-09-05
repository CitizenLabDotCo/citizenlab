# frozen_string_literal: true

require 'rails_helper'

describe InputStatusService do
  describe 'automated transitions' do
    before do
      %w[proposed threshold_reached expired].each do |status_code|
        create(:proposals_status, code: status_code)
      end
    end

    let(:phase) { create(:proposals_phase, reacting_threshold: 2, expire_days_limit: 20) }
    let!(:proposal) { create(:proposal, idea_status: IdeaStatus.find_by(code: 'proposed'), creation_phase: phase, project: phase.project, published_at: Time.now) }

    describe 'auto_transition_input!' do
      it 'transitions when voting threshold was reached' do
        create_list(:reaction, 3, reactable: proposal, mode: 'up')

        described_class.auto_transition_input!(proposal.reload)

        expect(proposal.reload.idea_status.code).to eq 'threshold_reached'
      end

      it 'remains proposed if not expired nor threshold reached' do
        create(:reaction, reactable: proposal, mode: 'up')

        travel_to(Time.now + 15.days) do
          described_class.auto_transition_input!(proposal.reload)
          expect(proposal.reload.idea_status.code).to eq 'proposed'
        end
      end
    end

    describe 'auto_transition_hourly!' do
      it 'transitions when expired' do
        create(:idea)
        travel_to(Time.now + 22.days) do
          described_class.auto_transition_hourly!
          expect(proposal.reload.idea_status.code).to eq 'expired'
        end
      end

      it 'remains proposed if not expired nor threshold reached' do
        create(:reaction, reactable: proposal, mode: 'up')

        travel_to(Time.now + 19.days) do
          described_class.auto_transition_hourly!
          expect(proposal.reload.idea_status.code).to eq 'proposed'
        end
      end
    end
  end
end
