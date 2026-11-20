# frozen_string_literal: true

require 'rails_helper'

describe SideFxUserService do
  let(:service) { described_class.new }
  let(:current_user) { create(:user) }
  let(:user) { create(:user) }

  describe 'after_destroy' do
    it 'successfully enqueues PII data deletion job for Matomo' do
      allow(Matomo::RemoveUserFromMatomoJob).to receive(:tenant_site_ids).and_return(%w[13 14])

      expect { service.after_destroy(user, current_user) }
        .to have_enqueued_job(Matomo::RemoveUserFromMatomoJob).with(user.id, site_ids: %w[13 14])
    end
  end
end
