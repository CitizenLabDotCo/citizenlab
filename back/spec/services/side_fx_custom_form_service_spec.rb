# frozen_string_literal: true

require 'rails_helper'

describe SideFxCustomFormService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }
  let(:form) { create(:custom_form) }

  describe 'after_update' do
    it 'logs an activity job with stats' do
      payload = { stats: { 'new' => 1, 'changed' => 2, 'deleted' => 3 } }
      expect { service.after_update(form, user, payload) }
        .to enqueue_job(LogActivityJob).with(
          form,
          'changed',
          user,
          form.updated_at.to_i,
          payload: payload,
          project_id: form.project_id
        ).exactly(1).times
    end
  end
end
