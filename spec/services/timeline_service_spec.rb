require "rails_helper"

describe TimelineService do
  let(:service) { TimelineService.new }

  before do
    settings = Tenant.current.settings
    settings['core']['locales'] = ['fr','en','nl']
    Tenant.current.update(settings: settings)
  end

  describe "active_phases" do

    let(:project) {create(:project)}
    let!(:active_phases) { Array.new(5).map{|_| create_active_phase(project)} }
    let!(:inactive_phases) { Array.new(10).map{|_| create_inactive_phase(project)} }

    it "returns those phases for which the current time is between the start and end time" do
      expect(service.active_phases(project).map(&:id)).to match_array(active_phases.map(&:id))
      expect(service.active_phases(create(:project)).map(&:id)).to match_array([])
    end

  end

  describe "current_phase" do
    let(:project) {create(:project)}
    let!(:active_phase) { create_active_phase(project) }
    let!(:inactive_phases) { Array.new(10).map{|_| create_inactive_phase(project)} }

    it "returns an active phase of the project" do
      expect(service.current_phase(project)&.id).to eq(active_phase.id)
    end
  end


  def create_active_phase project
    create(:phase, project: project,
           start_at: Time.at(Time.now.to_i - rand(100000000)), 
           end_at: Time.at(Time.now.to_i + rand(100000000)))
  end

  def create_inactive_phase project
    start_at = nil
    end_at = nil
    if rand(2) == 0
      start_at = Time.at(Time.now.to_i - rand(100000000))
      end_at = Time.at(Time.now.to_i - rand(Time.now.to_i - start_at.to_i))
    else
      end_at = Time.at(Time.now.to_i + rand(100000000))
      start_at = Time.at(Time.now.to_i + rand(end_at.to_i - Time.now.to_i))
    end
    create(:phase, project: project, start_at: start_at, end_at: end_at)
  end

end
