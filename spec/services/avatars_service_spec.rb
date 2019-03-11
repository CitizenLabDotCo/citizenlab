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
      create(:comment, idea: idea, author: u4)
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

  end