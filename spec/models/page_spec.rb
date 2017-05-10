require 'rails_helper'

RSpec.describe Page, type: :model do

  describe "Default factory" do
    it "is valid" do
      expect(build(:page)).to be_valid
    end
  end

  describe "body sanitizer" do

    it "sanitizes script tags in the body" do
      page = create(:page, body_multiloc: {
        "en" => "<p>Test</p><script>This should be removed!</script>"
      })
      expect(page.body_multiloc).to eq({"en" => "<p>Test</p>This should be removed!"})
    end
    
  end

  describe "slug" do

    it "is valid when it's only containing alphanumeric and hyphens" do
      page = build(:page, slug: 'aBc-123-g3S')
      expect(page).to be_valid
    end

    it "is invalid when there's others than alphanumeric and hyphens" do
      page = build(:page, slug: 'ab_c-.asdf@')
      expect{ page.valid? }.to change{ page.errors[:slug] }
    end

  end


end
