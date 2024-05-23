# frozen_string_literal: true

require 'rails_helper'

# NOTE: Most of the tests for Phase are in the tests for the sub-class: ProjectPermissionsService
describe Permissions::PhasePermissionsService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }

  before do
    SettingsService.new.activate_feature! 'user_confirmation'
  end

  context '"reacting_idea" denied_reason_for_phase' do
    it 'returns nil when reacting is enabled' do
      project = create(
        :project_with_current_phase,
        phases_config: { sequence: 'xcx', c: { reacting_enabled: true }, x: { reacting_enabled: false } }
      )
      phase = project.phases.order(:start_at)[1]

      expect(service.denied_reason_for_action('reacting_idea', user, phase, reaction_mode: 'up')).to be_nil
      expect(service.denied_reason_for_action('reacting_idea', user, phase, reaction_mode: 'down')).to be_nil
    end

    it 'returns nil when reacting is enabled for that phase, but disabled for the current phase' do
      project = create(
        :project_with_current_phase,
        phases_config: { sequence: 'xxcxx', c: { reacting_enabled: false }, x: { reacting_enabled: true } }
      )
      phase = project.phases.order(:start_at).first

      expect(service.denied_reason_for_action('reacting_idea', user, phase, reaction_mode: 'up')).to be_nil
      expect(service.denied_reason_for_action('reacting_idea', user, phase, reaction_mode: 'down')).to be_nil
    end

    it 'returns `reacting_like_limited_max_reached` if the like limit was reached for that phase' do
      project = create(
        :project_with_current_phase,
        phases_config: { sequence: 'xxcxx', c: { reacting_enabled: true },
                         x: { reacting_enabled: true, reacting_like_method: 'limited', reacting_like_limited_max: 2 } }
      )
      phase = project.phases.order(:start_at).first
      ideas = create_list(:idea, 2, project: project, phases: project.phases)
      ideas.each do |idea|
        create(:reaction, mode: 'up', reactable: idea, user: user)
      end

      expect(service.denied_reason_for_action('reacting_idea', user, phase, reaction_mode: 'up')).to eq 'reacting_like_limited_max_reached'
      expect(service.denied_reason_for_action('reacting_idea', user, phase, reaction_mode: 'down')).to be_nil
    end
  end
end
