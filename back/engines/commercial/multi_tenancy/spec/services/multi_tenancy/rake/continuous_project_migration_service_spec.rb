# frozen_string_literal: true

require 'rails_helper'

RSpec.describe MultiTenancy::Rake::ContinuousProjectMigrationService do
  subject(:service) { described_class.new }

  describe '#migrate' do
    # TODO: Create a continous project of each participation method
    let_it_be(:ideation_project) { create(:continuous_project) }

    context 'without persistence' do
      before { service.migrate(false) }

      it 'should list number of projects' do
        expect(service.stats).to eq({ projects: 1, success: 0, errors: [] })
      end

      it 'should not change the project type' do
        expect(ideation_project.reload.process_type).to eq 'continuous'
      end
    end

    context 'with persistence' do
      # TODO: Can probably use before all here for speed
      before { service.migrate(true) }

      it 'changes the project type' do
        expect(ideation_project.reload.process_type).to eq 'timeline'
      end

      it 'creates a single open ended phase for the project' do
        expect(ideation_project.phases.count).to eq 1
        expect(ideation_project.phases.first.end_at).to be_nil
      end

      it 'copies all project settings to the phase' do
        expect(ideation_project.phases.first.participation_method).to eq 'ideation'
        # TODO: Check the rest of the settings here
        # TODO: Ensure some settings are not the default
      end
    end
  end
end
