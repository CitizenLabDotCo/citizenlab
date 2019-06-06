require "rails_helper"

describe AvatarsService do
  let(:service) { AvatarsService.new }

  describe "avatars_for_project" do

    it "returns the idea authors in a project" do
      project = create(:project)
      u1, u2, u3, u4, u5 = create_list(:user, 5)
      idea = create(:idea, project: project, author: u1)
      create(:idea, project: project, author: u2)
      create(:vote, votable: idea, user: u3)
      create(:comment, post: idea, author: u4)
      create(:idea, author: u5)

      result = service.avatars_for_project(project, limit: 2)

      expect(result[:total_count]).to eq 4
      expect(result[:users].size).to eq 2
      expect(([u1, u2, u3, u4] - result[:users]).size).to eq 2 
    end

    it "doesn't return the same user twice" do
      project = create(:project)
      u1 = create(:user)
      create(:idea, project: project, author: u1)
      create(:idea, project: project, author: u1)

      expect(service.avatars_for_project(project)).to eq({
        users: [u1],
        total_count: 1
      })
    end
  end

  describe "avatars_for_idea" do

    it "returns the idea and comments authors" do
      idea1, idea2 = create_list(:idea, 2)
      comment1, comment2 = create_list(:comment, 2, post: idea1)
      create(:comment, post: idea2)

      result = service.avatars_for_idea(idea1)

      expect(result[:users].to_a).to match_array [idea1.author, comment1.author, comment2.author]
      expect(result[:total_count]).to eq 3
    end

    it "does not include authors from deleted comments" do
      idea = create(:idea)
      comments = create(:comment, post: idea, publication_status: 'deleted')

      result = service.avatars_for_idea(idea)

      expect(result[:users].to_a).to match_array [idea.author]
      expect(result[:total_count]).to eq 1
    end

    it "does not return the voters" do
      idea = create(:idea)
      idea_vote = create(:vote, votable: idea)
      comment = create(:comment, post: idea)
      comment_vote = create(:vote, votable: comment)

      result = service.avatars_for_idea(idea)

      expect(result[:users].to_a).to match_array [idea.author, comment.author]
      expect(result[:total_count]).to eq 2
    end

    it "doesn't return the same user twice" do
      u1 = create(:user)
      idea = create(:idea, author: u1)
      comments = create_list(:comment, 2, author: u1, post: idea)

      result = service.avatars_for_idea(idea)

      expect(result[:users].to_a).to match_array [u1]
      expect(result[:total_count]).to eq 1
    end
  end

end
