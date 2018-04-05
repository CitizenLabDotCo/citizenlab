require 'rails_helper'

RSpec.describe Notification, type: :model do
  describe "Default factory" do
    it "is valid" do
      expect(build(:notification)).to be_valid
    end
  end

  describe "all notification subclass factories" do
    before do
      # Make sure that we can find all notification
      # subclasses, but without enabling eager 
      # loading for the other tests.
      Cl2Back::Application.eager_load!
    end
    it "are valid" do
      Notification.descendants.each do |notification_subclass|
        if notification_subclass.descendants.empty?
          expect(build(notification_subclass.model_name.element.to_sym)).to be_valid
        end
      end
    end
  end

  describe "make_notifications_on" do
    it "makes a comment on your comment and comment on your idea notification on created comment activity" do
      idea = create(:idea)
      parent_comment = create(:comment, idea: idea)
      child_comment = create(:comment, parent: parent_comment)
      activity = create(:activity, item: child_comment, action: 'created')

      notifications = Notifications::CommentOnYourComment.make_notifications_on activity
      expect(notifications).to be_present
      notifications = Notifications::CommentOnYourIdea.make_notifications_on activity
      expect(notifications).to be_present
    end
  end
end
