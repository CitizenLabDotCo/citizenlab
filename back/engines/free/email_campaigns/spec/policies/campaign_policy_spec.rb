# frozen_string_literal: true

require 'rails_helper'

describe EmailCampaigns::CampaignPolicy do
  subject { described_class.new(user, context_campaign) }

  let(:scope) { EmailCampaigns::CampaignPolicy::Scope.new(user, context_campaign.class, context_campaign.context) }
  let(:context) { create(:phase) }
  let!(:global_campaign) { create(:comment_on_your_comment_campaign, context: nil) }
  let!(:context_campaign) { create(:comment_on_your_comment_campaign, context: context) }

  context 'for a visitor' do
    let(:user) { nil }

    it { is_expected.not_to permit(:show)    }
    it { is_expected.not_to permit(:create)  }
    it { is_expected.not_to permit(:update)  }
    it { is_expected.not_to permit(:destroy) }

    it 'does not index the campaign' do
      expect(scope.resolve.size).to eq 0
    end
  end

  context 'for a resident' do
    let(:user) { create(:user) }

    it { is_expected.not_to permit(:show)    }
    it { is_expected.not_to permit(:create)  }
    it { is_expected.not_to permit(:update)  }
    it { is_expected.not_to permit(:destroy) }

    it 'does not index the campaign' do
      expect(scope.resolve.size).to eq 0
    end
  end

  context 'for an admin' do
    let(:user) { create(:admin) }

    it { is_expected.to permit(:show) }
    it { is_expected.to permit(:create) }
    it { is_expected.to permit(:update)  }
    it { is_expected.to permit(:destroy) }

    it 'indexes the campaign' do
      expect(scope.resolve.size).to eq 1
    end
  end

  context 'for a project moderator' do
    let(:phase) { create(:phase) }
    let(:user) { create(:project_moderator, projects: [phase.project]) }

    context 'of a project they moderate' do
      let(:context) { phase }

      it { is_expected.to permit(:show) }
      it { is_expected.to permit(:create) }
      it { is_expected.to permit(:update) }
      it { is_expected.to permit(:destroy) }

      it 'indexes the campaign' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'of a project they don\'t moderate' do
      let(:phase) { create(:phase) }

      it { is_expected.not_to permit(:show) }
      it { is_expected.not_to permit(:create) }
      it { is_expected.not_to permit(:update) }
      it { is_expected.not_to permit(:destroy) }

      it 'does not index the campaign' do
        expect(scope.resolve.size).to eq 0
      end
    end
  end
end
