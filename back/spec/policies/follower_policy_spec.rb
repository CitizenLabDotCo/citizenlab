# frozen_string_literal: true

require 'rails_helper'

describe FollowerPolicy do
  subject { described_class.new(user, follower) }

  let(:following_user) { create(:user) }
  let!(:follower) { create(:follower, followable: followable, user: following_user) }
  let(:scope) { FollowerPolicy::Scope.new(user, followable.followers) }

  context 'in a public project' do
    let(:followable) { create(:single_phase_ideation_project) }

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
      let(:user) { following_user }

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
      let(:user) { following_user }

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

  context 'for an idea' do
    let(:member) { create(:user) }
    let(:project) { create(:private_groups_project, user: member) }
    let(:followable) { create(:idea, project: project) }

    context 'for a resident with project access' do
      let(:user) { member }

      it { is_expected.not_to permit(:show) }
      it { is_expected.not_to permit(:create) }
      it { is_expected.not_to permit(:destroy) }

      it 'does not index the follower' do
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for the following user with project access' do
      let(:member) { following_user }
      let(:user) { following_user }

      it { is_expected.to permit(:show) }
      it { is_expected.to permit(:create) }
      it { is_expected.to permit(:destroy) }

      it 'indexes the follower' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for the following user without project access' do
      let(:user) { following_user }

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

  context 'for a folder' do
    let(:followable) { create(:project_folder) }

    context 'for a resident' do
      let(:user) { create(:user) }

      it { is_expected.not_to permit(:show) }
      it { is_expected.not_to permit(:create) }
      it { is_expected.not_to permit(:destroy) }

      it 'does not index the follower' do
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for the following user' do
      let(:user) { following_user }

      it { is_expected.to permit(:show) }
      it { is_expected.to permit(:create) }
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

  context 'for a topic' do
    let(:followable) { create(:topic) }

    context 'for a resident' do
      let(:user) { create(:user) }

      it { is_expected.not_to permit(:show) }
      it { is_expected.not_to permit(:create) }
      it { is_expected.not_to permit(:destroy) }

      it 'does not index the follower' do
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for the following user' do
      let(:user) { following_user }

      it { is_expected.to permit(:show) }
      it { is_expected.to permit(:create) }
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

  context 'for an area' do
    let(:followable) { create(:area) }

    context 'for a resident' do
      let(:user) { create(:user) }

      it { is_expected.not_to permit(:show) }
      it { is_expected.not_to permit(:create) }
      it { is_expected.not_to permit(:destroy) }

      it 'does not index the follower' do
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for the following user' do
      let(:user) { following_user }

      it { is_expected.to permit(:show) }
      it { is_expected.to permit(:create) }
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
end
