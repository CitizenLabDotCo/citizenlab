require "rails_helper"

describe ParticipationContextService do
  let(:service) { ParticipationContextService.new }

  describe "get_participation_context" do

    it "returns the project for a continuous project" do
      project = build(:continuous_project)
      expect(service.get_participation_context(project)).to eq project
    end

    it "returns the active phase for a timeline project" do
      random_title = SecureRandom.uuid
      project = create(:project_with_active_phase, active_phase_attrs: {title_multiloc: {'en' => random_title} })
      expect(service.get_participation_context(project)&.title_multiloc.dig('en')).to eq random_title
    end

    it "returns nil for a timeline project without an active phase" do
      project = create(:project_with_past_phases)
      expect(service.get_participation_context(project)).to eq nil
    end
  end

  describe "posting_disabled_reason" do
    it "returns nil when posting is allowed" do
      project = create(:project_with_active_phase)
      expect(service.posting_disabled_reason(project)).to be_nil
    end

    it "returns `posting_disabled` when posting is disabled" do
      project = create(:project_with_active_phase, active_phase_attrs: {posting_enabled: false})
      expect(service.posting_disabled_reason(project)).to eq 'posting_disabled'
    end

    it "return `not_ideation` when we're not in an ideation context" do
      project = create(:project_with_active_phase, active_phase_attrs: {participation_method: 'information'})
      expect(service.posting_disabled_reason(project)).to eq 'not_ideation'
    end

    it "returns `no_active_context` when we're not in an active context" do
      project = create(:project_with_past_phases)
      expect(service.posting_disabled_reason(project)).to eq 'no_active_context'
    end

  end

  describe "commenting_disabled_reasons" do
    it "returns nil when commenting is allowed" do
      project = create(:project_with_active_phase)
      expect(service.commenting_disabled_reason(project)).to be_nil
    end

    it "return `commenting_disabled` when commenting is disabled" do
      project = create(:project_with_active_phase, active_phase_attrs: {commenting_enabled: false})
      expect(service.commenting_disabled_reason(project)).to eq 'commenting_disabled'
    end
  end


  describe "voting_disabled_reasons" do

    let(:user) { create(:user) }

    it "returns nil when voting is allowed" do
      project = create(:project_with_active_phase)
      expect(service.voting_disabled_reason(project, user)).to be_nil
    end

    it "returns `voting_disabled` when voting is disabled" do
      user = create(:user)
      project = create(:project_with_active_phase, active_phase_attrs: {voting_enabled: false})
      expect(service.voting_disabled_reason(project, user)).to eq 'voting_disabled'
    end

    it "returns `voting_limited_max_reached` when the user has voted over his allowed maximum in a timeline phase" do
      project = create(:project_with_active_phase, active_phase_attrs: {
        voting_method: 'limited', 
        voting_limited_max: 3
      })
      phase = TimelineService.new.current_phase(project)
      ideas = create_list(:idea, 3, project: project, phases: [phase])
      ideas.each{|idea| create(:vote, votable: idea, user: user)}

      expect(service.voting_disabled_reason(project, user)).to eq 'voting_limited_max_reached'
    end

    it "returns `voting_limited_max_reached` when the user has voted over his allowed maximum in a continuous project" do
      project = create(:continuous_project, voting_method: 'limited', voting_limited_max: 3)
      ideas = create_list(:idea, 3, project: project)
      ideas.each{|idea| create(:vote, votable: idea, user: user)}
      expect(service.voting_disabled_reason(project, user)).to eq 'voting_limited_max_reached'
    end
  end

  # describe "posting_enabled_from" do
  #   it "returns the start date of the next phase if an upcoming phase has posting enabled" do

  #   end

  #   it "returns nil if no next phase has posting enabled" do
  #     project = create(:project_with_active_phase, active_phase_attrs: {
          
  #     })
  #   end

  #   it "returns nil for a continuous project" do
  #     project = create(:continuous_project)
  #     expect(service.posting_enabled_from(project)).to be_nil
  #   end

  # end

  # describe "posting_disabled_since" do

  # end


end
