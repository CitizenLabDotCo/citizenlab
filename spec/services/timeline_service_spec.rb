require "rails_helper"

describe TimelineService do
  let(:service) { TimelineService.new }

  before do
    settings = Tenant.current.settings
    settings['core']['locales'] = ['fr','en','nl']
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
