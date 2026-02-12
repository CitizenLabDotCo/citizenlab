# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DeleteUserJob do
  describe '.perform_now' do
    let(:user) { create(:user) }

    it 'deletes the user record' do
      described_class.perform_now(user)
      expect { user.reload }.to raise_error(ActiveRecord::RecordNotFound)
    end

    it 'deletes the user record from user identifier' do
      described_class.perform_now(user.id)
      expect { user.reload }.to raise_error(ActiveRecord::RecordNotFound)
    end

    it 'triggers after_destroy side effects' do
      sidefx_service = instance_spy(SideFxUserService, 'sidefx_service')
      allow(SideFxUserService).to receive(:new).and_return(sidefx_service)

      current_user = build_stubbed(:user)
      described_class.perform_now(user.id, current_user)

      expect(sidefx_service).to have_received(:after_destroy)
        .with(user, current_user, participation_data_deleted: false)
    end

    context 'with delete_participation_data: true' do
      let(:current_user) { create(:admin) }

      it 'deletes user participation data' do
        participation_service = instance_spy(ParticipantsService, 'participation_service')
        allow(ParticipantsService).to receive(:new).and_return(participation_service)

        described_class.perform_now(user.id, current_user, delete_participation_data: true)

        expect(participation_service)
          .to have_received(:destroy_user_participation_data).with(user)
      end

      it 'passes participation_data_deleted to side effects' do
        sidefx_service = instance_spy(SideFxUserService, 'sidefx_service')
        allow(SideFxUserService).to receive(:new).and_return(sidefx_service)

        described_class.perform_now(user.id, current_user, delete_participation_data: true)

        expect(sidefx_service).to have_received(:after_destroy).with(user, current_user, participation_data_deleted: true)
      end
    end

    context 'when the user does not exist' do
      before do
        user.destroy!
      end

      it 'raise an error' do
        expect { described_class.perform_now(user.id) }
          .to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    context 'with ban_email: true' do
      let(:current_user) { create(:admin) }
      let(:user) { create(:user, email: 'banned.user+test@gmail.com') }

      it 'bans the user email' do
        expect { described_class.perform_now(user.id, current_user, ban_email: true) }
          .to change(EmailBan, :count).by(1)
        expect(EmailBan.find_for('banned.user+test@gmail.com')).to be_present
      end

      it 'stores the ban reason' do
        described_class.perform_now(user.id, current_user, ban_email: true, ban_reason: 'Spam account')
        ban = EmailBan.find_for('banned.user+test@gmail.com')

        expect(ban.reason).to eq 'Spam account'
        expect(ban.banned_by).to eq current_user
      end

      it 'does not ban email when ban_email is false' do
        expect { described_class.perform_now(user.id, current_user, ban_email: false) }
          .not_to change(EmailBan, :count)
      end

      it 'does not ban email when user has no email' do
        user.update_column(:email, nil)
        expect { described_class.perform_now(user.id, current_user, ban_email: true) }
          .not_to change(EmailBan, :count)
      end
    end

    context 'when user has associations that should be nullified' do
      it 'successfully deletes user with project imports' do
        user = create(:user)
        create(:project_import, import_user: user, import_type: 'project')

        expect { described_class.new.run(user) }.not_to raise_error
        expect(User.exists?(user.id)).to be false
        expect(BulkImportIdeas::ProjectImport.where(import_user_id: nil).count).to eq(1)
      end

      it 'successfully deletes user with idea imports' do
        user = create(:user)
        create(:idea_import, import_user: user)

        expect { described_class.new.run(user) }.not_to raise_error
        expect(User.exists?(user.id)).to be false
        expect(BulkImportIdeas::IdeaImport.where(import_user_id: nil).count).to eq(1)
      end

      it 'successfully deletes user who banned an email' do
        user = create(:admin)
        EmailBan.ban!('banned@example.com', reason: 'Spam', banned_by: user)

        expect { described_class.new.run(user) }.not_to raise_error
        expect(User.exists?(user.id)).to be false
        expect(EmailBan.where(banned_by_id: nil).count).to eq(1)
      end

      it 'successfully deletes user with activities' do
        user = create(:user)
        create(:activity, user: user)

        expect { described_class.new.run(user) }.not_to raise_error
        expect(User.exists?(user.id)).to be false
        expect(Activity.where(user_id: nil).count).to eq(1)
      end

      it 'successfully deletes user with ideas' do
        user = create(:user)
        create(:idea, author: user)

        expect { described_class.new.run(user) }.not_to raise_error
        expect(User.exists?(user.id)).to be false
        expect(Idea.where(author_id: nil).count).to eq(1)
      end

      it 'successfully deletes user with manual votes last updated ideas' do
        user = create(:user)
        create(:idea, manual_votes_last_updated_by: user)

        expect { described_class.new.run(user) }.not_to raise_error
        expect(User.exists?(user.id)).to be false
        expect(Idea.where(manual_votes_last_updated_by_id: nil).count).to eq(1)
      end

      it 'successfully deletes user with manual voters last updated phases' do
        user = create(:user)
        create(:phase, manual_voters_last_updated_by: user)

        expect { described_class.new.run(user) }.not_to raise_error
        expect(User.exists?(user.id)).to be false
        expect(Phase.where(manual_voters_last_updated_by_id: nil).count).to eq(1)
      end

      it 'successfully deletes user with comments' do
        user = create(:user)
        create(:comment, author: user)

        expect { described_class.new.run(user) }.not_to raise_error
        expect(User.exists?(user.id)).to be false
        expect(Comment.where(author_id: nil).count).to eq(1)
      end

      it 'successfully deletes user with internal comments' do
        user = create(:user)
        create(:internal_comment, author: user)

        expect { described_class.new.run(user) }.not_to raise_error
        expect(User.exists?(user.id)).to be false
        expect(InternalComment.where(author_id: nil).count).to eq(1)
      end

      it 'successfully deletes user with official feedbacks' do
        user = create(:user)
        create(:official_feedback, user: user)

        expect { described_class.new.run(user) }.not_to raise_error
        expect(User.exists?(user.id)).to be false
        expect(OfficialFeedback.where(user_id: nil).count).to eq(1)
      end

      it 'successfully deletes user with reactions' do
        user = create(:user)
        create(:reaction, user: user)

        expect { described_class.new.run(user) }.not_to raise_error
        expect(User.exists?(user.id)).to be false
        expect(Reaction.where(user_id: nil).count).to eq(1)
      end

      it 'successfully deletes user with files' do
        user = create(:user)
        create(:file, uploader: user)

        expect { described_class.new.run(user) }.not_to raise_error
        expect(User.exists?(user.id)).to be false
        expect(Files::File.where(uploader_id: nil).count).to eq(1)
      end

      it 'successfully deletes user with spam reports' do
        user = create(:user)
        create(:spam_report, user: user)

        expect { described_class.new.run(user) }.not_to raise_error
        expect(User.exists?(user.id)).to be false
        expect(SpamReport.where(user_id: nil).count).to eq(1)
      end

      it 'successfully deletes user with inviter invites' do
        user = create(:user)
        create(:invite, inviter: user)

        expect { described_class.new.run(user) }.not_to raise_error
        expect(User.exists?(user.id)).to be false
        expect(Invite.where(inviter_id: nil).count).to eq(1)
      end

      it 'successfully deletes user with requested project reviews' do
        user = create(:admin)
        create(:project_review, requester: user)

        expect { described_class.new.run(user) }.not_to raise_error
        expect(User.exists?(user.id)).to be false
        expect(ProjectReview.where(requester_id: nil).count).to eq(1)
      end

      it 'successfully deletes user with assigned project reviews' do
        user = create(:admin)
        create(:project_review, reviewer: user)

        expect { described_class.new.run(user) }.not_to raise_error
        expect(User.exists?(user.id)).to be false
        expect(ProjectReview.where(reviewer_id: nil).count).to eq(1)
      end

      it 'successfully deletes user with jobs trackers' do
        user = create(:user)
        create(:jobs_tracker, owner: user)

        expect { described_class.new.run(user) }.not_to raise_error
        expect(User.exists?(user.id)).to be false
        expect(Jobs::Tracker.where(owner_id: nil).count).to eq(1)
      end

      it 'successfully deletes user with initiator notifications' do
        user = create(:user)
        recipient = create(:user)
        create(:notification, initiating_user: user, recipient: recipient)

        expect { described_class.new.run(user) }.not_to raise_error
        expect(User.exists?(user.id)).to be false
        expect(Notification.where(initiating_user_id: nil).count).to eq(1)
      end

      it 'successfully deletes user who is default assignee for projects' do
        user = create(:admin)
        create(:project, default_assignee: user)

        expect { described_class.new.run(user) }.not_to raise_error
        expect(User.exists?(user.id)).to be false
        expect(Project.where(default_assignee_id: nil).count).to eq(1)
      end

      it 'successfully deletes user with assigned ideas' do
        user = create(:admin)
        create(:idea, assignee: user)

        expect { described_class.new.run(user) }.not_to raise_error
        expect(User.exists?(user.id)).to be false
        expect(Idea.where(assignee_id: nil).count).to eq(1)
      end

      it 'successfully deletes user who owns reports' do
        user = create(:user)
        create(:report, owner: user)

        expect { described_class.new.run(user) }.not_to raise_error
        expect(User.exists?(user.id)).to be false
        expect(ReportBuilder::Report.where(owner_id: nil).count).to eq(1)
      end

      it 'successfully deletes user with campaign email commands' do
        user = create(:user)
        create(:campaign_email_command, recipient: user, campaign: 'admin_weekly_report')

        expect { described_class.new.run(user) }
          .to change { EmailCampaigns::CampaignEmailCommand.count }.by(-1)
          .and change(User, :count).by(-1)

        expect(User.exists?(user.id)).to be false
      end

      it 'successfully deletes user with email campaigns deliveries' do
        user = create(:user)
        create(:delivery, user: user)

        expect { described_class.new.run(user) }
          .to change(EmailCampaigns::Delivery, :count).by(-1)
          .and change(User, :count).by(-1)

        expect(User.exists?(user.id)).to be false
      end

      it 'successfully deletes user with email campaigns consents' do
        user = create(:user)
        create(:consent, user: user)

        expect { described_class.new.run(user) }
          .to change(EmailCampaigns::Consent, :count).by(-1)
          .and change(User, :count).by(-1)

        expect(User.exists?(user.id)).to be false
      end

      it 'successfully deletes user with email campaigns unsubscription token' do
        user = create(:user)
        create(:email_campaigns_unsubscription_token, user: user)

        expect { described_class.new.run(user) }
          .to change(EmailCampaigns::UnsubscriptionToken, :count).by(-1)
          .and change(User, :count).by(-1)

        expect(User.exists?(user.id)).to be false
      end

      it 'successfully deletes user with email campaigns examples' do
        user = create(:user)
        create(:campaign_example, recipient: user)

        expect { described_class.new.run(user) }
          .to change(EmailCampaigns::Example, :count).by(-1)
          .and change(User, :count).by(-1)

        expect(User.exists?(user.id)).to be false
      end
    end

    context 'when user has authored campaigns' do
      it 'successfully deletes user and fixes authored campaigns' do
        user = create(:user)
        campaign_with_author_sender = create(:manual_campaign, author: user, sender: 'author')
        campaign_with_org_sender = create(:manual_campaign, author: user, sender: 'organization')

        expect { described_class.new.run(user) }.not_to raise_error
        
        expect(User.exists?(user.id)).to be false
        expect(campaign_with_author_sender.reload.sender).to eq('organization')
        expect(campaign_with_author_sender.author_id).to be_nil
        expect(campaign_with_org_sender.reload.author_id).to be_nil
      end
    end

    context 'when user has associations that should be destroyed' do
      it 'successfully deletes user with claim tokens' do
        user = create(:user)
        create(:claim_token, pending_claimer: user)

        expect { described_class.new.run(user) }
          .to change(ClaimToken, :count).by(-1)
          .and change(User, :count).by(-1)

        expect(User.exists?(user.id)).to be false
      end

      it 'successfully deletes user with invites imports' do
        user = create(:user)
        create(:invites_import, importer: user, job_type: 'bulk_create')

        expect { described_class.new.run(user) }
          .to change(InvitesImport, :count).by(-1)
          .and change(User, :count).by(-1)

        expect(User.exists?(user.id)).to be false
      end

      it 'successfully deletes user with event attendances' do
        user = create(:user)
        event = create(:event)
        create(:event_attendance, attendee: user, event: event)

        expect { described_class.new.run(user) }
          .to change(Events::Attendance, :count).by(-1)
          .and change(User, :count).by(-1)

        expect(User.exists?(user.id)).to be false
      end
    end
  end
end
