# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::ProjectReviewRequest do
  describe '#make_notifications_on' do
    subject(:notifications) { described_class.make_notifications_on(activity) }

    let(:activity) { create(:activity, item: project_review, action: 'created') }

    let_it_be(:admins) { create_list(:admin, 2) }
    let_it_be(:_folder_moderator) { create(:project_folder_moderator) }

    context 'when the project review has a specific reviewer' do
      let(:project_review) { create(:project_review) }

      it 'creates a notification for the reviewer (only)' do
        expect(notifications.pluck(:recipient_id)).to eq([project_review.reviewer_id])
      end
    end

    context 'when no reviewer is assigned to the project review' do
      let(:project_review) { create(:project_review, reviewer: nil) }

      context 'and project reviewers were configured' do
        let!(:folder) { create(:project_folder, projects: [project_review.project]) }
        let!(:project_reviewers) { create_list(:admin, 2, :project_reviewer) }
        let!(:folder_moderator) { create(:project_folder_moderator, project_folders: [folder]) }

        it 'creates a notification for all project reviewers and (relevant) folder managers' do
          recipients = project_reviewers.pluck(:id) << folder_moderator.id
          expect(notifications.pluck(:recipient_id)).to match_array(recipients)
        end
      end

      context 'and there are no project reviewers/folder managers' do
        it 'creates a notification for all admins' do
          expect(notifications.pluck(:recipient_id)).to match_array(admins.pluck(:id))
        end
      end
    end
  end
end
