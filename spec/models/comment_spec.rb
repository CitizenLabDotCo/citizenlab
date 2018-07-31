require 'rails_helper'

RSpec.describe Comment, type: :model do
  describe "Default factory" do
    it "is valid" do
      expect(build(:comment)).to be_valid
    end
  end

  describe "body sanitizer" do
    it "sanitizes script tags in the body" do
      comment = create(:comment, body_multiloc: {
        "en" => "<p>Test</p><script>This should be removed!</script>"
      })
      expect(comment.body_multiloc).to eq({"en" => "<p>Test</p>This should be removed!"})
    end
  end
end
