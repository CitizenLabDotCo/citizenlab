# frozen_string_literal: true

require 'rails_helper'

describe SideFxInitiativeService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }

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
  end

  describe 'after_update' do
    it "logs a 'published' action job when publication_state goes from draft to published" do
      initiative = create(:initiative, publication_status: 'draft', author: user)
      initiative.update!(publication_status: 'published')

      expect { service.after_update(initiative, user) }
        .to enqueue_job(LogActivityJob)
        .with(initiative, 'published', user, initiative.published_at.to_i)
        .exactly(1).times
    end

    it "logs a 'changed' action job when the initiative has changed" do
      initiative = create(:initiative)
      initiative.update!(title_multiloc: { en: 'something else' })
      expect { service.after_update(initiative, user) }
        .to enqueue_job(LogActivityJob).with(initiative, 'changed', any_args).exactly(1).times
    end

    it "logs a 'changed_title' action job when the title has changed" do
      initiative = create(:initiative)
      old_initiative_title = initiative.title_multiloc
      initiative.update!(title_multiloc: { en: 'changed' })

      expect { service.after_update(initiative, user) }
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

      expect { service.after_update(initiative, user) }
        .to enqueue_job(LogActivityJob).with(
          initiative,
          'changed_body',
          any_args,
          payload: { change: [old_initiative_body, initiative.body_multiloc] }
        )
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
