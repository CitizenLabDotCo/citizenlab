require 'rails_helper'

RSpec.describe Notification, type: :model do
  describe "Deleting stuff related to notifications works when" do

    let!(:project) { create(:project) }
    let!(:idea) { create(:idea, project: project) }
    let!(:parent) {create(:comment, idea: idea) }
    let!(:child) { create(:comment, parent: parent) }
    let!(:initiator) { create(:user) }
    let!(:recipient) { create(:user) }
    let!(:spam_report) { create(:spam_report) }
    let!(:notification) { create(:notification, project: project, idea: idea, comment: child, initiating_user: initiator, recipient: recipient, spam_report: spam_report) }
    

    it "deleting recipient of notification" do
      recipient.destroy!
    end

    it "deleting initiator of notification" do
      initiator.destroy!
    end

    it "deleting project of notification" do
      project.destroy!
    end

    it "deleting idea of notification" do
      idea.destroy!
    end

    it "deleting comment of notification" do
      child.destroy!
    end

    it "deleting spam report of notification" do
      spam_report.destroy!
    end

    it "deleting parent of comment of notification" do
      parent.destroy!
    end

    it "deleting parent of comment of comment on your comment notification" do
      coyc = create(:comment_on_your_comment, project: project, idea: idea, comment: child, initiating_user: initiator, recipient: recipient, spam_report: spam_report)
      parent.destroy!
    end

    it "deleting idea of comment on your comment notification" do
      coyc = create(:comment_on_your_comment, project: project, idea: idea, comment: child, initiating_user: initiator, recipient: recipient, spam_report: spam_report)
      idea.destroy!
    end

    it "deleting project of comment on your comment notification" do
      coyc = create(:comment_on_your_comment, project: project, idea: idea, comment: child, initiating_user: initiator, recipient: recipient, spam_report: spam_report)
      project.destroy!
    end

  end
end