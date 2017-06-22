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
end
