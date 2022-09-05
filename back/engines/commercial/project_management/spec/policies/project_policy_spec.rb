# frozen_string_literal: true

require 'rails_helper'

describe ProjectPolicy do
  subject { described_class.new(user, project) }

  let(:scope) { ProjectPolicy::Scope.new(user, Project) }
  let(:inverse_scope) { ProjectPolicy::InverseScope.new(project, User) }

  context 'on a public project' do
    let!(:project) { create(:project) }

    context 'for a moderator of another project' do
      let(:user) { create(:project_moderator, projects: [create(:project)]) }

      it { is_expected.to permit(:show) }
      it { is_expected.not_to permit(:create) }
      it { is_expected.not_to permit(:update) }
      it { is_expected.not_to permit(:reorder) }
      it { is_expected.not_to permit(:destroy) }

      it 'indexes the project' do
        expect(scope.resolve.size).to eq 2
      end

      it 'includes the user in the users that have access' do
        expect(inverse_scope.resolve).to include(user)
      end
    end
  end

  context 'on a private admins project' do
    let!(:project) { create(:private_admins_project) }

    context 'for a moderator' do
      let(:user) { create(:project_moderator, projects: [project]) }

      it { is_expected.to permit(:show) }
      it { is_expected.not_to permit(:create) }
      it { is_expected.to permit(:update) }
      it { is_expected.to permit(:reorder) }
      it { is_expected.not_to permit(:destroy) }

      it 'indexes the project' do
        expect(scope.resolve.size).to eq 1
      end

      it 'includes the user in the users that have access' do
        expect(inverse_scope.resolve).to include(user)
      end
    end
  end

  context 'on a draft project' do
    let!(:project) { create(:project, admin_publication_attributes: { publication_status: 'draft' }) }

    context 'for a moderator' do
      let(:user) { create(:project_moderator, projects: [project]) }

      it { is_expected.to permit(:show) }
      it { is_expected.not_to permit(:create) }
      it { is_expected.to permit(:update) }
      it { is_expected.to permit(:reorder) }
      it { is_expected.not_to permit(:destroy) }

      it 'indexes the project' do
        expect(scope.resolve.size).to eq 1
      end

      it 'includes the user in the users that have access' do
        expect(inverse_scope.resolve).to include(user)
      end
    end

    context 'for a moderator of another project' do
      let(:user) { create(:project_moderator) }

      it { is_expected.not_to permit(:show) }
      it { is_expected.not_to permit(:create) }
      it { is_expected.not_to permit(:update) }
      it { is_expected.not_to permit(:reorder) }
      it { is_expected.not_to permit(:destroy) }

      it { expect(scope.resolve).not_to include(project) }
      it { expect(inverse_scope.resolve).not_to include(user) }
    end
  end
end
