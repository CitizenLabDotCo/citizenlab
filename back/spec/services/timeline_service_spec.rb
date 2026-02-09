# frozen_string_literal: true

require 'rails_helper'

describe TimelineService do
  let(:service) { described_class.new }

  describe 'past_phases' do
    let(:project) { create(:project) }

    it 'returns the past phases' do
      phase1 = create(:phase, project: project, start_at: Time.now.to_date - 10.days, end_at: Time.now.to_date - 5.days)
      phase2 = create(:phase, project: project, start_at: Time.now.to_date - 4.days, end_at: Time.now.to_date - 2.days)
      phase3 = create(:phase, project: project, start_at: Time.now.to_date - 1.day, end_at: Time.now.to_date + 2.days)
      project.phases << [phase1, phase2, phase3]
      expect(service.past_phases(project)).to contain_exactly(phase1, phase2)
    end

    it 'returns the past phases when the last phase has no end date' do
      phase1 = create(:phase, project: project, start_at: Time.now.to_date - 10.days, end_at: Time.now.to_date - 2.days)
      phase2 = create(:phase, project: project, start_at: Time.now.to_date - 1.day, end_at: nil)
      project.phases << [phase1, phase2]
      expect(service.past_phases(project)).to contain_exactly(phase1)
    end
  end

  describe 'current_phase' do
    let(:project) { create(:project) }

    it 'returns an active phase of the project' do
      active_phase = create_active_phase(project)
      10.times { create_inactive_phase(project) }
      expect(service.current_phase(project)&.id).to eq(active_phase.id)
    end

    it "returns the active phase when we're in the last day of the phase" do
      today = AppConfiguration.timezone.now.to_date
      phase = create(:phase, start_at: today - 1.week, end_at: today, project: project)
      expect(service.current_phase(project)&.id).to eq(phase.id)
    end

    it "returns the active phase when we're in the first day of the phase" do
      phase = create(:phase, start_at: Time.now.to_date, end_at: Time.now.to_date + 1.week, project: project)
      expect(service.current_phase(project)&.id).to eq(phase.id)
    end

    it 'respects the tenant timezone' do
      phase = create(:phase, project: project, start_at: Date.new(2019, 9, 2), end_at: Date.new(2019, 9, 9))

      t = Time.utc(2019, 9, 9, 23) # 11 pm utc = 1 am Brussels == 8pm Santiage

      settings = AppConfiguration.instance.settings
      settings['core']['timezone'] = 'Europe/Brussels'
      AppConfiguration.instance.update!(settings: settings)
      service = described_class.new
      expect(service.current_phase(project, t)&.id).to be_nil

      settings = AppConfiguration.instance.settings
      settings['core']['timezone'] = 'America/Santiago'
      AppConfiguration.instance.update!(settings: settings)
      service = described_class.new
      expect(service.current_phase(project, t)&.id).to eq phase.id
    end

    it 'returns the active phase when it has no end date' do
      phase1 = create(:phase, project: project, start_at: Time.now.to_date - 10.days, end_at: Time.now.to_date - 2.days)
      phase2 = create(:phase, project: project, start_at: Time.now.to_date - 1.day, end_at: nil)
      project.phases << [phase1, phase2]
      expect(service.current_phase(project)&.id).to eq(phase2.id)
    end
  end

  describe 'current_phase_not_archived' do
    it 'returns the active phase for a timeline project' do
      random_title = SecureRandom.uuid
      project = create(
        :project_with_current_phase,
        current_phase_attrs: { title_multiloc: { 'en' => random_title } }
      )
      expect(service.current_phase_not_archived(project).title_multiloc['en']).to eq random_title
    end

    it 'returns nil for a timeline project without an active phase' do
      project = create(:project_with_past_phases)
      expect(service.current_phase_not_archived(project)).to be_nil
    end

    it "returns nil for a timeline project that's archived" do
      project = create(:project_with_current_phase, admin_publication_attributes: { publication_status: 'archived' })
      expect(service.current_phase_not_archived(project)).to be_nil
    end
  end

  describe 'current_phase_or_last_completed_not_archived' do
    it 'returns the active phase for a timeline project' do
      random_title = SecureRandom.uuid
      project = create(
        :project_with_current_phase,
        current_phase_attrs: { title_multiloc: { 'en' => random_title } }
      )
      expect(service.current_phase_or_last_completed_not_archived(project).title_multiloc['en']).to eq random_title
    end

    it 'returns the last completed phase for a timeline project without an active phase' do
      project = create(:project)
      past_phase1 = create(:phase, project: project, start_at: Time.now.to_date - 10.days, end_at: Time.now.to_date - 5.days)
      past_phase2 = create(:phase, project: project, start_at: Time.now.to_date - 4.days, end_at: Time.now.to_date - 2.days)
      project.phases << [past_phase1, past_phase2]
      expect(service.current_phase_or_last_completed_not_archived(project).id).to eq(past_phase2.id)
    end

    it "returns nil for a timeline project that's archived" do
      project = create(:project_with_past_phases, admin_publication_attributes: { publication_status: 'archived' })
      expect(service.current_phase_or_last_completed_not_archived(project)).to be_nil
    end
  end

  describe 'phase_is_complete?' do
    let(:project) { create(:project) }

    it 'returns true if the phase is complete' do
      phase = create(:phase, project: project, start_at: Time.now.to_date - 10.days, end_at: Time.now.to_date - 5.days)
      project.phases << phase
      expect(service.phase_is_complete?(phase)).to be true
    end

    it 'returns false if the phase is not complete' do
      phase = create(:phase, start_at: Time.now.to_date - 2.days, end_at: Time.now.to_date + 2.days)
      project.phases << phase
      expect(service.phase_is_complete?(phase)).to be false
    end

    it 'returns false if the phase has no end date' do
      phase = create(:phase, project: project, start_at: Time.now.to_date - 2.days, end_at: nil)
      project.phases << phase
      expect(service.phase_is_complete?(phase)).to be false
    end
  end

  describe 'current_or_backup_transitive_phase' do
    let(:project) { create(:project) }

    it 'returns the currently active ideation phase of the project' do
      active_phase = create_active_phase(project)
      5.times { create_inactive_phase(project, participation_method: 'ideation') }
      expect(service.current_or_backup_transitive_phase(project)&.id).to eq(active_phase.id)
    end

    it 'returns the currently active proposal phase of the project' do
      active_phase = create(:proposals_phase, project: project, start_at: Date.yesterday, end_at: Date.tomorrow)
      2.times { create_inactive_phase(project, participation_method: 'ideation') }
      expect(service.current_or_backup_transitive_phase(project)&.id).to eq(active_phase.id)
    end

    it 'returns the currently active voting phase of the project' do
      active_phase = create_active_phase(project, factory: :budgeting_phase)
      5.times { create_inactive_phase(project, participation_method: 'ideation') }
      expect(service.current_or_backup_transitive_phase(project)&.id).to eq(active_phase.id)
    end

    it 'returns the last ideation phase of the project if there is no currently active phase' do
      2.times { create_inactive_phase(project, participation_method: 'ideation') }
      create_inactive_phase(project, participation_method: 'proposals')
      expect(service.current_or_backup_transitive_phase(project)&.id).to eq(project.phases[-2].id)
    end

    it 'returns the last voting phase of the project if there is no currently active phase' do
      4.times { create_inactive_phase(project, participation_method: 'ideation') }
      create_inactive_phase(project, participation_method: 'voting', voting_method: 'budgeting', voting_max_total: 1000)
      expect(service.current_or_backup_transitive_phase(project)&.id).to eq(project.phases.last.id)
      expect(service.current_or_backup_transitive_phase(project)&.voting_method).to eq('budgeting')
    end

    it 'returns the last ideation phase of the project if the end_date is blank' do
      create_active_phase(project, factory: :native_survey_phase)
      open_ideation_phase = create(:phase, project: project, participation_method: 'ideation', start_at: Time.now.to_date + 10.days, end_at: nil)
      expect(service.current_or_backup_transitive_phase(project)&.id).to eq(open_ideation_phase.id)
    end

    it 'returns the current ideation phase of the project if the end_date is blank' do
      create(:phase, project: project, participation_method: 'ideation', start_at: Time.now.to_date - 10.days, end_at: Time.now.to_date - 2.days)
      open_current_ideation_phase = create(:phase, project: project, participation_method: 'ideation', start_at: Time.now.to_date - 1.day, end_at: nil)
      expect(service.current_or_backup_transitive_phase(project)&.id).to eq(open_current_ideation_phase.id)
    end

    it 'returns nil if there are no phases' do
      expect(service.current_or_backup_transitive_phase(project)).to be_nil
    end

    it 'returns nil if there are no ideation phases' do
      create_active_phase(project, factory: :native_survey_phase)
      5.times { create_inactive_phase(project, participation_method: 'poll') }
      expect(service.current_or_backup_transitive_phase(project)).to be_nil
    end
  end

  describe 'current_and_future_phases' do
    it 'returns an array of current and future phases' do
      project = create(:project_with_current_phase)
      expect(service.current_and_future_phases(project)).to match_array project.phases.drop(2)
    end

    it 'returns current and future phases when the last phase is open ended' do
      project = create(:project)
      past_phase = create(:phase, project: project, start_at: Time.now.to_date - 10.days, end_at: Time.now.to_date - 3.days)
      current_phase = create(:phase, project: project, start_at: Time.now.to_date - 2.days, end_at: Time.now.to_date + 2.days)
      future_phase = create(:phase, project: project, start_at: Time.now.to_date + 3.days, end_at: nil)
      project.phases << [past_phase, current_phase, future_phase]
      expect(service.current_and_future_phases(project)).to contain_exactly(current_phase, future_phase)
    end

    it 'respects the tenant timezone' do
      phase = create(:phase, start_at: Date.new(2019, 9, 2), end_at: Date.new(2019, 9, 9))
      project = phase.project

      t = Time.utc(2019, 9, 9, 23) # 11 pm utc = 1 am Brussels == 8pm Santiage

      settings = AppConfiguration.instance.settings
      settings['core']['timezone'] = 'Europe/Brussels'
      AppConfiguration.instance.update!(settings: settings)
      service = described_class.new
      expect(service.current_and_future_phases(project, t)).to eq []

      settings = AppConfiguration.instance.settings
      settings['core']['timezone'] = 'America/Santiago'
      AppConfiguration.instance.update!(settings: settings)
      service = described_class.new
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
    it 'returns nil for a project with no phases' do
      project = create(:project)
      expect(service.timeline_active(project)).to be_nil
    end

    it 'returns :present for a project with current phase' do
      project = create(:project_with_current_phase)
      expect(service.timeline_active(project)).to eq :present
    end

    it 'returns :present for a project with an current open ended last phase' do
      project = create(:project)
      project.phases << create(:phase, project: project, start_at: '2022-01-01', end_at: '2022-01-10')
      project.phases << create(:phase, project: project, start_at: '2022-01-11', end_at: nil)
      expect(service.timeline_active(project)).to eq :present
    end

    it 'returns :present for a project with a single current open ended phase' do
      project = create(:project)
      project.phases << create(:phase, project: project, start_at: '2022-01-01', end_at: nil)
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

    it 'returns :future for a project with a future open ended phase' do
      project = create(:project)
      project.phases << create(:phase, project: project, start_at: Time.now.to_date + 5.days, end_at: nil)
      expect(service.timeline_active(project)).to eq :future
    end

    it 'respects the tenant timezone' do
      phase = create(:phase, start_at: Date.new(2019, 9, 2), end_at: Date.new(2019, 9, 9))
      project = phase.project

      travel_to Time.utc(2019, 9, 9, 23) do # 11 pm utc = 1 am Brussels == 8pm Santiage
        settings = AppConfiguration.instance.settings
        settings['core']['timezone'] = 'Europe/Brussels'
        AppConfiguration.instance.update!(settings: settings)
        service = described_class.new
        expect(service.timeline_active(project)).to eq :past

        settings = AppConfiguration.instance.settings
        settings['core']['timezone'] = 'America/Santiago'
        AppConfiguration.instance.update!(settings: settings)
        service = described_class.new
        expect(service.timeline_active(project)).to eq :present
      end
    end
  end

  describe 'timeline_active_on_collection' do
    it 'returns array of :past, :present, :future for each project' do
      past_project = create(:project_with_past_phases)
      present_project = create(:project_with_current_phase)
      future_project = create(:project_with_future_phases)
      projects = Project.where(id: [past_project, present_project, future_project])

      result = nil
      expect do
        result = service.timeline_active_on_collection(projects)
      end.not_to exceed_query_limit(3).with(/SELECT.*projects/)

      expect(result).to match_array(
        past_project.id => :past,
        present_project.id => :present,
        future_project.id => :future
      )
    end

    it 'returns array of :present and :future for each project when project end dates are open' do
      present_project = create(:project)
      present_project.phases << create(:phase, project: present_project, start_at: Time.now.to_date - 5.days, end_at: Time.now.to_date - 2.days)
      present_project.phases << create(:phase, project: present_project, start_at: Time.now.to_date - 1.day, end_at: nil)
      present_project2 = create(:project)
      present_project2.phases << create(:phase, project: present_project2, start_at: Time.now.to_date - 1.day, end_at: nil)
      future_project = create(:project)
      future_project.phases << create(:phase, project: future_project, start_at: Time.now.to_date + 1.day, end_at: Time.now.to_date + 4.days)
      future_project.phases << create(:phase, project: future_project, start_at: Time.now.to_date + 5.days, end_at: nil)
      future_project2 = create(:project)
      future_project2.phases << create(:phase, project: future_project2, start_at: Time.now.to_date + 5.days, end_at: nil)
      projects = [present_project, present_project2, future_project, future_project2]
      expect(service.timeline_active_on_collection(projects)).to match_array(
        present_project.id => :present,
        present_project2.id => :present,
        future_project.id => :future,
        future_project2.id => :future
      )
    end
  end

  describe 'overlaps?' do
    it 'returns false when a phase ends before the next starts' do
      project = build(:project)

      phase1 = build(:phase, project: project, start_at: (Time.now - 5.days), end_at: (Time.now + 2.days))
      phase2 = build(:phase, project: project, start_at: (Time.now + 5.days), end_at: (Time.now + 12.days))
      expect(service.overlaps?(phase1, phase2)).to be false
      expect(service.overlaps?(phase2, phase1)).to be false
    end

    it 'returns true when a phase ends on the same date that next starts' do
      project = build(:project)

      phase1 = build(:phase, project: project, start_at: (Time.now - 5.days), end_at: (Time.now + 2.days))
      phase2 = build(:phase, project: project, start_at: (Time.now + 2.days), end_at: (Time.now + 12.days))
      expect(service.overlaps?(phase1, phase2)).to be true
      expect(service.overlaps?(phase2, phase1)).to be true
    end

    it 'returns true when a phase ends in between start and end of the next phase' do
      project = build(:project)

      phase1 = build(:phase, project: project, start_at: (Time.now - 5.days), end_at: (Time.now + 5.days))
      phase2 = build(:phase, project: project, start_at: (Time.now + 2.days), end_at: (Time.now + 12.days))
      expect(service.overlaps?(phase1, phase2)).to be true
      expect(service.overlaps?(phase2, phase1)).to be true
    end

    it 'returns true when a phase starts and ends inside the start-end period of the other phase' do
      project = build(:project)

      phase1 = build(:phase, project: project, start_at: (Time.now - 5.days), end_at: (Time.now + 12.days))
      phase2 = build(:phase, project: project, start_at: (Time.now + 2.days), end_at: (Time.now + 5.days))
      expect(service.overlaps?(phase1, phase2)).to be true
      expect(service.overlaps?(phase2, phase1)).to be true
    end

    it 'returns false for a phase ending before a phase with no end date starts' do
      project = build(:project)
      phase1 = build(:phase, project: project, start_at: (Time.now + 5.days), end_at: nil)
      phase2 = build(:phase, project: project, start_at: (Time.now - 2.days), end_at: (Time.now + 2.days))
      expect(service.overlaps?(phase1, phase2)).to be false
      expect(service.overlaps?(phase2, phase1)).to be false
    end

    it 'returns true for a phase ending after a phase with no end date starts' do
      project = build(:project)
      phase1 = build(:phase, project: project, start_at: (Time.now + 5.days), end_at: nil)
      phase2 = build(:phase, project: project, start_at: (Time.now + 2.days), end_at: (Time.now + 12.days))
      expect(service.overlaps?(phase1, phase2)).to be true
      expect(service.overlaps?(phase2, phase1)).to be true
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

  describe 'previous_phase' do
    it 'returns the previous phase' do
      project = create(:project)
      first_phase = create(:phase, project: project, start_at: (Time.zone.today - 25.days), end_at: (Time.zone.today - 20.days))
      second_phase = create(:phase, project: project, start_at: (Time.zone.today - 15.days), end_at: (Time.zone.today - 10.days))
      third_phase = create(:phase, project: project, start_at: (Time.zone.today - 2.days), end_at: (Time.zone.today + 3.days))

      expect(service.previous_phase(first_phase)).to be_nil
      expect(service.previous_phase(second_phase)).to eq first_phase
      expect(service.previous_phase(third_phase)).to eq second_phase
    end
  end

  describe '#last_phase?' do
    let(:project) { create(:project_with_phases) }

    it 'returns true for the last phase in a project' do
      old_last_phase = project.phases.last
      expect(service.last_phase?(old_last_phase)).to be true

      new_last_phase = create(:phase, project: project, start_at: (old_last_phase.end_at + 1.day).to_s)
      expect(service.last_phase?(new_last_phase)).to be true
      expect(service.last_phase?(old_last_phase)).to be false
    end

    it 'returns false for any other phase' do
      expect(service.last_phase?(project.phases.first)).to be false
    end
  end

  def create_active_phase(project, factory: :phase)
    today = AppConfiguration.timezone.now.to_date
    create(factory, project: project, start_at: today - 2.weeks, end_at: today)
  end

  def create_inactive_phase(project, phase_options = {})
    create(:phase_sequence, phase_options.merge(project: project))
  end
end
