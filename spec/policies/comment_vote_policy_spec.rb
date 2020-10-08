require 'rails_helper'

describe CommentVotePolicy do

  subject { CommentVotePolicy.new(user, vote) }
  let(:scope) { CommentVotePolicy::Scope.new(user, Vote) }
  let(:project) { create(:continuous_project, with_permissions: true) }
  let(:idea) { create(:idea, project: project)}
  let(:comment) { create(:comment, post: idea)}

  context "for a visitor" do 
    let!(:vote) { create(:vote, votable: comment) }
    let(:user) { nil }

    it { should_not permit(:show) }
    it { should_not permit(:create) }
    it { should_not permit(:up) }
    it { should_not permit(:down) }
    it { should_not permit(:destroy) }

    it "should not index the vote" do
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a mortal user on a vote of another user" do 
    let!(:vote) { create(:vote, votable: comment) }
    let(:user) { create(:user) }

    it { should_not permit(:show) }
    it { should_not permit(:create) }
    it { should_not permit(:up) }
    it { should_not permit(:down) }
    it { should_not permit(:destroy) }

    it "should not index the vote" do
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a mortal user who owns the vote" do
    let!(:vote) { create(:vote, votable: comment) }
    let(:user) { vote.user }

    it { should     permit(:show) }
    it { should     permit(:create) }
    it { should     permit(:up) }
    it { should_not permit(:down) }
    it { should     permit(:destroy) }

    it "should index the vote" do
      expect(scope.resolve.size).to eq 1
    end
  end

  context "for an admin on a vote of another user" do
    let!(:vote) { create(:vote, votable: comment) }
    let(:user) { create(:admin) }

    it { should     permit(:show) }
    it { should_not permit(:create) }
    it { should_not permit(:up) }
    it { should_not permit(:down) }
    it { should_not permit(:destroy) }

    it "should index the vote" do
      expect(scope.resolve.size).to eq 1
    end
  end

  context "for a mortal user who owns the vote on a private project" do
    let(:project) { create(:private_admins_project) }
    let!(:vote) { create(:vote, votable: comment) }
    let(:user) { vote.user }

    it { should permit(:show) }
    it { should_not permit(:create) }
    it { should_not permit(:up) }
    it { should_not permit(:down) }
    it { should_not permit(:destroy) }

    it "should not index the vote" do
      expect(scope.resolve.size).to eq 1
    end
  end

  context "for a mortal user who owns the vote on a project where commenting is disabled" do 
    let(:project) { create(:project, commenting_enabled: false)}
    let!(:vote) { create(:vote, votable: comment) }
    let(:user) { vote.user }

    it { should permit(:show) }
    it { should_not permit(:create) }
    it { should_not permit(:up) }
    it { should_not permit(:down) }
    it { should_not permit(:destroy) }

    it "should index the vote" do
      expect(scope.resolve.size).to eq 1
    end
  end

  context "for a mortal user who owns the vote on a project where commenting is only allowed by admins" do 
    let!(:vote) { create(:vote, votable: comment) }
    let(:user) { vote.user }

    before do
      project.permissions.where(action: 'commenting_idea').first.update!(permitted_by: 'admins_moderators')
    end

    it { should permit(:show) }
    it { should_not permit(:create) }
    it { should_not permit(:up) }
    it { should_not permit(:down) }
    it { should_not permit(:destroy) }

    it "should index the vote" do
      expect(scope.resolve.size).to eq 1
    end
  end

end
