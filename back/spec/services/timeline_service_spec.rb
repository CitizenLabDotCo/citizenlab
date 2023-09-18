# frozen_string_literal: true

require 'rails_helper'

describe TimelineService do
  let(:service) { described_class.new }

  describe 'current_phase' do
    let(:project) { create(:project) }
    let!(:active_phase) { create_active_phase(project) }
    let!(:inactive_phases) { 10.times { create_inactive_phase(project) } }

    it 'returns an active phase of the project' do
      expect(service.current_phase(project)&.id).to eq(active_phase.id)
    end

    it "returns the active phase when we're in the last day of the phase" do
      today = AppConfiguration.timezone.today
      project = create(:project)
      phase = create(:phase, start_at: today - 1.week, end_at: today, project: project)
      expect(service.current_phase(project)&.id).to eq(phase.id)
    end

    it "returns the active phase when we're in the first day of the phase" do
      project = create(:project)
      phase = create(:phase, start_at: Time.now.to_date, end_at: Time.now.to_date + 1.week, project: project)
      expect(service.current_phase(project)&.id).to eq(phase.id)
    end

    it 'respects the tenant timezone' do
      phase = create(:phase, start_at: Date.new(2019, 9, 2), end_at: Date.new(2019, 9, 9))
      project = phase.project

      t = Time.new(2019, 9, 9, 23) # 11 pm utc = 1 am Brussels == 8pm Santiage

      settings = AppConfiguration.instance.settings
      settings['core']['timezone'] = 'Europe/Brussels'
      AppConfiguration.instance.update!(settings: settings)
      expect(service.current_phase(project, t)&.id).to be_nil

      settings = AppConfiguration.instance.settings
      settings['core']['timezone'] = 'America/Santiago'
      AppConfiguration.instance.update!(settings: settings)
      expect(service.current_phase(project, t)&.id).to eq phase.id
    end
  end

  describe 'current_or_last_can_contain_ideas_phase' do
    let(:project) { create(:project) }

    it 'returns the currently active ideation phase of the project' do
      active_phase = create_active_phase(project)
      5.times { create_inactive_phase(project, participation_method: 'ideation') }
      expect(service.current_or_last_can_contain_ideas_phase(project)&.id).to eq(active_phase.id)
    end

    it 'returns the currently active voting phase of the project' do
      active_phase = create_active_phase(project, factory: :budgeting_phase)
      5.times { create_inactive_phase(project, participation_method: 'ideation') }
      expect(service.current_or_last_can_contain_ideas_phase(project)&.id).to eq(active_phase.id)
    end

    it 'returns the last ideation phase of the project if there is no currently active phase' do
      5.times { create_inactive_phase(project, participation_method: 'ideation') }
      expect(service.current_or_last_can_contain_ideas_phase(project)&.id).to eq(project.phases.last.id)
    end

    it 'returns the last voting phase of the project if there is no currently active phase' do
      4.times { create_inactive_phase(project, participation_method: 'ideation') }
      create_inactive_phase(project, participation_method: 'voting', voting_method: 'budgeting', voting_max_total: 1000)
      expect(service.current_or_last_can_contain_ideas_phase(project)&.id).to eq(project.phases.last.id)
      expect(service.current_or_last_can_contain_ideas_phase(project)&.voting_method).to eq('budgeting')
    end

    it 'returns nil if there are no phases' do
      expect(service.current_or_last_can_contain_ideas_phase(project)).to be_nil
    end

    it 'returns nil if there are no ideation phases' do
      create_active_phase(project, factory: :native_survey_phase)
      5.times { create_inactive_phase(project, participation_method: 'poll') }
      expect(service.current_or_last_can_contain_ideas_phase(project)).to be_nil
    end
  end

  describe 'current_and_future_phases' do
    it 'returns an array of current and future phases' do
      project = create(:project_with_current_phase)
      expect(service.current_and_future_phases(project)).to match_array project.phases.drop(2)
    end

    it 'respects the tenant timezone' do
      phase = create(:phase, start_at: Date.new(2019, 9, 2), end_at: Date.new(2019, 9, 9))
      project = phase.project

      t = Time.new(2019, 9, 9, 23) # 11 pm utc = 1 am Brussels == 8pm Santiage

      settings = AppConfiguration.instance.settings
      settings['core']['timezone'] = 'Europe/Brussels'
      AppConfiguration.instance.update!(settings: settings)
      expect(service.current_and_future_phases(project, t)).to eq []

      settings = AppConfiguration.instance.settings
      settings['core']['timezone'] = 'America/Santiago'
      AppConfiguration.instance.update!(settings: settings)
      expect(service.current_and_future_phases(project, t)).to eq [phase]
    end
  end

  describe 'in_active_phase?' do
    it 'returns truthy when the given idea is in the active phase' do
      project = create(:project_with_current_phase)
      idea = create(:idea, project: project, phases: [service.current_phase(project)])
      expect(service.in_active_phase?(idea)).to be true
    end

    it 'returns falsy when the given idea is not in the active phase' do
      project = create(:project_with_current_phase)
      idea = create(:idea, project: project, phases: [project.phases.find { |p| p != service.current_phase(project) }])
      expect(service).not_to be_in_active_phase(idea)
    end
  end

  describe 'timeline_active' do
    it 'returns :present for a continuous project' do
      project = create(:continuous_project)
      expect(service.timeline_active(project)).to be_nil
    end

    it 'returns :present for a project with current phase' do
      project = create(:project_with_current_phase)
      expect(service.timeline_active(project)).to eq :present
    end

    it 'returns :past for a project with only past phases' do
      project = create(:project_with_past_phases)
      expect(service.timeline_active(project)).to eq :past
    end

    it 'returns :future for a project with only future phases' do
      project = create(:project_with_future_phases)
      expect(service.timeline_active(project)).to eq :future
    end

    it 'respects the tenant timezone' do
      phase = create(:phase, start_at: Date.new(2019, 9, 2), end_at: Date.new(2019, 9, 9))
      project = phase.project

      travel_to Time.new(2019, 9, 9, 23) do # 11 pm utc = 1 am Brussels == 8pm Santiage
        settings = AppConfiguration.instance.settings
        settings['core']['timezone'] = 'Europe/Brussels'
        AppConfiguration.instance.update!(settings: settings)
        expect(service.timeline_active(project)).to eq :past

        settings = AppConfiguration.instance.settings
        settings['core']['timezone'] = 'America/Santiago'
        AppConfiguration.instance.update!(settings: settings)
        expect(service.timeline_active(project)).to eq :present
      end
    end
  end

  describe 'phase_number' do
    it 'returns the phase number' do
      project = create(:project)
      future_phase = create(:phase, project: project, start_at: (Time.zone.today + 20.days), end_at: (Time.zone.today + 25.days))
      past_phase = create(:phase, project: project, start_at: (Time.zone.today - 15.days), end_at: (Time.zone.today - 10.days))
      current_phase = create(:phase, project: project, start_at: (Time.zone.today - 2.days), end_at: (Time.zone.today + 3.days))
      expect(service.phase_number(past_phase.reload)).to eq 1
      expect(service.phase_number(current_phase.reload)).to eq 2
      expect(service.phase_number(future_phase.reload)).to eq 3
    end
  end

  def create_active_phase(project, factory: :phase)
    today = AppConfiguration.timezone.today
    create(factory, project: project, start_at: today - 2.weeks, end_at: today)
  end

  def create_inactive_phase(project, phase_options = {})
    create(:phase_sequence, phase_options.merge(project: project))
  end
end
