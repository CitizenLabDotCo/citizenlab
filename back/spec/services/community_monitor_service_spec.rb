# frozen_string_literal: true

require 'rails_helper'

describe CommunityMonitorService do
  let(:service) { described_class.new }
  let!(:project) { create(:community_monitor_project) }
  let(:current_user) { create(:admin) }

  describe '#enabled?' do
    context 'when feature is enabled' do
      it 'returns true' do
        expect(service.enabled?).to be true
      end
    end

    context 'when feature is disabled' do
      before { SettingsService.new.deactivate_feature! 'community_monitor' }

      it 'returns false' do
        expect(service.enabled?).to be false
      end
    end
  end

  describe '#project_id' do
    context 'when feature flag is enabled' do
      context 'when project ID is set' do
        it 'returns the project ID' do
          expect(service.project_id).to eq project.id
        end
      end

      context 'when project ID is not set' do
        before { AppConfiguration.instance.settings['community_monitor']['project_id'] = nil }

        it 'returns nil' do
          expect(service.project_id).to be_nil
        end
      end
    end

    context 'when feature flag is disabled' do
      before { SettingsService.new.deactivate_feature! 'community_monitor' }

      it 'returns nil' do
        expect(service.project_id).to be_nil
      end
    end
  end

  describe '#find_or_create_project' do
    context 'when project exists' do
      context 'when feature is enabled' do
        context 'when project ID is set' do
          it 'returns the existing project' do
            found_project = service.find_or_create_project(current_user)
            expect(found_project.id).to eq project.id
          end
        end

        context 'when project ID is not set in settings' do
          before { AppConfiguration.instance.settings['community_monitor']['project_id'] = nil }

          it 'updates the project ID in settings and returns it' do
            found_project = service.find_or_create_project(current_user)
            expect(found_project.id).to eq project.id
            expect(AppConfiguration.instance.settings['community_monitor']['project_id']).to eq project.id
          end
        end
      end

      context 'when feature is disabled' do
        before { SettingsService.new.deactivate_feature! 'community_monitor' }

        it 'raises not found' do
          expect { service.find_or_create_project(current_user) }.to raise_error(ActiveRecord::RecordNotFound)
        end
      end
    end

    context 'when project does not exist' do
      let!(:old_project_id) { project.id }

      before do
        project.destroy!
        AppConfiguration.instance.settings['community_monitor']['project_id'] = nil
      end

      context 'user is an admin' do
        it 'creates the community monitor project, phase, permissions and form' do
          created_project = service.find_or_create_project(current_user)
          created_phase = Phase.first
          created_permission = Permission.first
          created_form = CustomForm.first
          expect(created_project.hidden).to be true
          expect(created_project.internal_role).to eq 'community_monitor'
          expect(created_project.title_multiloc['en']).to eq 'Community monitor'
          expect(created_phase.project).to eq created_project
          expect(created_phase.participation_method).to eq 'community_monitor_survey'
          expect(created_phase.title_multiloc['en']).to eq 'Community monitor'
          expect(created_permission.permission_scope).to eq created_phase
          expect(created_permission.permitted_by).to eq 'everyone'
          expect(created_form.participation_context).to eq created_phase
          expect(created_form.custom_fields.count).to eq 15

          settings = AppConfiguration.instance.settings
          expect(settings['community_monitor']['project_id']).to eq created_project.id
          expect(settings['community_monitor']['project_id']).not_to eq old_project_id
        end
      end

      context 'when user is not an admin' do
        let(:current_user) { create(:user) }

        it 'raises not found' do
          expect { service.find_or_create_project(current_user) }.to raise_error(ActiveRecord::RecordNotFound)
        end
      end
    end
  end
end
