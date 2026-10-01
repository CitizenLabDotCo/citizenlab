# frozen_string_literal: true

require 'rails_helper'

describe IdeaCustomFields::SurveyGenerationPolicy do
  subject(:policy) { described_class.new(user, phase.reload) }

  let(:project) { create(:project, :draft) }
  let(:phase) { create(:native_survey_phase, project: project) }

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

    context 'when the phase is not a native survey' do
      let(:phase) { create(:information_phase, project: project) }

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

    context 'when the survey already has responses' do
      before do
        create(:idea_status_proposed)
        create(:native_survey_response, project: project, creation_phase: phase)
      end

      it { is_expected.not_to permit(:create) }
    end
  end
end
