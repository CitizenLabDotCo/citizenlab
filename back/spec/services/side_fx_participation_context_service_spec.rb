# frozen_string_literal: true

require 'rails_helper'

describe SideFxParticipationContextService do
  subject(:service) { described_class.new }

  let(:user) { build(:user) }
  let(:pc) { create(:continuous_project) }

  describe 'after_create' do
    it { expect { service.after_create(pc, user) }.to have_enqueued_job(Surveys::WebhookManagerJob) }
  end

  describe 'after_update' do
    it { expect { service.after_update(pc, user) }.to have_enqueued_job(Surveys::WebhookManagerJob) }
  end

  describe 'before_destroy' do
    it { expect { service.before_destroy(pc, user) }.to have_enqueued_job(Surveys::WebhookManagerJob) }
  end
end
