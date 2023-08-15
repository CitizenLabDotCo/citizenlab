# frozen_string_literal: true

require 'rails_helper'

describe SideFxInitiativeService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }

  describe '#after_update' do
    context 'when initiative is changes_requested' do
      let(:initiative) do
        create(:initiative_status_review_pending)
        changes_requested = create(:initiative_status_changes_requested)
        create(:initiative, initiative_status: changes_requested, author: user)
      end

      it 'changes initiative status to review_pending' do
        service.after_update(initiative, user, _cosponsors_ids = [])
        expect(initiative.reload.initiative_status.code).to eq 'review_pending'
      end
    end

    context 'when update results in new cosponsors' do
      let(:initiative) { create(:initiative, author: user) }
      let(:cosponsor1) { create(:user) }
      let(:cosponsor2) { create(:user) }

      it "logs a CosponsorsInitiative 'created' action job" do
        initiative.update!(cosponsor_ids: [cosponsor1.id, cosponsor2.id])
        cosponsors_initiatives =
          CosponsorsInitiative.where(initiative: initiative).where(user_id: [cosponsor1.id, cosponsor2.id])

        expect { service.after_update(initiative, user, _old_cosponsors_ids = []) }
          .to enqueue_job(LogActivityJob)
          .with(cosponsors_initiatives[0], 'created', user, cosponsors_initiatives[0].created_at.to_i)
          .exactly(1).times
          .and enqueue_job(LogActivityJob)
          .with(cosponsors_initiatives[1], 'created', user, cosponsors_initiatives[1].created_at.to_i)
          .exactly(1).times
      end
    end
  end
end
