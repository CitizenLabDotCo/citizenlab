# frozen_string_literal: true

require 'rails_helper'

skip_reason = defined?(EmailCampaigns::Engine) ? nil : "email_campaigns engine is not installed"

describe EmailCampaigns::CampaignPolicy, skip: skip_reason do
  subject { described_class.new(user, campaign) }

  let(:scope) { EmailCampaigns::CampaignPolicy::Scope.new(user, campaign.class) }

  context 'on a manual campaign' do
    let!(:campaign) { create(:manual_campaign) }

    context 'for a project moderator' do
      let(:user) { create(:project_moderator, projects: [project]) }

      context 'of a public project' do
        let(:project) { create(:project) }

        it { is_expected.to permit(:show) }
        it { is_expected.to permit(:create) }
        it { is_expected.to permit(:update) }
        it { is_expected.to permit(:destroy) }

        it 'indexes the campaign' do
          expect(scope.resolve.size).to eq 1
        end
      end

      context 'of a private admins project' do
        let(:project) { create(:private_admins_project) }

        it { is_expected.not_to permit(:show) }
        it { is_expected.not_to permit(:create) }
        it { is_expected.not_to permit(:update) }
        it { is_expected.not_to permit(:destroy) }

        it 'does not index the campaign' do
          expect(scope.resolve.size).to eq 0
        end
      end

      context 'of a private groups project on a campaign without groups' do
        let(:project) { create(:private_groups_project) }

        it { is_expected.not_to permit(:show) }
        it { is_expected.not_to permit(:create) }
        it { is_expected.not_to permit(:update) }
        it { is_expected.not_to permit(:destroy) }

        it 'does not index the campaign' do
          expect(scope.resolve.size).to eq 0
        end
      end

      context 'of a private groups project on a campaign with that group' do
        let(:project) { create(:private_groups_project) }

        before do
          campaign.update(groups: [project.groups.first])
        end

        it { is_expected.to permit(:show) }
        it { is_expected.to permit(:create) }
        it { is_expected.to permit(:update) }
        it { is_expected.to permit(:destroy) }

        it 'indexes the campaign' do
          expect(scope.resolve.size).to eq 1
        end
      end

      context 'of a private groups project on a campaign with another group' do
        let(:project) { create(:private_groups_project) }

        before do
          campaign.update(groups: [create(:group)])
        end

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

  context 'on an automated campaign' do
    let!(:campaign) { create(:comment_on_your_comment_campaign) }

    context 'for a project moderator' do
      let(:user) { create(:project_moderator, projects: [project]) }

      context 'of a public project' do
        let(:project) { create(:project) }

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
end
