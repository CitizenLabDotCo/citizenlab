# frozen_string_literal: true

require 'rails_helper'

describe FollowerPolicy do
  subject { described_class.new(user, follower) }

  let(:follower) { create(:follower, followable: followable) }
  let(:scope) { FollowerPolicy::Scope.new(user, followable.followers) }

  context 'in a public project' do
    let(:followable) { create(:continuous_project) }

    context 'for a visitor' do
      let(:user) { nil }

      it { is_expected.not_to permit(:show)    }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:destroy) }

      it 'does not index the follower' do
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for a resident' do
      let(:user) { create(:user) }

      it { is_expected.not_to permit(:show)    }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:destroy) }

      it 'does not index the follower' do
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for the following user' do
      let(:user) { follower.user }

      it { is_expected.to permit(:show)    }
      it { is_expected.to permit(:create)  }
      it { is_expected.to permit(:destroy) }

      it 'indexes the follower' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      it { is_expected.not_to permit(:show)    }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:destroy) }

      it 'does not index the follower' do
        expect(scope.resolve.size).to eq 0
      end
    end
  end

  context 'in a private groups project' do
    let(:followable) { create(:private_groups_project) }

    context 'for a resident' do
      let(:user) { create(:user) }

      it { is_expected.not_to permit(:show)    }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:destroy) }

      it 'does not index the follower' do
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for the following user' do
      let(:user) { follower.user }

      it { is_expected.to     permit(:show) }
      it { is_expected.not_to permit(:create) }
      it { is_expected.to     permit(:destroy) }

      it 'does not index the follower' do
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      it { is_expected.not_to permit(:show)    }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:destroy) }

      it 'does not index the follower' do
        expect(scope.resolve.size).to eq 0
      end
    end
  end
end
