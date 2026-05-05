# frozen_string_literal: true

require 'rails_helper'

describe InputStatusService do
  include ActiveJob::TestHelper

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

      it "logs a 'changed_status' activity when transitioning" do
        proposed_status = IdeaStatus.find_by(code: 'proposed')
        threshold_status = IdeaStatus.find_by(code: 'threshold_reached')
        create_list(:reaction, 3, reactable: proposal, mode: 'up')

        expect { described_class.auto_transition_input!(proposal.reload) }
          .to enqueue_job(LogActivityJob).with(
            proposal,
            'changed_status',
            nil,
            anything,
            payload: { change: [proposed_status.id, threshold_status.id] },
            project_id: proposal.project_id
          )
      end

      it 'creates ThresholdReachedForAdmin notifications for project moderators on threshold transition' do
        moderator = create(:project_moderator, projects: [phase.project])
        create_list(:reaction, 3, reactable: proposal, mode: 'up')

        # Restrict job execution to LogActivityJob (creates the Activity and
        # enqueues notification jobs) and MakeNotificationsForClassJob (creates
        # the Notification records). Other jobs that LogActivityJob enqueues
        # (Rabbit publish, Segment tracking) require external services that
        # aren't available in CI.
        expect do
          perform_enqueued_jobs(only: [LogActivityJob, MakeNotificationsForClassJob]) do
            described_class.auto_transition_input!(proposal.reload)
          end
        end.to change { Notifications::ThresholdReachedForAdmin.where(recipient: moderator).count }.by(1)
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

      it "logs a 'changed_status' activity when transitioning to expired" do
        proposed_status = IdeaStatus.find_by(code: 'proposed')
        expired_status = IdeaStatus.find_by(code: 'expired')

        travel_to(Time.now + 22.days) do
          expect { described_class.auto_transition_hourly! }
            .to enqueue_job(LogActivityJob).with(
              proposal,
              'changed_status',
              nil,
              anything,
              payload: { change: [proposed_status.id, expired_status.id] },
              project_id: proposal.project_id
            )
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
