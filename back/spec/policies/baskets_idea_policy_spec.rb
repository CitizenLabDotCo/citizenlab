# frozen_string_literal: true

require 'rails_helper'

describe BasketsIdeaPolicy do
  subject { described_class.new(user, baskets_idea) }

  let(:context) { create(:single_phase_single_voting_project).phases.first }
  let(:basket) { create(:basket, phase: context, submitted_at: nil) }
  let!(:baskets_idea) { create(:baskets_idea, basket: basket) }

  let(:scope) { BasketsIdeaPolicy::Scope.new(user, basket.baskets_ideas) }

  context 'for a visitor' do
    let(:user) { nil }

    it { is_expected.not_to permit(:show)    }
    it { is_expected.not_to permit(:create)  }
    it { is_expected.not_to permit(:update)  }
    it { is_expected.not_to permit(:destroy) }

    it 'does not index the baskets_idea' do
      expect(scope.resolve.size).to eq 0
    end
  end

  context 'for a user who is not the basket owner' do
    let(:user) { create(:user) }

    it { is_expected.not_to permit(:show)    }
    it { is_expected.not_to permit(:create)  }
    it { is_expected.not_to permit(:update)  }
    it { is_expected.not_to permit(:destroy) }

    it 'does not index the baskets_idea' do
      expect(scope.resolve.size).to eq 0
    end
  end

  context 'for the basket owner' do
    let(:user) { basket.user }

    it { is_expected.to permit(:show)    }
    it { is_expected.to permit(:create)  }
    it { is_expected.to permit(:update)  }
    it { is_expected.to permit(:destroy) }

    it 'indexes the baskets_idea' do
      expect(scope.resolve.size).to eq 1
    end
  end

  context 'for a submitted basket' do
    let(:basket) { create(:basket, phase: context, submitted_at: Time.now) }
    let(:user) { basket.user }

    it { is_expected.to permit(:show)        }
    it { is_expected.not_to permit(:create)  }
    it { is_expected.not_to permit(:update)  }
    it { is_expected.not_to permit(:destroy) }

    it 'indexes the baskets_idea' do
      expect(scope.resolve.size).to eq 1
    end
  end

  context 'for a moderator' do
    let(:user) { create(:admin) }

    it { is_expected.not_to permit(:show)    }
    it { is_expected.not_to permit(:create)  }
    it { is_expected.not_to permit(:update)  }
    it { is_expected.not_to permit(:destroy) }

    it 'does not index the baskets_idea' do
      expect(scope.resolve.size).to eq 0
    end
  end

  context 'for the basket owner after the voting phase finished' do
    let(:user) { basket.user }
    let(:context) { create(:budgeting_phase, end_at: Date.yesterday) }

    it { is_expected.to permit(:show) }
    it { is_expected.not_to permit(:create)  }
    it { is_expected.not_to permit(:update)  }
    it { is_expected.not_to permit(:destroy) }

    it 'indexes the baskets_idea' do
      expect(scope.resolve.size).to eq 1
    end
  end
end
