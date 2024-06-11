# frozen_string_literal: true

require 'rails_helper'

RSpec.describe GenerateUserAvatarJob do
  subject(:job) { described_class.new }

  describe '#perform' do
    # TODO: We should not send real requests or rely on the existence of a gravatar account.
    let(:user) { create(:user, email: 'sebastien+withgravatar@citizenlab.co', avatar: nil) }

    context 'when user_avatars is enabled' do
      before { SettingsService.new.activate_feature!('user_avatars') }

      it 'retrieves and stores an avatar when the user has a gravatar for his email address' do
        job.perform(user)
        expect(user.reload.avatar).to be_present
      end
    end

    context 'when user_avatars is disabled' do
      before { SettingsService.new.deactivate_feature!('user_avatars') }

      it 'does not retrieve and store the gravatar' do
        expect(user).not_to receive(:remote_avatar_url=)
        expect(user).not_to receive(:save)

        job.perform(user)
      end
    end
  end
end
