# frozen_string_literal: true

require 'rails_helper'

describe BasketPolicy do
  subject { described_class.new(user, basket) }

  let(:basket) { create(:basket, participation_context: create(:continuous_budgeting_project)) }

  context 'for a moderator of the project to which the basket belongs' do
    let(:user) { create(:project_moderator, projects: [basket.participation_context.project]) }

    it { is_expected.to permit(:show)    }
    it { is_expected.to permit(:create)  }
    it { is_expected.to permit(:update)  }
    it { is_expected.to permit(:destroy) }
  end

  context 'for a moderator of another project' do
    let(:user) { create(:project_moderator, projects: [create(:project)]) }

    it { is_expected.not_to permit(:show)    }
    it { is_expected.not_to permit(:create)  }
    it { is_expected.not_to permit(:update)  }
    it { is_expected.not_to permit(:destroy) }
  end
end
