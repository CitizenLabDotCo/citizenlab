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

  context "hooks" do
    it "should set the author name on creation" do
      u = create(:user)
      idea = create(:idea, author: u)
      expect(idea.author_name).to eq u.display_name
    end

  end

  context "published at" do
    it "gets set immediately when creating a published idea" do
      t = Time.now
      travel_to t
      idea = create(:idea, publication_status: 'published')
      expect(idea.published_at.to_i).to eq t.to_i
    end

    it "stays empty when creating a draft" do
      idea = create(:idea, publication_status: 'draft')
      expect(idea.published_at).to be_nil
    end

    it "gets filled in when publishing a draft" do
      idea = create(:idea, publication_status: 'draft')
      t = Time.now + 1.week
      travel_to t
      idea.update(publication_status: 'published')
      expect(idea.published_at.to_i).to eq t.to_i
    end

    it "doesn't change again when already published once" do
      t = Time.now
      travel_to t
      idea = create(:idea, publication_status: 'published')
      travel_to t+1.week
      idea.update(publication_status: 'closed')
      travel_to t+1.week
      idea.update(publication_status: 'published')
      expect(idea.published_at.to_i).to eq t.to_i
    end

  end
end
