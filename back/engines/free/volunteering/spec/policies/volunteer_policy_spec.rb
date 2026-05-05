# frozen_string_literal: true

require 'rails_helper'

describe Volunteering::VolunteerPolicy do
  subject { described_class.new(user, volunteer) }

  let(:scope) { described_class::Scope.new(user, cause.volunteers) }

  context 'on volunteer in a public project' do
    let!(:space) { create(:space) }
    let(:project) { create(:single_phase_volunteering_project, space: space) }
    let!(:folder) { create(:project_folder, projects: [project], space: space) }
    let(:cause) { create(:cause, phase: project.phases.first) }
    let!(:volunteer) { create(:volunteer, cause: cause) }

    shared_examples 'has moderator volunteer access' do
      it { is_expected.not_to permit(:create) }
      it { is_expected.not_to permit(:destroy) }
      it { is_expected.to permit(:index_xlsx) }

      it 'indexes the volunteer' do
        expect(scope.resolve).to include(volunteer)
      end
    end

    shared_examples 'has out-of-scope moderator volunteer access' do
      it { is_expected.not_to permit(:create) }
      it { is_expected.not_to permit(:destroy) }
      it { is_expected.to permit(:index_xlsx) }

      it 'does not index the volunteer' do
        expect(scope.resolve).not_to include(volunteer)
      end
    end

    context 'for a visitor' do
      let(:user) { nil }

      it { is_expected.not_to permit(:create) }
      it { is_expected.not_to permit(:destroy) }
      it { is_expected.not_to permit(:index_xlsx) }

      it 'does not index the volunteer' do
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for a resident' do
      let(:user) { create(:user) }

      it { is_expected.not_to permit(:create) }
      it { is_expected.not_to permit(:destroy) }
      it { is_expected.not_to permit(:index_xlsx) }

      it 'does not index the volunteer' do
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      it_behaves_like 'has moderator volunteer access'
    end

    context 'for a project moderator who can moderate' do
      let(:user) { create(:project_moderator, projects: [project]) }

      it_behaves_like 'has moderator volunteer access'
    end

    context 'for a project moderator who cannot moderate' do
      let(:user) { create(:project_moderator) }

      it_behaves_like 'has out-of-scope moderator volunteer access'
    end

    context 'for a folder moderator who can moderate' do
      let(:user) { create(:project_folder_moderator, project_folders: [folder]) }

      it_behaves_like 'has moderator volunteer access'
    end

    context 'for a folder moderator who cannot moderate' do
      let(:user) { create(:project_folder_moderator) }

      it_behaves_like 'has out-of-scope moderator volunteer access'
    end

    context 'for a space moderator who can moderate' do
      let(:user) { create(:space_moderator, spaces: [space]) }

      it_behaves_like 'has moderator volunteer access'
    end

    context 'for a space moderator who cannot moderate' do
      let(:user) { create(:space_moderator) }

      it_behaves_like 'has out-of-scope moderator volunteer access'
    end

    context 'for the volunteer' do
      let(:user) { volunteer.user }

      it { is_expected.to permit(:create) }
      it { is_expected.to permit(:destroy) }
      it { is_expected.not_to permit(:index_xlsx) }

      it 'does not index the volunteer' do
        expect(scope.resolve.size).to eq 0
      end
    end
  end
end
