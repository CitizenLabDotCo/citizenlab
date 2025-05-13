require 'rails_helper'

describe CustomFieldPolicy do
  subject(:policy) { described_class.new(user, field) }

  let(:scope) { CustomFieldPolicy::Scope.new(user, CustomField.where(resource_id: custom_form&.id), custom_form) }

  let(:custom_form) { create(:custom_form, participation_context: context) }
  let(:resource_atts) { {}.tap { |h| custom_form ? h[:resource] = custom_form : h[:resource_type] = 'User' } }
  let!(:visible_field) { create(:custom_field, hidden: false, enabled: true, **resource_atts) }
  let!(:disabled_field) { create(:custom_field, hidden: false, enabled: false, **resource_atts) }
  let!(:hidden_field) { create(:custom_field, hidden: true, enabled: true, **resource_atts) }

  context 'for a visitor' do
    let(:user) { nil }

    context 'cannot see the form context' do
      let(:context) { create(:private_admins_project) }

      context 'visible field' do
        let(:field) { visible_field }

        it { is_expected.not_to permit(:show) }
      end

      it 'does not index any field' do
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'can see the form context' do
      let(:context) { create(:project) }

      context 'visible field' do
        let(:field) { visible_field }

        it { is_expected.to permit(:show) }
      end

      context 'disabled field' do
        let(:field) { disabled_field }

        it { is_expected.not_to permit(:show) }
      end

      context 'hidden field' do
        let(:field) { hidden_field }

        it { is_expected.not_to permit(:show) }
      end

      it 'indexes only visible fields' do
        expect(scope.resolve.size).to eq 1
        expect(scope.resolve).to match_array [visible_field]
      end
    end

    context 'registration form' do
      let(:custom_form) { nil }

      context 'visible field' do
        let(:field) { visible_field }

        it { is_expected.to permit(:show) }
      end

      context 'disabled field' do
        let(:field) { disabled_field }

        it { is_expected.not_to permit(:show) }
      end

      context 'hidden field' do
        let(:field) { hidden_field }

        it { is_expected.not_to permit(:show) }
      end

      it 'indexes only visible fields' do
        expect(scope.resolve.size).to eq 1
        expect(scope.resolve).to match_array [visible_field]
      end
    end
  end

  context 'for a moderator' do
    let(:user) { create(:admin) }

    context 'input form' do
      let(:context) { create(:native_survey_phase) }

      context 'visible field' do
        let(:field) { visible_field }

        it { is_expected.to permit(:show) }
      end

      context 'disabled field' do
        let(:field) { disabled_field }

        it { is_expected.to permit(:show) }
      end

      context 'hidden field' do
        let(:field) { hidden_field }

        it { is_expected.to permit(:show) }
      end

      it 'indexes all fields' do
        expect(scope.resolve.size).to eq 3
        expect(scope.resolve).to match_array [visible_field, disabled_field, hidden_field]
      end
    end

    context 'registration form' do
      let(:custom_form) { nil }

      context 'visible field' do
        let(:field) { visible_field }

        it { is_expected.to permit(:show) }
      end

      context 'disabled field' do
        let(:field) { disabled_field }

        it { is_expected.to permit(:show) }
      end

      context 'hidden field' do
        let(:field) { hidden_field }

        it { is_expected.to permit(:show) }
      end

      it 'indexes all fields' do
        expect(scope.resolve.size).to eq 3
        expect(scope.resolve).to match_array [visible_field, disabled_field, hidden_field]
      end
    end
  end
end
