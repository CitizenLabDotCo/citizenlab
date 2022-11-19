# frozen_string_literal: true

require 'rails_helper'

describe UserPolicy do
  subject { described_class.new current_user, subject_user }

  let(:scope) { UserPolicy::Scope.new current_user, User }

  context 'for a moderator' do
    let(:project1) { create :project }
    let(:project2) { create :project }
    let(:current_user) { create :project_moderator, projects: [project1, project2] }

    context 'on theirself' do
      let(:subject_user) { current_user }

      it { is_expected.to     permit(:show)    }
      it { is_expected.to     permit(:update)  }
      it { is_expected.to     permit(:destroy) }
      it { is_expected.to     permit(:index) }
      it { is_expected.not_to permit(:index_xlsx) }

      it 'indexes the user through the scope' do
        subject_user.save!
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'on someone else' do
      let(:subject_user) { create :user }

      it { is_expected.to     permit(:show)    }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:destroy) }
      it { is_expected.to     permit(:index) }
      it { is_expected.not_to permit(:index_xlsx) }

      it 'does not index the user through the scope' do
        subject_user.save!
        expect(scope.resolve.size).to eq 1
      end
    end

    it 'only indexes admins and moderators of the same projects' do
      moderators = [
        create(:project_moderator, projects: [create(:project), project1]),
        create(:project_moderator, projects: [create(:project)]),
        create(:project_moderator, projects: [project2])
      ]
      create(:idea).author
      participant = create(:idea, project: project2).author
      admin = create :admin
      expect(scope.resolve.ids).to match_array [participant.id, current_user.id, moderators[0].id, moderators[2].id, admin.id]
    end
  end
end
