require 'rails_helper'

describe VotePolicy do
  subject { VotePolicy.new(user, vote) }
  let(:scope) { VotePolicy::Scope.new(user, Vote) }
  let!(:vote) { create(:vote) }

  context "for a visitor" do 
  	let(:user) { nil }

    it { should_not permit(:show) }
    it { should_not permit(:create) }
    it { should_not permit(:up) }
    it { should_not permit(:down) }
    it { should_not permit(:destroy) }

    it "should index the vote" do
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a mortal user" do 
  	let(:user) { create(:user) }

    it { should_not permit(:show) }
    it { should_not permit(:create) }
    it { should_not permit(:up) }
    it { should_not permit(:down) }
    it { should_not permit(:destroy) }

    it "should index the vote" do
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a mortal user who owns the vote" do 
  	let(:user) { vote.user }

    it { should permit(:show) }
    it { should permit(:create) }
    it { should permit(:up) }
    it { should permit(:down) }
    it { should permit(:destroy) }

    it "should index the vote" do
      expect(scope.resolve.size).to eq 1
    end
  end

  context "for an admin" do 
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

end