# frozen_string_literal: true

require 'rails_helper'

describe SideFxParticipationContextService do
  subject(:service) { described_class.new }

  let(:user) { create(:user) }
  let(:pc) { create(:continuous_project) }

  describe 'after_create' do
    it { expect { service.after_create(pc, user) }.to have_enqueued_job(Surveys::WebhookManagerJob) }

    {
      description_multiloc: { 'en' => 'changed' },
      voting_method: 'multiple_voting',
      voting_max_votes_per_idea: 9,
      voting_max_total: 11,
      voting_min_total: 2,
      posting_enabled: false,
      posting_method: 'limited',
      posting_limited_max: 3,
      commenting_enabled: false,
      reacting_enabled: false,
      reacting_like_method: 'limited',
      reacting_like_limited_max: 9,
      reacting_dislike_enabled: false,
      presentation_mode: 'map'
    }.each do |attribute, new_value|
      it "logs a '#{attribute}_changed' action job when the project has changed" do
        old_value = pc[attribute]
        pc.update!(attribute => new_value)
        expect { service.after_update(pc, user) }
          .to have_enqueued_job(LogActivityJob)
          .with(pc, "changed_#{attribute}", user, pc.updated_at.to_i, project_id: pc.id, payload: { change: [old_value, new_value] })
      end
    end
  end

  describe 'after_update' do
    it { expect { service.after_update(pc, user) }.to have_enqueued_job(Surveys::WebhookManagerJob) }
  end

  describe 'before_destroy' do
    it { expect { service.before_destroy(pc, user) }.to have_enqueued_job(Surveys::WebhookManagerJob) }
  end
end
