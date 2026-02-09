# frozen_string_literal: true

require 'rails_helper'

describe SideFxCommentService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }
  let(:comment) { create(:comment) }
  let(:project_id) { comment.idea.project_id }

  describe 'after_create' do
    it "logs a 'created' action when a comment is created" do
      expect { service.after_create(comment, user) }
        .to enqueue_job(LogActivityJob)
        .with(comment, 'created', user, comment.updated_at.to_i, project_id: project_id)
    end

    it "logs a 'mentioned' action for every expanded mention" do
      mention_service = MentionService.new
      u1 = create(:user)
      u1_mention = mention_service.user_to_mention(u1)
      u1_mention_expanded = mention_service.add_span_around u1_mention, u1

      u2 = create(:user)
      u2_mention = mention_service.user_to_mention(u2)
      u2_mention_expanded = mention_service.add_span_around u2_mention, u2

      comment.body_multiloc['en'] = "Let's mention #{u1_mention_expanded} and #{u2_mention_expanded}"

      expectation = expect { service.after_create(comment, user) }

      created_at = comment.created_at.to_i
      expectation.to enqueue_job(LogActivityJob).with(comment, 'mentioned', user, created_at, payload: { mentioned_user: u1.id }, project_id: project_id)
      expectation.to enqueue_job(LogActivityJob).with(comment, 'mentioned', user, created_at, payload: { mentioned_user: u2.id }, project_id: project_id)
    end

    it 'creates the expected follower records' do
      project = create(:project)
      folder = create(:project_folder, projects: [project])
      idea = create(:idea, project: project)
      comment = create(:comment, idea: idea)

      expect do
        service.after_create comment.reload, user
      end.to change(Follower, :count).from(0).to(3)

      expect(user.follows.pluck(:followable_id)).to contain_exactly idea.id, project.id, folder.id
    end

    it 'does not create new follower records for followable items user already follows' do
      project = create(:project)
      folder = create(:project_folder, projects: [project])
      idea = create(:idea, project: project)
      comment = create(:comment, idea: idea)

      create(:follower, followable: idea, user: user)
      create(:follower, followable: project, user: user)
      create(:follower, followable: folder, user: user)
      n_idea_followers = idea.followers.count
      n_project_followers = project.followers.count
      n_folder_followers = folder.followers.count

      service.after_create comment, user
      expect(idea.reload.followers.count).to eq n_idea_followers
      expect(project.reload.followers.count).to eq n_project_followers
      expect(folder.reload.followers.count).to eq n_folder_followers
    end

    it 'enqueues wise voice detection job if idea_feed feature is activated' do
      SettingsService.new.activate_feature! 'nested_input_topics'
      SettingsService.new.activate_feature! 'live_auto_input_topics'
      SettingsService.new.activate_feature! 'idea_feed'
      expect { service.after_create(comment, user) }.to have_enqueued_job(WiseVoiceDetectionJob).with(comment)
    end

    it 'does not enqueue wise voice detection job if idea_feed feature is deactivated' do
      SettingsService.new.deactivate_feature! 'idea_feed'
      expect { service.after_create(comment, user) }.not_to have_enqueued_job(WiseVoiceDetectionJob)
    end
  end

  describe 'after_update' do
    it "logs a 'changed' action job when the comment has changed" do
      comment.update!(body_multiloc: { en: 'changed' })
      expect { service.after_update(comment, user) }
        .to enqueue_job(LogActivityJob)
        .with(comment, 'changed', user, comment.updated_at.to_i, project_id: project_id)
    end

    it "logs a 'mentioned' action for every added mention" do
      mention_service = MentionService.new
      u1 = create(:user)
      u1_mention = mention_service.user_to_mention(u1)
      u1_mention_expanded = mention_service.add_span_around u1_mention, u1

      u2 = create(:user)
      u2_mention = mention_service.user_to_mention(u2)
      u2_mention_expanded = mention_service.add_span_around u2_mention, u2

      comment = create(:comment, body_multiloc: { en: u1_mention_expanded.to_s })
      comment.update!(body_multiloc: { en: "Let's mention #{u1_mention_expanded} and #{u2_mention_expanded}" })

      expectation = expect { service.after_update(comment, user) }
      created_at = comment.created_at.to_i
      project_id = comment.idea.project_id
      expectation.not_to enqueue_job(LogActivityJob).with(comment, 'mentioned', user, created_at, payload: { mentioned_user: u1.id }, project_id: project_id)
      expectation.to enqueue_job(LogActivityJob).with(comment, 'mentioned', user, created_at, payload: { mentioned_user: u2.id }, project_id: project_id)
    end

    it 'enqueues wise voice detection job if idea_feed feature is activated and body_multiloc changed' do
      SettingsService.new.activate_feature! 'nested_input_topics'
      SettingsService.new.activate_feature! 'live_auto_input_topics'
      SettingsService.new.activate_feature! 'idea_feed'
      comment.update!(body_multiloc: { en: 'changed' })
      expect { service.after_update(comment, user) }.to have_enqueued_job(WiseVoiceDetectionJob).with(comment)
    end

    it 'does not enqueue wise voice detection job if idea_feed feature is deactivated' do
      SettingsService.new.deactivate_feature! 'idea_feed'
      comment.update!(body_multiloc: { en: 'changed' })
      expect { service.after_update(comment, user) }.not_to have_enqueued_job(WiseVoiceDetectionJob)
    end
  end

  describe 'after_destroy' do
    it "logs a 'deleted' action job when the comment is destroyed" do
      freeze_time do
        frozen_comment = comment.destroy
        expect { service.after_destroy(frozen_comment, user) }
          .to enqueue_job(LogActivityJob)
      end
    end
  end
end
