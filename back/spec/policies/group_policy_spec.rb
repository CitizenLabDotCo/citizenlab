require 'rails_helper'

describe GroupPolicy do
  subject { GroupPolicy.new(user, group) }
  let(:scope) { GroupPolicy::Scope.new(user, Group) }

  context "on normal group" do 
    let!(:group) { create(:group) }

    context "for a visitor" do
      let(:user) { nil }

      it { should_not permit(:show)    }
      it { should_not permit(:create)  }
      it { should_not permit(:update)  }
      it { should_not permit(:destroy) }

      it "should not index the group" do
        expect(scope.resolve.size).to eq 0
      end
    end

    context "for a mortal user" do
      let(:user) { create(:user) }

      it { should_not permit(:show)    }
      it { should_not permit(:create)  }
      it { should_not permit(:update)  }
      it { should_not permit(:destroy) }

      it "should not index the group" do
        expect(scope.resolve.size).to eq 0
      end
    end

    context "for an admin" do
      let(:user) { create(:admin) }

      it { should    permit(:show)    }
      it { should    permit(:create)  }
      it { should    permit(:update)  }
      it { should    permit(:destroy) }

      it "should index the group" do
        expect(scope.resolve.size).to eq 1
      end
    end
  end
end