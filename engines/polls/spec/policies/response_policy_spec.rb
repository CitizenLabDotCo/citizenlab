require 'rails_helper'

describe Polls::ResponsePolicy do

  subject { Polls::ResponsePolicy.new(user, response) }
  let(:scope) { Polls::ResponsePolicy::Scope.new(user, Polls::Response) }
  let(:pc) { create(:continuous_poll_project, with_permissions: true) }
  let!(:response) { build(:poll_response, participation_context: pc) }

  context "for a visitor" do 
    let(:user) { nil }

    it { should_not permit(:create) }

    it "should not index the response" do
      response.save!
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a mortal user on response of another user" do 
    let(:user) { create(:user) }

    it { should_not permit(:create) }

    it "should not index the response" do
      response.save!
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a mortal user who owns the response" do 
    let(:user) { response.user }

    it { should permit(:create) }

    it "should not index the response" do
      response.save!
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for an admin that doesn't own the response" do 
    let(:user) { create(:admin) }

    it { should_not permit(:create) }

    it "should index the response" do
      response.save!
      expect(scope.resolve.size).to eq 1
    end
  end

  context "for a moderator of the response's project that doesn't own the response" do 
    let(:user) { create(:moderator, project: pc) }

    it { should_not permit(:create) }

    it "should index the response" do
      response.save!
      expect(scope.resolve.size).to eq 1
    end
  end

  context "for a moderator of another project that owns the response" do 
    let(:user) { create(:moderator) }
    let!(:response) { build(:poll_response, user: user, participation_context: pc) }

    it { should permit(:create) }

    it "should not index the response" do
      response.save!
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a mortal user who owns the response in a private groups project where she's not member of a manual group with access" do
    let!(:user) { create(:user) }
    let!(:project) { create(:private_groups_project, participation_method: 'poll', with_permissions: true) }
    let!(:response) { create(:poll_response, participation_context: project, user: user) }

    it { should_not permit(:create) }

    it "should not index the response"  do
      response.save!
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a mortal user who owns the response in a project where taking a poll is not permitted" do
    let!(:user) { create(:user) }
    let!(:project) { 
      p = create(:continuous_poll_project, with_permissions: true).tap do |p|
        p.permissions.find_by(action: 'taking_poll').update!(permitted_by: 'admins_moderators')
      end
    }

    let!(:response) { create(:poll_response, participation_context: project, user: user) }


    it { should_not permit(:create) }

    it "should not index the response"  do
      response.save!
      expect(scope.resolve.size).to eq 0
    end
  end

end
