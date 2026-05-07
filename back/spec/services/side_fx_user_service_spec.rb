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

    it 'logs an UpdateMemberCountJob' do
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

    context 'when user is an invitee' do
      let(:invitee) { create(:user_with_confirmation, invite_status: 'pending') }

      it 'does not send a confirmation code email' do
        expect(RequestConfirmationCodeJob).not_to receive(:perform_now)
        service.after_create(invitee, current_user)
      end
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

    it "logs an 'admin_rights_received' action job when user has been made admin" do
      user.update!(roles: [{ 'type' => 'admin' }])
      expect { service.after_update(user, current_user) }
        .to have_enqueued_job(LogActivityJob).with(user, 'admin_rights_received', current_user, anything, payload: {})
    end

    it "logs an 'admin_rights_removed' action job when user has been removed from admin" do
      user.update!(roles: [{ 'type' => 'admin' }])
      user.update!(roles: [])
      expect { service.after_update(user, current_user) }
        .to have_enqueued_job(LogActivityJob).with(user, 'admin_rights_removed', current_user, anything, payload: {})
    end

    it "logs a 'space_moderation_rights_received' action job when user has been made space moderator" do
      space = create(:space)
      user.update!(roles: [{ 'type' => 'space_moderator', 'space_id' => space.id }])
      expect { service.after_update(user, current_user) }
        .to have_enqueued_job(LogActivityJob).with(user, 'space_moderation_rights_received', current_user, anything, payload: { space_id: space.id })
    end

    it "logs a 'space_moderation_rights_removed' action job when user has been removed from space moderator" do
      space = create(:space)
      user.update!(roles: [{ 'type' => 'space_moderator', 'space_id' => space.id }])
      user.update!(roles: [])
      expect { service.after_update(user, current_user) }
        .to have_enqueued_job(LogActivityJob).with(user, 'space_moderation_rights_removed', current_user, anything, payload: { space_id: space.id })
    end

    it "logs a 'project_folder_moderation_rights_received' action job when user has been made project folder moderator" do
      folder = create(:project_folder)
      user.update!(roles: [{ 'type' => 'project_folder_moderator', 'project_folder_id' => folder.id }])
      expect { service.after_update(user, current_user) }
        .to have_enqueued_job(LogActivityJob).with(user, 'project_folder_moderation_rights_received', current_user, anything, payload: { project_folder_id: folder.id })
    end

    it "logs a 'project_folder_moderation_rights_removed' action job when user has been removed from project folder moderator" do
      folder = create(:project_folder)
      user.update!(roles: [{ 'type' => 'project_folder_moderator', 'project_folder_id' => folder.id }])
      user.update!(roles: [])
      expect { service.after_update(user, current_user) }
        .to have_enqueued_job(LogActivityJob).with(user, 'project_folder_moderation_rights_removed', current_user, anything, payload: { project_folder_id: folder.id })
    end

    it "logs a 'project_moderation_rights_received' action job when user has been made project moderator" do
      project = create(:project)
      user.update!(roles: [{ 'type' => 'project_moderator', 'project_id' => project.id }])
      expect { service.after_update(user, current_user) }
        .to have_enqueued_job(LogActivityJob).with(user, 'project_moderation_rights_received', current_user, anything, payload: { project_id: project.id })
    end

    it "logs a 'project_moderation_rights_removed' action job when user has been removed from project moderator" do
      project = create(:project)
      user.update!(roles: [{ 'type' => 'project_moderator', 'project_id' => project.id }])
      user.update!(roles: [])
      expect { service.after_update(user, current_user) }
        .to have_enqueued_job(LogActivityJob).with(user, 'project_moderation_rights_removed', current_user, anything, payload: { project_id: project.id })
    end

    it 'logs the appropriate action job when multiple user roles are removed' do
      space = create(:space)
      folder = create(:project_folder)
      project_a = create(:project)
      project_b = create(:project)
      user.update!(roles: [
        { 'type' => 'admin' },
        { 'type' => 'space_moderator', 'space_id' => space.id },
        { 'type' => 'project_folder_moderator', 'project_folder_id' => folder.id },
        { 'type' => 'project_moderator', 'project_id' => project_a.id },
        { 'type' => 'project_moderator', 'project_id' => project_b.id }
      ])
      user.update!(roles: [
        { 'type' => 'admin' },
        { 'type' => 'project_moderator', 'project_id' => project_b.id }
      ])

      expect { service.after_update(user, current_user) }
        .to have_enqueued_job(LogActivityJob)
        .with(user, 'space_moderation_rights_removed', current_user, anything, payload: { space_id: space.id })
        .and have_enqueued_job(LogActivityJob)
        .with(user, 'project_folder_moderation_rights_removed', current_user, anything, payload: { project_folder_id: folder.id })
        .and have_enqueued_job(LogActivityJob)
        .with(user, 'project_moderation_rights_removed', current_user, anything, payload: { project_id: project_a.id })

      expect(user.reload.roles).to eq([{ 'type' => 'admin' }, { 'type' => 'project_moderator', 'project_id' => project_b.id }])
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

  describe 'after_update - expire_token! on role change' do
    it 'expires the token when a regular user gains roles' do
      user.update!(roles: [{ 'type' => 'admin' }])
      expect(user).to receive(:expire_token!)
      service.after_update(user, current_user)
    end

    it 'does not expire the token when roles change but user already had roles' do
      user.update!(roles: [{ 'type' => 'admin' }])
      user.update!(roles: [{ 'type' => 'project_moderator', 'project_id' => 'some-id' }])
      expect(user).not_to receive(:expire_token!)
      service.after_update(user, current_user)
    end

    it 'expires the token when all roles are removed' do
      user.update!(roles: [{ 'type' => 'admin' }])
      user.update!(roles: [])
      expect(user).to receive(:expire_token!)
      service.after_update(user, current_user)
    end

    it 'does not expire the token when roles are unchanged' do
      user.update!(first_name: 'Updated')
      expect(user).not_to receive(:expire_token!)
      service.after_update(user, current_user)
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

    it 'enqueues an UpdateMemberCountJob by default' do
      expect { service.after_destroy(user, current_user) }.to have_enqueued_job(UpdateMemberCountJob)
    end

    it 'does not enqueue a UpdateMemberCountJob when update_member_counts is false' do
      expect { service.after_destroy(user, current_user, update_member_counts: false) }.not_to have_enqueued_job(UpdateMemberCountJob)
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

    it 'expires the user token' do
      expect(user).to receive(:expire_token!)
      service.after_block(user, current_user)
    end
  end

  describe 'after_unblock' do
    it "logs an 'unblocked' action job when a user is unblocked" do
      expect { service.after_unblock(user, current_user) }
        .to have_enqueued_job(LogActivityJob).with(user, 'unblocked', current_user, user.updated_at.to_i)
    end
  end
end
