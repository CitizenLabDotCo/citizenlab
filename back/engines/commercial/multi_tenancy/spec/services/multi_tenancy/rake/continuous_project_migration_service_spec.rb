# frozen_string_literal: true

require 'rails_helper'

RSpec.describe MultiTenancy::Rake::ContinuousProjectMigrationService do
  subject(:service) { described_class.new }

  shared_examples 'project_settings' do
    it 'should list number of projects & successful migrations' do
      expect(service.stats).to eq({ projects: 1, success: 1, errors: [] })
    end

    it 'changes the project type' do
      expect(project.reload.process_type).to eq 'timeline'
    end

    it 'creates a single open ended phase for the project' do
      expect(project.phases.count).to eq 1
      expect(project.phases.first.end_at).to be_nil
    end

    it 'copies all project settings to the phase' do
      phase = project.phases.first
      expect(phase.participation_method).to eq project.participation_method
      # TODO: Check the rest of the settings here
      # TODO: Should it remove the settings from the project too?
    end
  end

  shared_examples 'ideas' do
    it 'adds ideas to the phase' do
      phase = project.phases.first
      project.ideas.each do |idea|
        expect(idea.phases.count).to eq 1
        expect(idea.phases.first).to eq phase
      end
    end
  end

  shared_examples 'permissions' do
    it 'moves permissions from project to the phase' do
      # TODO: Should it remove the permissions from the project too? Probably - but check what happens when creating timelines
      expect(project).not_to be_nil
    end
  end

  describe '#migrate' do
    context 'without persistence' do
      let_it_be(:project) { create(:continuous_project) }

      before { service.migrate(false) }

      it 'should list number of projects with no success' do
        expect(service.stats).to eq({ projects: 1, success: 0, errors: [] })
      end

      it 'should not change the project type' do
        expect(project.reload.process_type).to eq 'continuous'
      end
    end

    context 'with persistence' do
      before { service.migrate(true) }

      context 'ideation projects' do
        let_it_be(:project) { create(:continuous_project) }
        let_it_be(:ideas) { create_list(:idea, 3, project: project) }

        include_examples 'project_settings'
        include_examples 'ideas'
      end

      context 'native surveys' do
        let_it_be(:project) { create(:continuous_native_survey_project) }
        let_it_be(:ideas) { create_list(:native_survey_response, 2, project: project) }

        include_examples 'project_settings'
        include_examples 'ideas'

        it 'add the creation phase to each idea' do
          phase = project.phases.first
          project.ideas.each do |idea|
            expect(idea.reload.creation_phase).to eq phase
          end
        end
      end

      context 'voting' do
        let_it_be(:project) { create(:continuous_budgeting_project) }
        include_examples 'project_settings'
      end

      context 'volunteering' do
        let_it_be(:project) { create(:continuous_volunteering_project) }
        include_examples 'project_settings'
      end

      context 'poll' do
        let_it_be(:project) { create(:continuous_poll_project) }
        include_examples 'project_settings'
      end

      context 'survey' do
        let_it_be(:project) { create(:continuous_survey_project) }
        include_examples 'project_settings'
      end

      context 'information' do
        let_it_be(:project) { create(:continuous_project, participation_method: 'information') }
        include_examples 'project_settings'
      end

      context 'document_annotation' do
        let_it_be(:project) { create(:continuous_document_annotation_project) }
        include_examples 'project_settings'
      end
    end
  end
end
