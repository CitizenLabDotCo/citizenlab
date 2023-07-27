# frozen_string_literal: true

require 'rails_helper'

describe BasketPolicy do
  subject { described_class.new(user, basket) }

  let(:basket) { create(:basket, participation_context: create(:continuous_budgeting_project)) }

  context 'for a mortal user who owns the basket in a project where voting is not permitted' do
    let!(:user) { create(:user) }
    let!(:basket) { create(:basket, user: user, participation_context: project) }
    let!(:project) do
      create(:continuous_budgeting_project, with_permissions: true).tap do |project|
        project.permissions.find_by(action: 'voting')
          .update!(permitted_by: 'admins_moderators')
      end
    end

    it { is_expected.to     permit(:show) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:update) }
    it { is_expected.not_to permit(:destroy) }
  end
end
