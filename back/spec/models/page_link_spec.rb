require 'rails_helper'

RSpec.describe PageLink, type: :model do
  describe "Default factory" do
    it "is valid" do
      expect(build(:page_link, linking_page: build(:page), linked_page: build(:page))).to be_valid
    end
  end
end
