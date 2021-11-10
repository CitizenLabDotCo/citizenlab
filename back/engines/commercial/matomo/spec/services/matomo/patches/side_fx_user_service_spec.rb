require 'rails_helper'

describe SideFxUserService do
  let(:service) { SideFxUserService.new }
  let(:current_user) { create(:user) }
  let(:user) { create(:user) }
  
  describe 'after_destroy' do
    it 'successfully enqueues PII data deletion job for Matomo' do
      expect { service.after_destroy(user, current_user) }
        .to have_enqueued_job(Matomo::RemoveUserFromMatomoJob).with(user.id)
    end
  end
end
