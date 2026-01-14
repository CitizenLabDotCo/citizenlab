# frozen_string_literal: true

require 'rails_helper'

describe AdminPublicationPolicy do
  subject { described_class.new(user, admin_publication) }

  let(:scope) { AdminPublicationPolicy::Scope.new(user_context, AdminPublication) }
  let(:user_context) { ApplicationPolicy::UserContext.new(user, context) }
  let(:context) { {} }

  context 'on a public project' do
    let!(:admin_publication) { create(:project).admin_publication }

    context 'for a visitor' do
      let(:user) { nil }

      it { is_expected.not_to permit(:reorder) }

      it 'indexes the project holder' do
        expect(scope.resolve.size).to eq 1
      end

      it 'does not index the project holder if the project is hidden' do
        admin_publication.publication.update!(hidden: true)
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for a resident' do
      let(:user) { create(:user) }

      it { is_expected.not_to permit(:reorder) }

      it 'indexes the project holder' do
        expect(scope.resolve.size).to eq 1
      end

      it 'does not index the project holder if hidden' do
        admin_publication.publication.update!(hidden: true)
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      it { is_expected.to permit(:reorder) }

      it 'indexes the project holder' do
        expect(scope.resolve.size).to eq 1
      end

      it 'does not index the project holder if hidden' do
        admin_publication.publication.update!(hidden: true)
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for a moderator of another project' do
      let(:user) { create(:project_moderator, projects: [create(:project)]) }

      it { is_expected.not_to permit(:reorder) }

      it 'indexes the project holder' do
        expect(scope.resolve.size).to eq 2
      end

      it 'does not index any projects if the publication_status is hidden' do
        admin_publication.publication.update!(hidden: true)
        expect(scope.resolve.size).to eq 1
      end
    end
  end

  context 'on a private admins project' do
    let!(:project) { create(:private_admins_project) }
    let!(:admin_publication) { project.admin_publication }

    context 'for a visitor' do
      let(:user) { nil }

      it { is_expected.not_to permit(:reorder) }

      it 'does not index the project holder' do
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for a resident' do
      let(:user) { create(:user) }

      it { is_expected.not_to permit(:reorder) }

      it 'does not index the project holder' do
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      it { is_expected.to permit(:reorder) }

      it 'indexes the project holder' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for a moderator' do
      let(:user) { create(:project_moderator, projects: [project]) }

      it { is_expected.not_to permit(:reorder) }

      it 'indexes the project holder' do
        expect(scope.resolve.size).to eq 1
      end
    end
  end

  context 'for a visitor on a private groups project' do
    let!(:user) { nil }
    let!(:admin_publication) { create(:private_groups_project).admin_publication }

    it { is_expected.not_to permit(:reorder) }

    it 'does not index the project holder' do
      expect(scope.resolve.size).to eq 0
    end
  end

  context 'when a published folder only has draft projects' do
    let(:draft_project) { create(:project, admin_publication_attributes: { publication_status: 'draft' }) }
    let(:admin_publication) { create(:project_folder, projects: [draft_project]).admin_publication }

    context 'when visitor' do
      let(:user) { nil }

      it { is_expected.not_to permit(:show) }
    end

    context 'when regular user' do
      let(:user) { create(:user) }

      it { is_expected.not_to permit(:show) }
    end

    context 'when admin' do
      let(:user) { create(:admin) }

      it { is_expected.to permit(:show) }
    end
  end
end
