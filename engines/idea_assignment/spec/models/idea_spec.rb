require 'rails_helper'

RSpec.describe Idea, type: :model do
  describe '#assignee' do
    let(:idea) { build(:idea) }

    it "is invalid when it\'s not an admin or project moderator" do
      idea.assignee = build_stubbed(:user)
      expect(idea).to be_invalid
    end

    it "is invalid when it\'s a a project moderator of a different project" do
      idea.assignee = build(:moderator)
      expect(idea).to be_invalid
    end

    it "is valid when it\'s a an admin" do
      idea.assignee = build(:admin)
      expect(idea).to be_valid
    end

    it "is valid when it\'s a project moderator of the same project" do
      idea.update(project: create(:project)) # Project must have an ID
      idea.assignee = build(:moderator, project: idea.project)
      expect(idea).to be_valid
    end

    it 'is valid when nil' do
      idea.assignee = nil
      expect(idea).to be_valid
    end
  end
end
