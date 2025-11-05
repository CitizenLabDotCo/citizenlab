# frozen_string_literal: true

require 'rails_helper'

describe SideFxPhaseService do
  include SideFxHelper

  let(:service) { described_class.new }
  let(:user) { create(:user) }
  let(:phase) { create(:phase) }

  describe 'after_create' do
    it "logs a 'created' action when a phase is created" do
      expect { service.after_create(phase, user) }
        .to have_enqueued_job(LogActivityJob)
        .with(
          phase,
          'created',
          user,
          phase.created_at.to_i,
          project_id: phase.project_id,
          payload: { phase: clean_time_attributes(phase.attributes) }
        )
    end

    it { expect { service.after_create(phase, user) }.to have_enqueued_job(Surveys::WebhookManagerJob) }
  end

  describe 'after_update' do
    it "logs a 'changed' action job when the phase has changed" do
      phase.update(title_multiloc: { en: 'changed' })
      expect { service.after_update(phase, user) }
        .to have_enqueued_job(LogActivityJob)
        .with(
          phase,
          'changed',
          user,
          phase.updated_at.to_i,
          project_id: phase.project_id,
          payload: {
            change: sanitize_change(phase.saved_changes),
            phase: clean_time_attributes(phase.attributes)
          }
        )
    end

    describe 'changing attributes' do
      before do
        phase.update!(
          # Required to avoid errors when switching to native survey below
          ideas_order: nil,
          native_survey_title_multiloc: { en: 'Survey' },
          native_survey_button_multiloc: { en: 'Take the survey' }
        )
      end

      {
        description_multiloc: { 'en' => 'changed' },
        participation_method: 'native_survey',
        voting_method: 'multiple_voting',
        voting_max_votes_per_idea: 9,
        voting_max_total: 11,
        voting_min_total: 2,
        submission_enabled: false,
        commenting_enabled: false,
        reacting_enabled: false,
        reacting_like_method: 'limited',
        reacting_like_limited_max: 9,
        reacting_dislike_enabled: true,
        presentation_mode: 'map'
      }.each do |attribute, new_value|
        it "logs a '#{attribute}_changed' action job when the phase attribute has changed" do
          old_value = phase[attribute]
          phase.update!(attribute => new_value)
          expect { service.after_update(phase, user) }
            .to have_enqueued_job(LogActivityJob)
            .with(phase, "changed_#{attribute}", user, phase.updated_at.to_i, project_id: phase.project.id, payload: { change: [old_value, new_value] })
        end
      end
    end

    it { expect { service.after_update(phase, user) }.to have_enqueued_job(Surveys::WebhookManagerJob) }
  end

  describe 'before_destroy' do
    it { expect { service.before_destroy(phase, user) }.to have_enqueued_job(Surveys::WebhookManagerJob) }
  end

  describe 'after_destroy' do
    it "logs a 'deleted' action job when the phase is destroyed" do
      freeze_time do
        frozen_phase = phase.destroy
        expect { service.after_destroy(frozen_phase, user) }
          .to have_enqueued_job(LogActivityJob).exactly(1).times
      end
    end
  end

  describe 'after_delete_inputs' do
    it 'logs "inputs_deleted" activity' do
      expect(LogActivityJob).to receive(:perform_later).with(
        phase,
        'inputs_deleted',
        user,
        anything
      )
      service.after_delete_inputs phase, user
    end
  end

  context 'with phase permissions' do
    subject(:service) do
      described_class.new.tap { |s| s.permissions_update_service = permissions_update_service }
    end

    let(:permissions_update_service) { instance_double(Permissions::PermissionsUpdateService) }

    describe 'after_create' do
      specify do
        expect(permissions_update_service).to receive(:update_permissions_for_scope).with(phase)
        service.after_create(phase, user)
      end
    end

    describe 'after_update' do
      specify do
        expect(permissions_update_service).to receive(:update_permissions_for_scope).with(phase)
        service.after_update(phase, user)
      end
    end
  end
end
