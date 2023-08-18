# frozen_string_literal: true

require 'rails_helper'

describe SideFxInitiativeService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }

  describe '#after_update' do
    context 'when initiative status is changes_requested' do
      let(:initiative) do
        create(:initiative_status_review_pending)
        changes_requested = create(:initiative_status_changes_requested)
        create(:initiative, initiative_status: changes_requested, author: user)
      end

      it 'changes initiative status to review_pending' do
        service.after_update(initiative, user, _cosponsor_ids = [])
        expect(initiative.reload.initiative_status.code).to eq 'review_pending'
      end
    end

    context 'when update results in new cosponsors' do
      let(:initiative) { create(:initiative, author: user) }
      let(:cosponsor1) { create(:user) }
      let(:cosponsor2) { create(:user) }

      it "logs CosponsorsInitiative 'created' activity jobs" do
        initiative.update!(cosponsor_ids: [cosponsor1.id, cosponsor2.id])
        cosponsors_initiatives =
          CosponsorsInitiative.where(initiative: initiative).where(user_id: [cosponsor1.id, cosponsor2.id])

        expect { service.after_update(initiative, user, _old_cosponsor_ids = []) }
          .to enqueue_job(LogActivityJob)
          .with(cosponsors_initiatives[0], 'created', user, cosponsors_initiatives[0].created_at.to_i)
          .exactly(1).times
          .and enqueue_job(LogActivityJob)
          .with(cosponsors_initiatives[1], 'created', user, cosponsors_initiatives[1].created_at.to_i)
          .exactly(1).times
      end
    end

    context 'when initiative is published' do
      let(:initiative) { create(:initiative, author: user, publication_status: 'draft') }

      context "when initiative has status 'proposed'" do
        let!(:initiative_status_change) do
          create(
            :initiative_status_change,
            initiative: initiative,
            initiative_status: create(:initiative_status_proposed)
          )
        end

        it 'logs a proposed activity job' do
          initiative.update!(publication_status: 'published')

          expect { service.after_update(initiative, user, _cosponsor_ids = []) }
            .to enqueue_job(LogActivityJob)
            .with(initiative, 'proposed', user, initiative.updated_at.to_i)
            .exactly(1).times
        end
      end

      context "when initiative has status 'review_pending'" do
        let!(:initiative_status_change) do
          create(
            :initiative_status_change,
            initiative: initiative,
            initiative_status: create(:initiative_status_review_pending)
          )
        end

        it "doesn't log a proposed activity job" do
          initiative.update!(publication_status: 'published')

          expect { service.after_update(initiative, user, _cosponsor_ids = []) }
            .not_to enqueue_job(LogActivityJob)
            .with(instance_of(Initiative), 'proposed', anything, anything)
        end
      end
    end
  end

  describe '#after_accept_cosponsorship_invite' do
    let(:cosponsors_initiative) { create(:cosponsors_initiative) }

    it 'logs a cosponsorship_accepted activity job' do
      cosponsors_initiative.update!(status: 'accepted')

      expect { service.after_accept_cosponsorship_invite(cosponsors_initiative, user) }
        .to enqueue_job(LogActivityJob)
        .with(
          cosponsors_initiative,
          'cosponsorship_accepted',
          user,
          cosponsors_initiative.updated_at.to_i,
          payload: { change: %w[pending accepted] }
        )
        .exactly(1).times
    end
  end
end
