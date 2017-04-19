require 'rails_helper'

RSpec.describe Idea, type: :model do
  context "associations" do
    it { should have_many(:votes) }
  end

  context "Default factory" do
    it "is valid" do
      expect(build(:idea)).to be_valid
    end
  end
end
