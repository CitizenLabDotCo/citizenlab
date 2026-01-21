# frozen_string_literal: true

require 'rails_helper'

describe SideFxUserService do
  let(:service) { described_class.new }
  let(:current_user) { create(:user) }
  let(:user) { create(:user) }

  describe 'after_create' do
    it "logs a 'created' action job with type: 'email' when a normal user is created" do
      expect { service.after_create(user, user) }
        .to enqueue_job(LogActivityJob)
        .with(user, 'created', user, user.created_at.to_i, payload: { flow: 'email_password' })
        .exactly(1).times
    end

    it "logs a 'created' action job with type: 'email_only' when a user is created without a password" do
      user.update!(password: nil)

      expect { service.after_create(user, user) }
        .to enqueue_job(LogActivityJob)
        .with(user, 'created', user, user.created_at.to_i, payload: { flow: 'email_confirmation' })
        .exactly(1).times
    end

    it "logs a 'created' action job with type: 'sso' when a user is created with sso" do
      user.identities << create(:facebook_identity)

      expect { service.after_create(user, user) }
        .to enqueue_job(LogActivityJob)
        .with(user, 'created', user, user.created_at.to_i, payload: { flow: 'sso', method: 'facebook' })
        .exactly(1).times
    end

    it 'generates an avatar after a user is created' do
      expect { service.after_create(user, current_user) }
        .to have_enqueued_job(GenerateUserAvatarJob).with(user)
    end

    it 'identifies the user with segment after a user is created' do
      expect { service.after_create(user, current_user) }
        .to have_enqueued_job(TrackUserJob).with(user)
    end

    it 'logs a UpdateMemberCountJob' do
      expect { service.after_create(user, current_user) }.to have_enqueued_job(UpdateMemberCountJob)
    end

    it 'creates an unsubscription_token' do
      service.after_create(user, current_user)
      expect(user.email_campaigns_unsubscription_token).to be_present
    end

    it 'creates a follower for the domicile' do
      area = create(:area)
      user = create(:user, domicile: area.id)

      expect do
        service.after_create user, user
      end.to change(Follower, :count).from(0).to(1)

      expect(user.follows.pluck(:followable_id)).to contain_exactly area.id
    end

    describe 'claim_tokens' do
      let!(:claim_token) { create(:claim_token) }
      let(:idea) { claim_token.item }

      context 'when confirmation is not required' do
        it 'claims items immediately' do
          service.after_create(user, current_user, claim_tokens: [claim_token.token])

          expect(idea.reload.author_id).to eq(user.id)
          expect { claim_token.reload }.to raise_error(ActiveRecord::RecordNotFound)
        end
      end

      context 'when confirmation is required' do
        before { SettingsService.new.activate_feature!('user_confirmation') }

        let(:user) { create(:user_with_confirmation) }

        it 'marks tokens as pending' do
          service.after_create(user, current_user, claim_tokens: [claim_token.token])

          expect(claim_token.reload.pending_claimer_id).to eq(user.id)
          expect(idea.reload.author_id).to be_nil
        end
      end
    end
  end

  describe 'after_update' do
    it "logs a 'changed' action job when a user is resubmitted" do
      expect { service.after_update(user, user) }
        .to enqueue_job(LogActivityJob)
        .with(user, 'changed', user, user.updated_at.to_i)
        .exactly(1).times
    end

    it "logs a 'changed' action job when the avatar has changed" do
      user.update(avatar: Rails.root.join('spec/fixtures/lorem-ipsum.jpg').open)
      expect { service.after_update(user, current_user) }
        .to have_enqueued_job(LogActivityJob).with(user, 'changed', current_user, user.updated_at.to_i)
    end

    it "logs a 'completed_registration' action job when the registration is set" do
      user.update(registration_completed_at: nil)
      user.update(registration_completed_at: Time.now)
      expect { service.after_update(user, current_user) }
        .to have_enqueued_job(LogActivityJob).with(user, 'completed_registration', current_user, user.updated_at.to_i)
    end

    it "logs a 'admin_rights_given' action job when user has been made admin" do
      user.update(roles: [{ 'type' => 'admin' }])
      expect { service.after_update(user, current_user) }
        .to have_enqueued_job(LogActivityJob).with(user, 'admin_rights_given', current_user, user.updated_at.to_i)
    end

    it 'logs a UpdateMemberCountJob' do
      expect { service.after_update(user, current_user) }.to have_enqueued_job(UpdateMemberCountJob)
    end

    it 'creates a follower for the domicile' do
      area = create(:area)
      user.update!(domicile: area.id)

      expect do
        service.after_update user, user
      end.to change(Follower, :count).from(0).to(1)

      expect(user.follows.pluck(:followable_id)).to contain_exactly area.id
    end
  end

  describe 'after_destroy' do
    it "logs a 'deleted' action job when the user is destroyed" do
      freeze_time do
        frozen_user = user.destroy
        expect { service.after_destroy(frozen_user, current_user) }
          .to have_enqueued_job(LogActivityJob)
      end
    end

    it 'logs a UpdateMemberCountJob' do
      expect { service.after_destroy(user, current_user) }.to have_enqueued_job(UpdateMemberCountJob)
    end

    it 'successfully enqueues PII data deletion job for Intercom' do
      expect { service.after_destroy(user, current_user) }
        .to have_enqueued_job(RemoveUserFromIntercomJob).with(user.id)
    end

    it 'successfully enqueues PII data deletion job for Segment' do
      expect { service.after_destroy(user, current_user) }
        .to have_enqueued_job(RemoveUsersFromSegmentJob).with([user.id])
    end
  end

  describe 'after_block' do
    it "logs a 'blocked' action job when a user is blocked" do
      expect { service.after_block(user, current_user) }
        .to have_enqueued_job(LogActivityJob)
        .with(
          user,
          'blocked',
          current_user,
          user.updated_at.to_i,
          payload: {
            block_reason: user.block_reason,
            block_start_at: user.block_start_at,
            block_end_at: user.block_end_at
          }
        )
    end

    it 'schedules a UserBlockedMailer job' do
      expect { service.after_block(user, current_user) }
        .to have_enqueued_mail(UserBlockedMailer, :send_user_blocked_email)
    end
  end

  describe 'after_unblock' do
    it "logs an 'unblocked' action job when a user is unblocked" do
      expect { service.after_unblock(user, current_user) }
        .to have_enqueued_job(LogActivityJob).with(user, 'unblocked', current_user, user.updated_at.to_i)
    end
  end
end
