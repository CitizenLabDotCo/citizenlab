# frozen_string_literal: true

require 'rails_helper'

describe BasketPolicy do
  subject { described_class.new(user, basket) }

  let(:context) { create(:continuous_budgeting_project) }
  let(:basket) { create(:basket, participation_context: context) }

  context 'for a visitor' do
    let(:user) { nil }

    it { is_expected.not_to permit(:show)    }
    it { is_expected.not_to permit(:create)  }
    it { is_expected.not_to permit(:update)  }
    it { is_expected.not_to permit(:destroy) }
  end

  context 'for a user who is not the basket owner' do
    let(:user) { create(:user) }

    it { is_expected.not_to permit(:show)    }
    it { is_expected.not_to permit(:create)  }
    it { is_expected.not_to permit(:update)  }
    it { is_expected.not_to permit(:destroy) }
  end

  context 'for a user who is the basket owner' do
    let(:user) { basket.user }

    it { is_expected.to permit(:show)    }
    it { is_expected.to permit(:create)  }
    it { is_expected.to permit(:update)  }
    it { is_expected.to permit(:destroy) }
  end

  context 'for blocked basket owner' do
    let(:user) { create(:user, block_end_at: 5.days.from_now) }
    let(:basket) { create(:basket, user: user, participation_context: create(:continuous_budgeting_project)) }

    it_behaves_like 'policy for blocked user', show: false
  end

  context 'for an admin' do
    let(:user) { create(:admin) }

    it { is_expected.not_to permit(:show)    }
    it { is_expected.not_to permit(:create)  }
    it { is_expected.not_to permit(:update)  }
    it { is_expected.not_to permit(:destroy) }
  end

  context "for a user on a basket in a private groups project where she's not member of a manual group with access" do
    let!(:user) { create(:user) }
    let!(:project) { create(:private_groups_continuous_budgeting_project) }
    let!(:basket) { create(:basket, user: user, participation_context: project) }

    it { is_expected.to     permit(:show)    }
    it { is_expected.not_to permit(:create)  }
    it { is_expected.not_to permit(:update)  }
    it { is_expected.not_to permit(:destroy) }
  end

  context "for a user on a basket in a private groups project where she's a member of a manual group with access" do
    let!(:user) { create(:user) }
    let!(:project) { create(:private_groups_continuous_budgeting_project, user: user) }
    let!(:basket) { create(:basket, user: user, participation_context: project) }

    it { is_expected.to permit(:show)    }
    it { is_expected.to permit(:create)  }
    it { is_expected.to permit(:update)  }
    it { is_expected.to permit(:destroy) }
  end

  context 'for a moderator of the project to which the basket belongs' do
    let(:user) { create(:project_moderator, projects: [basket.participation_context.project]) }

    it { is_expected.not_to permit(:show)    }
    it { is_expected.not_to permit(:create)  }
    it { is_expected.not_to permit(:update)  }
    it { is_expected.not_to permit(:destroy) }
  end

  context 'for a moderator of another project' do
    let(:user) { create(:project_moderator, projects: [create(:project)]) }

    it { is_expected.not_to permit(:show)    }
    it { is_expected.not_to permit(:create)  }
    it { is_expected.not_to permit(:update)  }
    it { is_expected.not_to permit(:destroy) }
  end

  context 'for a moderator after the voting phase finished' do
    let(:user) { create(:admin) }
    let(:context) { create(:budgeting_phase, end_at: Date.yesterday) }

    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:create)  }
    it { is_expected.not_to permit(:update)  }
    it { is_expected.not_to permit(:destroy) }
  end
end
