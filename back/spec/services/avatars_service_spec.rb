# frozen_string_literal: true

require 'rails_helper'

describe AvatarsService do
  let(:service) { described_class.new }

  before do
    Analytics::PopulateDimensionsService.populate_types
  end

  describe 'avatars_for_project' do
    it 'returns the idea authors in a project' do
      project = create(:project)
      u1, u2, u3, u4, u5 = create_list(:user, 5)
      idea = create(:idea, project: project, author: u1)
      create(:idea, project: project, author: u2)
      create(:reaction, reactable: idea, user: u3)
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

      result = service.avatars_for_project(project)

      expect(result[:total_count]).to eq 1
      expect(result[:users].map(&:id)).to contain_exactly(u1.id)
    end
  end

  describe 'avatars_for_folder' do
    it 'returns avatars for participants in a folder' do
      projects = create_list(:project, 2)
      folder = create(:project_folder, projects: projects)
      u1, u2, u3, u4, u5 = create_list(:user, 5)
      idea = create(:idea, project: projects.first, author: u1)
      create(:idea, project: projects.last, author: u2)
      create(:reaction, reactable: idea, user: u3)
      create(:comment, idea: idea, author: u4)
      create(:idea, author: u5)

      result = service.avatars_for_folder(folder, limit: 2)

      expect(result[:total_count]).to eq 4
      expect(result[:users].size).to eq 2
      expect(([u1, u2, u3, u4] - result[:users]).size).to eq 2
    end
  end

  describe 'avatars_for_idea' do
    it 'returns the idea and comments authors' do
      idea1, idea2 = create_list(:idea, 2)
      comment1, comment2 = create_list(:comment, 2, idea: idea1)
      create(:comment, idea: idea2)

      result = service.avatars_for_idea(idea1)

      expect(result[:total_count]).to eq 3
      expect(result[:users].map(&:id)).to contain_exactly(idea1.author.id, comment1.author.id, comment2.author.id)
    end

    it 'does not include authors from deleted comments' do
      idea = create(:idea)
      create(:comment, idea: idea, publication_status: 'deleted')

      result = service.avatars_for_idea(idea)

      expect(result[:total_count]).to eq 1
      expect(result[:users].map(&:id)).to contain_exactly(idea.author.id)
    end

    it 'does not return the reactors' do
      idea = create(:idea)
      create(:reaction, reactable: idea)
      comment = create(:comment, idea: idea)
      create(:reaction, reactable: comment)

      result = service.avatars_for_idea(idea)

      expect(result[:total_count]).to eq 2
      expect(result[:users].map(&:id)).to contain_exactly(idea.author.id, comment.author.id)
    end

    it "doesn't return the same user twice" do
      u1 = create(:user)
      idea = create(:idea, author: u1)
      create_list(:comment, 2, author: u1, idea: idea)

      result = service.avatars_for_idea(idea)

      expect(result[:total_count]).to eq 1
      expect(result[:users].map(&:id)).to contain_exactly(u1.id)
    end
  end
end
