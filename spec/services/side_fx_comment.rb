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

  end

  describe "after_update" do

    it "logs a 'changed' action job when the comment has changed" do
      comment.update(body_multiloc: {'en': 'changed'})
      expect {service.after_update(comment, user)}.
        to have_enqueued_job(LogActivityJob).with(comment, 'changed', user, comment.updated_at.to_i)
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
