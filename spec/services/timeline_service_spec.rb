require "rails_helper"

describe TimelineService do
  let(:service) { TimelineService.new }

  before do
    settings = Tenant.current.settings
    settings['core']['locales'] = ['fr','en','nl-BE']
    Tenant.current.update(settings: settings)
  end

  describe "current_phase" do
    let(:project) {create(:project)}
    let!(:active_phase) { create_active_phase(project) }
    let!(:inactive_phases) { 10.times{create_inactive_phase(project)} }

    it "returns an active phase of the project" do
      expect(service.current_phase(project)&.id).to eq(active_phase.id)
    end

    it "returns the active phase when we're in the last day of the phase" do
      project = create(:project)
      phase = create(:phase, start_at: Time.now.to_date - 1.week, end_at: Time.now.to_date, project: project)
      expect(service.current_phase(project)&.id).to eq (phase.id)
    end

    it "returns the active phase when we're in the first day of the phase" do
      project = create(:project)
      phase = create(:phase, start_at: Time.now.to_date, end_at: Time.now.to_date + 1.week, project: project)
      expect(service.current_phase(project)&.id).to eq (phase.id)
    end
  end

  describe "current_and_future_phases" do
    it "returns an array of current and future phases" do
      project = create(:project_with_current_phase)
      expect(service.current_and_future_phases(project)).to match_array project.phases.drop(2)
    end
  end

  describe "is_in_active_phase?" do
    it "returns truthy when the given idea is in the active phase" do
      project = create(:project_with_current_phase)
      idea = create(:idea, project: project, phases: [service.current_phase(project)])
      expect(service.is_in_active_phase?(idea)).to be_truthy
    end

    it "returns falsy when the given idea is not in the active phase" do
      project = create(:project_with_current_phase)
      idea = create(:idea, project: project, phases: [project.phases.find{|p| p != service.current_phase(project)}])
      expect(service.is_in_active_phase?(idea)).to be_falsy
    end
  end

  describe "timeline_active" do
    it "returns :present for a continuous project" do
      project = create(:continuous_project)
      expect(service.timeline_active project).to eq nil
    end

    it "returns :present for a project with current phase" do
      project = create(:project_with_current_phase)
      expect(service.timeline_active project).to eq :present
    end

    it "returns :past for a project with only past phases" do
      project = create(:project_with_past_phases)
      expect(service.timeline_active project).to eq :past
    end

    it "returns :future for a project with only future phases" do
      project = create(:project_with_future_phases)
      expect(service.timeline_active project).to eq :future
    end
  end


  def create_active_phase project
    create(:phase, project: project,
      start_at: Time.at(Time.now.to_i - rand(100000000)), 
      end_at: Time.at(Time.now)
    )
  end


  def create_inactive_phase project
    create(:phase_sequence, project: project)
  end

end
