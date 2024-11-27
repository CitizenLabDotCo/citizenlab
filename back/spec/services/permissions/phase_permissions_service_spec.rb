require 'rails_helper'

# NOTE: Most of the tests for Phase are in the tests for the sub-class: ProjectPermissionsService
describe Permissions::PhasePermissionsService do
  let(:service) { described_class.new(phase, user) }
  let(:user) { create(:user) }
  let(:phase) { project.phases.first }
  let(:project) { create(:project_with_current_phase, phases_config: phases_config) }

  before { SettingsService.new.activate_feature! 'user_confirmation' }

  context '"reacting_idea" denied_reason_for_action' do
    context 'when reacting is enabled' do
      let(:phase) { project.phases[1] }
      let(:phases_config) { { sequence: 'xcx', c: { reacting_enabled: true, reacting_dislike_enabled: true }, x: { reacting_enabled: false } } }

      it 'returns nil' do
        expect(service.denied_reason_for_action('reacting_idea', reaction_mode: 'up')).to be_nil
        expect(service.denied_reason_for_action('reacting_idea', reaction_mode: 'down')).to be_nil
      end
    end

    context 'when reacting is enabled for that phase, but disabled for the current phase' do
      let(:phases_config) { { sequence: 'xxcxx', c: { reacting_enabled: false }, x: { reacting_enabled: true, reacting_dislike_enabled: true } } }

      it 'returns nil' do
        expect(service.denied_reason_for_action('reacting_idea', reaction_mode: 'up')).to be_nil
        expect(service.denied_reason_for_action('reacting_idea', reaction_mode: 'down')).to be_nil
      end
    end

    context 'when the like limit was reached for that phase' do
      let(:phases_config) do
        {
          sequence: 'xxcxx',
          c: { reacting_enabled: true, reacting_dislike_enabled: true },
          x: { reacting_enabled: true, reacting_dislike_enabled: true, reacting_like_method: 'limited', reacting_like_limited_max: 2 }
        }
      end

      it 'returns `reacting_like_limited_max_reached`' do
        ideas = create_list(:idea, 2, project: project, phases: project.phases)
        ideas.each do |idea|
          create(:reaction, mode: 'up', reactable: idea, user: user)
        end

        expect(service.denied_reason_for_action('reacting_idea', reaction_mode: 'up')).to eq 'reacting_like_limited_max_reached'
        expect(service.denied_reason_for_action('reacting_idea', reaction_mode: 'down')).to be_nil
      end
    end
  end
end
