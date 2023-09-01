# frozen_string_literal: true

require 'rails_helper'

describe SideFxInitiativeService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }

  describe '#after_update' do
    it "logs a 'changed' action job when the initiative has changed" do
      initiative = create(:initiative)
      initiative.update!(title_multiloc: { en: 'something else' })
      expect { service.after_update(initiative, user, _cosponsor_ids = []) }
        .to enqueue_job(LogActivityJob).with(initiative, 'changed', any_args).exactly(1).times
    end

    it "logs a 'changed_title' action job when the title has changed" do
      initiative = create(:initiative)
      old_initiative_title = initiative.title_multiloc
      initiative.update!(title_multiloc: { en: 'changed' })

      expect { service.after_update(initiative, user, _cosponsor_ids = []) }
        .to enqueue_job(LogActivityJob).with(
          initiative,
          'changed_title',
          any_args,
          payload: { change: [old_initiative_title, initiative.title_multiloc] }
        ).exactly(1).times
    end

    it "logs a 'changed_body' action job when the body has changed" do
      initiative = create(:initiative)
      old_initiative_body = initiative.body_multiloc
      initiative.update!(body_multiloc: { en: 'changed' })

      expect { service.after_update(initiative, user, _cosponsor_ids = []) }
        .to enqueue_job(LogActivityJob).with(
          initiative,
          'changed_body',
          any_args,
          payload: { change: [old_initiative_body, initiative.body_multiloc] }
        )
    end

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

  describe 'after_create' do
    it "logs a 'published' action job when publication_state is published" do
      initiative = create(:initiative, publication_status: 'published', author: user)

      expect { service.after_create(initiative, user) }
        .to enqueue_job(LogActivityJob)
        .with(initiative, 'published', user, initiative.created_at.to_i)
        .exactly(1).times
    end

    it "doesn't log a 'published' action job when publication_state is draft" do
      initiative = create(:initiative, publication_status: 'draft')
      expect { service.after_create(initiative, user) }
        .not_to enqueue_job(LogActivityJob)
    end

    it 'creates a follower' do
      initiative = create(:initiative)

      expect do
        service.after_create initiative, user
      end.to change(Follower, :count).from(0).to(1)

      expect(user.follows.pluck(:followable_id)).to contain_exactly initiative.id
    end

    it 'creates a reaction (vote) for an author who can react (vote)' do
      initiative = create(:initiative)

      expect do
        service.after_create initiative, user
      end.to change(Reaction, :count).from(0).to(1)

      expect(initiative.reactions.pluck(:user_id)).to contain_exactly initiative.author.id
    end

    it 'does not create a reaction (vote) for an author who cannot react (vote)' do
      initiative = create(:initiative)

      create(
        :permission,
        permission_scope: nil,
        action: 'reacting_initiative',
        permitted_by: 'groups',
        groups: [create(:group)]
      )

      expect do
        service.after_create initiative, user
      end.not_to change(Reaction, :count)
    end

    context "when initiative has status 'proposed'" do
      let(:initiative) { create(:initiative) }
      let!(:initiative_status_change) do
        create(
          :initiative_status_change,
          initiative: initiative,
          initiative_status: create(:initiative_status_proposed)
        )
      end

      it 'logs a proposed activity job' do
        expect { service.after_create(initiative, user) }
          .to enqueue_job(LogActivityJob)
          .with(initiative, 'proposed', user, initiative.updated_at.to_i)
          .exactly(1).times
      end
    end

    context "when initiative has status 'review_pending'" do
      let(:initiative) { create(:initiative) }
      let!(:initiative_status_change) do
        create(
          :initiative_status_change,
          initiative: initiative,
          initiative_status: create(:initiative_status_review_pending)
        )
      end

      it "doesn't log a proposed activity job" do
        expect { service.after_update(initiative, user, _cosponsor_ids = []) }
          .not_to enqueue_job(LogActivityJob)
          .with(instance_of(Initiative), 'proposed', anything, anything)
      end
    end
  end

  describe 'after_destroy' do
    it "logs a 'deleted' action job when the initiative is destroyed" do
      initiative = create(:initiative)
      freeze_time do
        frozen_initiative = initiative.destroy
        expect { service.after_destroy(frozen_initiative, user) }
          .to enqueue_job(LogActivityJob).exactly(1).times
      end
    end
  end
end
