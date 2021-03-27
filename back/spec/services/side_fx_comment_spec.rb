require "rails_helper"

describe SideFxCommentService do
  let(:service) { SideFxCommentService.new }
  let(:user) { create(:user) }
  let(:comment) { create(:comment) }

  describe "after_create" do
    it "logs a 'created' action when a comment is created" do
      expect {service.after_create(comment, user)}.
        to have_enqueued_job(LogActivityJob).with(comment, 'created', user, comment.updated_at.to_i)
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
      expectation = expect {service.after_create(comment, user)}
      expectation.to have_enqueued_job(LogActivityJob).with(comment, 'mentioned', user, comment.created_at.to_i, payload: {mentioned_user: u1.id})
      expectation.to have_enqueued_job(LogActivityJob).with(comment, 'mentioned', user, comment.created_at.to_i, payload: {mentioned_user: u2.id})
    end

  end

  describe "after_update" do

    it "logs a 'changed' action job when the comment has changed" do
      comment.update(body_multiloc: {'en': 'changed'})
      expect {service.after_update(comment, user)}.
        to have_enqueued_job(LogActivityJob).with(comment, 'changed', user, comment.updated_at.to_i)
    end

    it "logs a 'mentioned' action for every added mention" do
      mention_service = MentionService.new
      u1 = create(:user)
      u1_mention = mention_service.user_to_mention(u1)
      u1_mention_expanded = mention_service.add_span_around u1_mention, u1

      u2 = create(:user)
      u2_mention = mention_service.user_to_mention(u2)
      u2_mention_expanded = mention_service.add_span_around u2_mention, u2

      comment = create(:comment, body_multiloc: {en: "#{u1_mention_expanded}"})

      comment.update(body_multiloc: {'en': "Let's mention #{u1_mention_expanded} and #{u2_mention_expanded}"})
      expectation = expect {service.after_update(comment, user)}
      expectation.to_not have_enqueued_job(LogActivityJob).with(comment, 'mentioned', user, comment.created_at.to_i, payload: {mentioned_user: u1.id})
      expectation.to have_enqueued_job(LogActivityJob).with(comment, 'mentioned', user, comment.created_at.to_i, payload: {mentioned_user: u2.id})
    end

  end

  describe "after_destroy" do
    it "logs a 'deleted' action job when the comment is destroyed" do
      travel_to Time.now do
        frozen_comment = comment.destroy
        expect {service.after_destroy(frozen_comment, user)}.
          to have_enqueued_job(LogActivityJob)
      end
    end

  end

end
