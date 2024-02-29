# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/DescribeClass
describe 'single_use:move_ideation_custom_forms_to_project rake task' do
  before do
    load_rake_tasks_if_not_loaded
  end

  after do
    Rake::Task['single_use:add_missing_locales'].reenable
  end

  context 'when the phase is an ideation phase' do
    let(:project) { create(:project_with_two_future_ideation_phases) }
    let(:phase) { project.phases.where(participation_method: 'ideation').first }
    let!(:custom_form) { create(:custom_form, participation_context: phase) }

    it 'updates the participation context of the custom form to the project' do
      expect(custom_form.participation_context).to eq(phase)
      Rake::Task['single_use:move_ideation_custom_forms_to_project'].invoke
      custom_form.reload
      expect(custom_form.participation_context).to eq(project)
    end
  end

  context 'when the phase is a native survey' do
    let(:project) { create(:single_phase_native_survey_project) }
    let(:phase) { project.phases.first }
    let!(:custom_form) { create(:custom_form, participation_context: phase) }

    it 'does not update the participation context of the custom form' do
      expect(custom_form.participation_context).to eq(phase)
      Rake::Task['single_use:move_ideation_custom_forms_to_project'].invoke
      custom_form.reload
      expect(custom_form.participation_context).to eq(phase)
    end
  end
end
# rubocop:enable RSpec/DescribeClass
