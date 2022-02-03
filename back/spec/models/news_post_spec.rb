require 'rails_helper'

RSpec.describe NewsPost, type: :model do
  describe "Default factory" do
    it "is valid" do
      expect(build(:news_post)).to be_valid
    end
  end

  describe "body sanitizer" do
    it "sanitizes script tags in the body" do
      post = create(:news_post, body_multiloc: {
        "en" => "<p>Test</p><script>This should be removed!</script>"
      })
      expect(post.body_multiloc).to eq({"en" => "<p>Test</p>This should be removed!"})
    end
  end

  describe "slug" do
    it "should generate a slug on creation" do
      post = create(:news_post, slug: nil)
      expect(post.slug).to be_present
    end
  end
end
