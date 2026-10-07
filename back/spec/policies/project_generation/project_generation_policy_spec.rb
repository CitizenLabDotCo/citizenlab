# frozen_string_literal: true

require 'rails_helper'

describe ProjectGeneration::ProjectGenerationPolicy do
  subject(:policy) { described_class.new(user, project.reload) }

  let(:project) { create(:project, :draft) }

  context 'for a visitor' do
    let(:user) { nil }

    it { is_expected.not_to permit(:create) }
  end

  context 'for a resident' do
    let(:user) { create(:user) }

    it { is_expected.not_to permit(:create) }
  end

  context 'for a moderator of another project' do
    let(:user) { create(:project_moderator, projects: [create(:project)]) }

    it { is_expected.not_to permit(:create) }
  end

  context 'for a moderator of the project' do
    let(:user) { create(:project_moderator, projects: [project]) }

    it { is_expected.to permit(:create) }
  end

  context 'for an admin' do
    let(:user) { create(:admin) }

    it { is_expected.to permit(:create) }

    context 'when the project already has a phase' do
      before { create(:phase, project: project) }

      it { is_expected.not_to permit(:create) }
    end

    context 'when the project is published' do
      let(:project) { create(:project) }

      it { is_expected.not_to permit(:create) }

      context 'on a demo platform' do
        before { change_lifecycle_stage('demo') }

        it { is_expected.to permit(:create) }
      end
    end
  end
end
