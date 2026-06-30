require 'rails_helper'

# NOTE: Most of the tests for Phase are in the tests for the sub-class: ProjectPermissionsService
describe Permissions::PhasePermissionsService do
  let(:service) { described_class.new(phase, user) }
  let(:user) { create(:user) }
  let(:phase) { project.phases.first }
  let(:project) { create(:project_with_current_phase, phases_config: phases_config) }

  context 'when the project is archived' do
    let(:project) { create(:single_phase_ideation_project, admin_publication_attributes: { publication_status: 'archived' }) }

    it 'returns `project_inactive`' do
      expect(service.denied_reason_for_action('posting_idea')).to eq 'project_inactive'
    end
  end

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

  context '"posting_idea" denied_reason_for_action' do
    context 'community monitor project with everyone permissions and everyone_tracking enabled' do
      let!(:phase) do
        create(:idea_status_proposed)
        phase = create(:community_monitor_survey_phase, with_permissions: true)
        phase.permissions.first.update!(permitted_by: 'everyone', everyone_tracking_enabled: true)
        phase
      end

      let(:request) { nil }
      let(:service) { described_class.new(phase, user, request: request) }

      context 'user is logged in' do
        let(:user) { create(:user) }

        it 'returns nil when no survey response yet posted' do
          expect(service.denied_reason_for_action('posting_idea')).to be_nil
        end

        it 'returns nil when last survey response was posted more over 3 months ago' do
          create(:native_survey_response, author: user, project: phase.project, creation_phase: phase, phases: [phase], published_at: 4.months.ago)
          expect(service.denied_reason_for_action('posting_idea')).to be_nil
        end

        it 'returns "posting_limited_max_reached" when last survey response was posted less than 3 months ago' do
          create(:native_survey_response, author: user, project: phase.project, creation_phase: phase, phases: [phase], published_at: 2.months.ago)
          expect(service.denied_reason_for_action('posting_idea')).to eq 'posting_limited_max_reached'
        end
      end

      context 'user is not logged in' do
        let(:user) { nil }

        it 'returns nil when no survey response yet posted' do
          expect(service.denied_reason_for_action('posting_idea')).to be_nil
        end

        context 'without cookie consent' do
          let(:request) do
            instance_double(ActionDispatch::Request, {
              cookies: { phase.id => '{}' }
            })
          end

          it 'returns "posting_limited_max_reached" if empty cookie is present and has not expired' do
            expect(service.denied_reason_for_action('posting_idea')).to eq 'posting_limited_max_reached'
          end
        end

        context 'with cookie consent' do
          let(:request) do
            instance_double(ActionDispatch::Request, {
              cookies: { phase.id => '{"lo": "LOGGED_OUT_HASH", "li": "LOGGED_IN_HASH"}' }
            })
          end

          context 'using logged out hash - created when posting response when logged out' do
            it 'returns nil when last survey response was posted more over 3 months ago' do
              create(:native_survey_response, author: nil, author_hash: 'LOGGED_OUT_HASH', project: phase.project, published_at: 4.months.ago)
              expect(service.denied_reason_for_action('posting_idea')).to be_nil
            end

            it 'returns "posting_limited_max_reached" if survey response was posted less than 3 months ago' do
              create(:native_survey_response, author: nil, author_hash: 'LOGGED_OUT_HASH', project: phase.project, published_at: 2.months.ago)
              expect(service.denied_reason_for_action('posting_idea')).to eq 'posting_limited_max_reached'
            end
          end

          context 'using logged in hash - created from author when posting previously logged in' do
            it 'returns nil when last survey response was posted more over 3 months ago' do
              create(:native_survey_response, author: nil, author_hash: 'LOGGED_IN_HASH', project: phase.project, published_at: 4.months.ago)
              expect(service.denied_reason_for_action('posting_idea')).to be_nil
            end

            it 'returns "posting_limited_max_reached" if survey response was posted less than 3 months ago' do
              create(:native_survey_response, author: nil, author_hash: 'LOGGED_IN_HASH', project: phase.project, published_at: 2.months.ago)
              expect(service.denied_reason_for_action('posting_idea')).to eq 'posting_limited_max_reached'
            end
          end
        end

        context 'with malformed cookie' do
          let(:request) do
            instance_double(ActionDispatch::Request, {
              cookies: { phase.id => '{malformed_cookie_value' }
            })
          end

          it 'returns "posting_limited_max_reached" if the cookie is malformed but has not expired' do
            expect(service.denied_reason_for_action('posting_idea')).to eq 'posting_limited_max_reached'
          end
        end
      end
    end
  end

  describe '#action_descriptors' do
    subject(:descriptors) { service.action_descriptors }

    let(:phases_config) { { sequence: 'c' } } # a single, current ideation phase

    it 'returns a descriptor with :enabled and :disabled_reason for every supported action' do
      expect(descriptors.keys).to match_array(%i[
        posting_idea commenting_idea reacting_idea comment_reacting_idea annotating_document
        taking_survey taking_poll voting volunteering
      ])
      descriptors.each_value { |descriptor| expect(descriptor).to include(:enabled, :disabled_reason) }
    end

    it 'nests up and down under reacting_idea' do
      expect(descriptors[:reacting_idea]).to include(:up, :down)
      expect(descriptors[:reacting_idea][:up]).to include(:enabled, :disabled_reason)
      expect(descriptors[:reacting_idea][:down]).to include(:enabled, :disabled_reason)
    end

    it 'mirrors commenting_idea onto comment_reacting_idea' do
      expect(descriptors[:comment_reacting_idea]).to eq(descriptors[:commenting_idea])
    end

    it 'disables actions the participation method does not support, with method-specific reasons' do
      expect(descriptors[:taking_survey]).to eq(enabled: false, disabled_reason: 'not_survey')
      expect(descriptors[:taking_poll]).to eq(enabled: false, disabled_reason: 'not_poll')
      expect(descriptors[:voting]).to eq(enabled: false, disabled_reason: 'not_voting')
      expect(descriptors[:annotating_document]).to eq(enabled: false, disabled_reason: 'not_document_annotation')
      expect(descriptors[:volunteering]).to eq(enabled: false, disabled_reason: 'not_volunteering')
    end
  end
end
