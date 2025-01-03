# frozen_string_literal: true

require 'rails_helper'

describe SideFxInternalCommentService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }
  let(:internal_comment) { create(:internal_comment) }
  let(:project_id) { internal_comment.idea.project_id }

  describe 'after_create' do
    it "logs a 'created' action when an internal comment is created" do
      expect { service.after_create(internal_comment, user) }
        .to enqueue_job(LogActivityJob)
        .with(internal_comment, 'created', user, internal_comment.updated_at.to_i, project_id: project_id)
    end

    it "logs a 'mentioned' action for every expanded mention" do
      mention_service = MentionService.new
      u1 = create(:user)
      u1_mention = mention_service.user_to_mention(u1)
      u1_mention_expanded = mention_service.add_span_around u1_mention, u1

      u2 = create(:user)
      u2_mention = mention_service.user_to_mention(u2)
      u2_mention_expanded = mention_service.add_span_around u2_mention, u2

      internal_comment.body = "Let's mention #{u1_mention_expanded} and #{u2_mention_expanded}"

      expectation = expect { service.after_create(internal_comment, user) }

      created_at = internal_comment.created_at.to_i
      expectation.to enqueue_job(LogActivityJob)
        .with(
          internal_comment,
          'mentioned',
          user,
          created_at,
          payload: { mentioned_user: u1.id },
          project_id: project_id
        )
      expectation.to enqueue_job(LogActivityJob)
        .with(
          internal_comment,
          'mentioned',
          user,
          created_at,
          payload: { mentioned_user: u2.id },
          project_id: project_id
        )
    end
  end

  describe 'after_update' do
    it "logs a 'changed' action job when the internal comment has changed" do
      internal_comment.update(body: 'changed')
      expect { service.after_update(internal_comment, user) }
        .to enqueue_job(LogActivityJob)
        .with(internal_comment, 'changed', user, internal_comment.updated_at.to_i, project_id: project_id)
    end

    it "logs a 'mentioned' action for every added mention" do
      mention_service = MentionService.new
      u1 = create(:user)
      u1_mention = mention_service.user_to_mention(u1)
      u1_mention_expanded = mention_service.add_span_around u1_mention, u1

      u2 = create(:user)
      u2_mention = mention_service.user_to_mention(u2)
      u2_mention_expanded = mention_service.add_span_around u2_mention, u2

      internal_comment = create(:internal_comment, body: u1_mention_expanded.to_s)
      internal_comment.update(body: "Let's mention #{u1_mention_expanded} and #{u2_mention_expanded}")

      expectation = expect { service.after_update(internal_comment, user) }
      created_at = internal_comment.created_at.to_i
      project_id = internal_comment.idea.project_id
      expectation.not_to enqueue_job(LogActivityJob)
        .with(
          internal_comment,
          'mentioned',
          user,
          created_at,
          payload: { mentioned_user: u1.id },
          project_id: project_id
        )
      expectation.to enqueue_job(LogActivityJob)
        .with(
          internal_comment,
          'mentioned',
          user,
          created_at,
          payload: { mentioned_user: u2.id },
          project_id: project_id
        )
    end
  end
end
