require 'rails_helper'

describe InitiativeVotePolicy do
  subject(:policy) { InitiativeVotePolicy.new(user, vote) }
  let(:scope) { InitiativeVotePolicy::Scope.new(user, Vote) }
  let(:votable) { create(:initiative)}
  let!(:vote) { create(:vote, votable: votable) }

  context "for a visitor" do 
  	let(:user) { nil }

    it { should_not permit(:show) }
    it { should_not permit(:create) }
    it { should_not permit(:up) }
    it { expect { policy.down? }.to raise_error(Pundit::NotAuthorizedError) }
    it { should_not permit(:destroy) }

    it "should not index the vote" do
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a mortal user on a vote of another user" do 
  	let(:user) { create(:user) }

    it { should_not permit(:show) }
    it { should_not permit(:create) }
    it { should_not permit(:up) }
    it { expect { policy.down? }.to raise_error(Pundit::NotAuthorizedError) }
    it { should_not permit(:destroy) }

    it "should not index the vote" do
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a mortal user who owns the vote" do 
  	let(:user) { vote.user }

    it { should     permit(:show) }
    it { should     permit(:create) }
    it { should     permit(:up) }
    it { expect { policy.down? }.to raise_error(Pundit::NotAuthorizedError) }
    it { should     permit(:destroy) }

    it "should index the vote" do
      expect(scope.resolve.size).to eq 1
    end
  end

  context "for an admin" do 
  	let(:user) { create(:admin) }

    it { should     permit(:show) }
    it { should_not permit(:create) }
    it { should_not permit(:up) }
    it { expect { policy.down? }.to raise_error(Pundit::NotAuthorizedError) }
    it { should_not permit(:destroy) }

    it "should index the vote" do
      expect(scope.resolve.size).to eq 1
    end
  end

end
