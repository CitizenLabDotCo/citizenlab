require 'rails_helper'

RSpec.describe Notification, type: :model do
  describe "Default factory" do
    it "is valid" do
      expect(build(:notification)).to be_valid
    end
  end

  describe "comment_on_your_comment factory" do
    it "is valid" do
      expect(build(:comment_on_your_comment)).to be_valid
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
        expect(build(notification_subclass.model_name.element.to_sym)).to be_valid
      end
    end
  end
end
