require "rails_helper"

describe AvatarsService do
  let(:service) { AvatarsService.new }

  describe "avatars_for_project" do

    it "returns the idea authors in a project" do
      project = create(:project)
      u1, u2, u3, u4 = create_list(:user, 4)
      create(:idea, project: project, author: u1)
      create(:idea, project: project, author: u2)
      create(:idea, project: project, author: u3)
      create(:idea, author: u4)

      result = service.avatars_for_project(project, limit: 2)

      expect(result[:total_count]).to eq 3
      expect(result[:users].size).to eq 2
      expect(([u1, u2, u3] - result[:users]).size).to eq 1 
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