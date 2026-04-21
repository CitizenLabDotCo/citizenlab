# frozen_string_literal: true

require 'rails_helper'

describe TimelineService do
  let(:service) { described_class.new }

  describe 'past_phases' do
    let(:project) { create(:project) }

    it 'returns the past phases' do
      past_phase1 = create(:phase, project:, start_at: 10.days.ago, end_at: 5.days.ago)
      past_phase2 = create(:phase, project:, start_at: 4.days.ago, end_at: 2.days.ago)
      create(:phase, project:, start_at: 1.day.ago, end_at: 2.days.from_now)

      expect(service.past_phases(project)).to contain_exactly(past_phase1, past_phase2)
    end

    it 'returns the past phases when the last phase has no end date' do
      past_phase = create(:phase, project:, start_at: 10.days.ago, end_at: 2.days.ago)
      create(:phase, project:, start_at: 1.day.ago, end_at: nil)

      expect(service.past_phases(project)).to contain_exactly(past_phase)
    end
  end

  describe 'current_phase' do
    subject(:current_phase) { service.current_phase(project) }

    let(:project) { create(:project) }

    it 'returns an active phase of the project' do
      active_phase = create_active_phase(project)
      10.times { create_inactive_phase(project) }
      expect(current_phase&.id).to eq(active_phase.id)
    end

    it "returns the active phase when we're at the start of the phase" do
      freeze_time do
        phase = create(:phase, start_at: Time.now, project:)
        expect(current_phase).to eq(phase)
      end
    end

    it 'does not return a phase when we are at the end of the phase' do
      freeze_time do
        create(:phase, start_at: Time.now - 1.week, end_at: Time.now, project:)
        expect(current_phase).to be_nil
      end
    end

    it 'respects the tenant timezone', transactional: false do
      phase = create(:phase, project:, start_at: '2019-09-02T00:00:00Z', end_at: '2019-09-10T00:00:00Z')

      # Same naive time, but the result depends on the tenant timezone.
      t = '2019-09-09T23:00:00'

      set_timezone('Europe/Brussels')
      expect(service.current_phase(project.reload, t)).to eq(phase)

      set_timezone('America/Santiago')
      expect(service.current_phase(project.reload, t)).to be_nil
    end

    it 'returns the active phase when it has no end date' do
      create(:phase, project:, start_at: 10.days.ago, end_at: 2.days.ago)
      ongoing = create(:phase, project:, start_at: 1.day.ago, end_at: nil)

      expect(current_phase).to eq(ongoing)
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
      _past_phase1 = create(:phase, project:, start_at: 10.days.ago, end_at: 5.days.ago)
      past_phase2 = create(:phase, project:, start_at: 4.days.ago, end_at: 2.days.ago)

      expect(service.current_phase_or_last_completed_not_archived(project)).to eq(past_phase2)
    end

    it "returns nil for a timeline project that's archived" do
      project = create(:project_with_past_phases, admin_publication_attributes: { publication_status: 'archived' })
      expect(service.current_phase_or_last_completed_not_archived(project)).to be_nil
    end
  end

  describe '#phase_is_complete?' do
    let_it_be(:project) { create(:project) }

    it 'returns true if the phase is complete' do
      phase = create(:phase, project:, start_at: 10.days.ago, end_at: 5.days.ago)
      expect(service.phase_is_complete?(phase)).to be true
    end

    it 'returns false if the phase is not complete' do
      phase = create(:phase, project:, start_at: 2.days.ago, end_at: 3.days.from_now)
      expect(service.phase_is_complete?(phase)).to be false
    end

    it 'returns false if the phase has no end date' do
      phase = create(:phase, project:, start_at: 2.days.ago, end_at: nil)
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
      active_phase = create(:proposals_phase, project: project, start_at: 1.day.ago, end_at: 1.day.from_now)
      2.times { create_inactive_phase(project, participation_method: 'ideation') }
      expect(service.current_or_backup_transitive_phase(project)).to eq(active_phase)
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
      create(:native_survey_phase, :ongoing, project:)
      open_ideation_phase = create(:ideation_phase, project:, start_at: 10.days.from_now, end_at: nil)
      expect(service.current_or_backup_transitive_phase(project)).to eq(open_ideation_phase)
    end

    it 'returns the current ideation phase of the project if the end_date is blank' do
      create(:ideation_phase, project:, start_at: 10.days.ago, end_at: 2.days.ago)
      open_current_ideation_phase = create(:ideation_phase, project:, start_at: 1.day.ago, end_at: nil)
      expect(service.current_or_backup_transitive_phase(project)).to eq(open_current_ideation_phase)
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
      _past_phase = create(:phase, project:, start_at: 10.days.ago, end_at: 3.days.ago)
      current_phase = create(:phase, project:, start_at: 2.days.ago, end_at: 2.days.from_now)
      future_phase = create(:phase, project:, start_at: 3.days.from_now, end_at: nil)

      expect(service.current_and_future_phases(project)).to contain_exactly(current_phase, future_phase)
    end

    it 'respects the tenant timezone' do
      phase = create(:phase, start_at: '2019-09-02T00:00:00Z', end_at: '2019-09-10T00:00:00Z')
      project = phase.project

      # Same naive time, but the result depends on the tenant timezone.
      # in Brussels: 2019-09-09T23:00:00+02:00 => 2019-09-09T21:00:00Z
      # in Santiago: 2019-09-09T23:00:00-03:00 => 2019-09-10T02:00:00Z
      t = '2019-09-09T23:00:00'

      set_timezone('Europe/Brussels')
      expect(service.current_and_future_phases(project, t)).to eq [phase]

      set_timezone('America/Santiago')
      expect(service.current_and_future_phases(project, t)).to be_empty
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
      create(:phase, project:, start_at: '2022-01-01', end_at: '2022-01-10')
      create(:phase, project:, start_at: '2022-01-11', end_at: nil)

      expect(service.timeline_active(project)).to eq :present
    end

    it 'returns :present for a project with a single current open ended phase' do
      phase = create(:phase, start_at: '2022-01-01', end_at: nil)
      expect(service.timeline_active(phase.project)).to eq :present
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
      phase = create(:phase, start_at: 5.days.from_now, end_at: nil)
      expect(service.timeline_active(phase.project)).to eq :future
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

    it 'returns a mapping of project IDs to their active status (past, present, future)' do
      present_project1 = create(:project).tap do |p|
        create(:phase, project: p, start_at: 5.days.ago, end_at: 2.days.ago)
        create(:phase, project: p, start_at: 1.day.ago, end_at: nil)
      end

      present_project2 = create(:project).tap do |p|
        create(:phase, project: p, start_at: 1.day.ago, end_at: nil)
      end

      future_project1 = create(:project).tap do |p|
        create(:phase, project: p, start_at: 1.day.from_now, end_at: 4.days.from_now)
        create(:phase, project: p, start_at: 5.days.from_now, end_at: nil)
      end

      future_project2 = create(:project).tap do |p|
        create(:phase, project: p, start_at: 5.days.from_now, end_at: nil)
      end

      projects = [present_project1, present_project2, future_project1, future_project2]

      expect(service.timeline_active_on_collection(projects)).to match(
        present_project1.id => :present,
        present_project2.id => :present,
        future_project1.id => :future,
        future_project2.id => :future
      )
    end
  end

  describe 'overlaps?' do
    it 'returns false when a phase ends before the next starts' do
      project = build(:project)
      phase1 = build(:phase, project:, start_at: 5.days.ago, end_at: 2.days.from_now)
      phase2 = build(:phase, project:, start_at: phase1.end_at, end_at: 12.days.from_now)

      expect(service.overlaps?(phase1, phase2)).to be false
      expect(service.overlaps?(phase2, phase1)).to be false
    end

    it 'returns true when a phase ends in between start and end of the next phase' do
      project = build(:project)
      phase1 = build(:phase, project:, start_at: 5.days.ago, end_at: 5.days.from_now)
      phase2 = build(:phase, project:, start_at: 2.days.from_now, end_at: 12.days.from_now)

      expect(service.overlaps?(phase1, phase2)).to be true
      expect(service.overlaps?(phase2, phase1)).to be true
    end

    it 'returns true when a phase starts and ends inside the start-end period of the other phase' do
      project = build(:project)
      phase1 = build(:phase, project:, start_at: 5.days.ago, end_at: 12.days.from_now)
      phase2 = build(:phase, project:, start_at: 2.days.from_now, end_at: 5.days.from_now)

      expect(service.overlaps?(phase1, phase2)).to be true
      expect(service.overlaps?(phase2, phase1)).to be true
    end

    it 'returns false for a phase ending before a phase with no end date starts' do
      project = build(:project)
      phase1 = build(:phase, project:, start_at: 2.days.ago, end_at: 2.days.from_now)
      phase2 = build(:phase, project:, start_at: 5.days.from_now, end_at: nil)

      expect(service.overlaps?(phase1, phase2)).to be false
      expect(service.overlaps?(phase2, phase1)).to be false
    end

    it 'returns true for a phase ending after a phase with no end date starts' do
      project = build(:project)
      phase1 = build(:phase, project:, start_at: 5.days.from_now, end_at: nil)
      phase2 = build(:phase, project:, start_at: 2.days.from_now, end_at: 12.days.from_now)

      expect(service.overlaps?(phase1, phase2)).to be true
      expect(service.overlaps?(phase2, phase1)).to be true
    end
  end

  describe 'phase_number' do
    it 'returns the phase number' do
      project = create(:project)

      future_phase = create(:phase, project:, start_at: 20.days.from_now, end_at: 25.days.from_now)
      past_phase = create(:phase, project:, start_at: 15.days.ago, end_at: 10.days.ago)
      current_phase = create(:phase, project:, start_at: 2.days.ago, end_at: 3.days.from_now)

      expect(service.phase_number(past_phase)).to eq 1
      expect(service.phase_number(current_phase)).to eq 2
      expect(service.phase_number(future_phase)).to eq 3
    end
  end

  describe 'previous_phase' do
    it 'returns the previous phase' do
      project = create(:project)

      first_phase = create(:phase, project:, start_at: 25.days.ago, end_at: 20.days.ago)
      second_phase = create(:phase, project:, start_at: 15.days.ago, end_at: 10.days.ago)
      third_phase = create(:phase, project:, start_at: 2.days.ago, end_at: 3.days.from_now)

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

      new_last_phase = create(:phase, project:, start_at: old_last_phase.end_at)
      expect(service.last_phase?(new_last_phase)).to be true
      expect(service.last_phase?(old_last_phase)).to be false
    end

    it 'returns false for any other phase' do
      expect(service.last_phase?(project.phases.first)).to be false
    end
  end

  def create_active_phase(project, factory: :phase)
    create(factory, project: project, start_at: 2.weeks.ago, end_at: 1.day.from_now)
  end

  def create_inactive_phase(project, phase_options = {})
    create(:phase_sequence, phase_options.merge(project: project))
  end

  def set_timezone(timezone) # rubocop:disable Naming/AccessorMethodName
    AppConfiguration.instance.settings['core']['timezone'] = timezone
    AppConfiguration.instance.save!
  end
end
