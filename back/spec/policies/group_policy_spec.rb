require 'rails_helper'

describe GroupPolicy do
  subject { GroupPolicy.new(user, group) }
  let(:scope) { GroupPolicy::Scope.new(user, Group) }

  context 'on normal group' do
    let!(:group) { create(:group) }

    context 'for a visitor' do
      let(:user) { nil }

      it { is_expected.to_not permit(:show)    }
      it { is_expected.to_not permit(:create)  }
      it { is_expected.to_not permit(:update)  }
      it { is_expected.to_not permit(:destroy) }

      it 'should not index the group' do
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for a mortal user' do
      let(:user) { create(:user) }

      it { is_expected.to_not permit(:show)    }
      it { is_expected.to_not permit(:create)  }
      it { is_expected.to_not permit(:update)  }
      it { is_expected.to_not permit(:destroy) }

      it 'should not index the group' do
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      it { is_expected.to    permit(:show)    }
      it { is_expected.to    permit(:create)  }
      it { is_expected.to    permit(:update)  }
      it { is_expected.to    permit(:destroy) }

      it 'should index the group' do
        expect(scope.resolve.size).to eq 1
      end
    end
  end
end
