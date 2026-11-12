# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PulseCheck do
  describe 'CHECKS' do
    described_class::CHECKS.each do |key, definition|
      it "defines a valid pulse check for #{key}" do
        expect(definition.keys).to contain_exactly(:audience, :subject_type, :triggers, :admin_area, :cooldown, :expires_after)
        expect(described_class::AUDIENCES).to have_key(definition[:audience])
        expect(definition[:triggers]).to be_present
        expect(definition[:triggers] - described_class::TRIGGERS).to be_empty
        expect(definition[:admin_area]).to match(described_class::ADMIN_AREA_FORMAT) if definition[:admin_area]
        expect(definition[:cooldown]).to be_a(ActiveSupport::Duration)
        expect(definition[:expires_after]).to be_a(ActiveSupport::Duration)
        expect(definition[:subject_type]&.safe_constantize).to be_present if definition[:subject_type]
      end
    end
  end

  describe '.askable?' do
    it 'asks admins and project managers for a pulse check meant for managers' do
      expect(described_class.askable?('return_findability', create(:admin))).to be true
      expect(described_class.askable?('return_findability', create(:project_moderator))).to be true
    end

    it 'does not ask residents' do
      expect(described_class.askable?('return_findability', create(:user))).to be false
    end

    it 'only asks admins for a pulse check meant for admins' do
      stub_const('PulseCheck::CHECKS', { 'admin_only' => { audience: 'admins', subject_type: nil, triggers: %w[save], admin_area: nil, cooldown: 1.day, expires_after: 1.day } })
      expect(described_class.askable?('admin_only', create(:admin))).to be true
      expect(described_class.askable?('admin_only', create(:project_moderator))).to be false
    end

    it 'does not ask anyone for an unknown pulse check' do
      expect(described_class.askable?('unknown', create(:admin))).to be false
    end
  end

  describe 'validations' do
    it 'requires the subject the pulse check is about' do
      pulse_check = build(:pulse_check, key: 'project_setup_ease', subject: create(:idea))
      expect(pulse_check).not_to be_valid
      expect(pulse_check.errors.details[:subject]).to include(error: :invalid)
    end

    it 'rejects a subject for a pulse check about nothing in particular' do
      expect(build(:pulse_check, key: 'return_findability', subject: create(:project))).not_to be_valid
    end

    describe 'admin area' do
      using RSpec::Parameterized::TableSyntax

      where(:admin_area, :valid) do
        '/:locale/admin/projects/:projectId'                                                      | true
        '/:locale/admin/projects/:projectId/general'                                              | true
        '/:locale/admin/projects/:projectId/phases/:phaseId/survey-results'                       | true
        '/:locale/admin/dashboard/overview'                                                       | true
        '/en/admin/projects/0b3e-41/general?x=1'                                                  | false
        '/:locale/projects/:slug'                                                                 | false
        '/:locale/admin/projects/550e8400-e29b-41d4-a716-446655440000/general'                    | false
        '/:locale/admin/projects/:projectId/phases/550e8400-e29b-41d4-a716-446655440000/insights' | false
        '/:locale/admin/projects/:projectId/'                                                     | false
      end

      with_them do
        it { expect(build(:pulse_check, admin_area: admin_area).valid?).to eq valid }
      end
    end

    it 'requires a score once answered' do
      expect(build(:pulse_check, status: 'answered')).not_to be_valid
    end
  end
end
