# frozen_string_literal: true

require 'rails_helper'

describe AdminPublicationPolicy do
  subject { described_class.new(user, admin_publication) }

  let(:scope) { AdminPublicationPolicy::Scope.new(user, AdminPublication) }

  context 'on a public project' do
    let!(:admin_publication) { create(:project).admin_publication }

    context 'for a moderator of another project' do
      let(:user) { create(:project_moderator, projects: [create(:project)]) }

      it { is_expected.not_to permit(:reorder) }

      it 'indexes the project holder' do
        expect(scope.resolve.size).to eq 2
      end
    end
  end

  context 'on a private admins project' do
    let!(:project) { create(:private_admins_project) }
    let!(:admin_publication) { project.admin_publication }

    context 'for a moderator' do
      let(:user) { create(:project_moderator, projects: [project]) }

      it { is_expected.not_to permit(:reorder) }

      it 'indexes the project holder' do
        expect(scope.resolve.size).to eq 1
      end
    end
  end
end
