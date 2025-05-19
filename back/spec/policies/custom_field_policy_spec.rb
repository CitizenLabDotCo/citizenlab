require 'rails_helper'

describe CustomFieldPolicy do
  subject(:policy) { described_class.new(user, field) }

  let(:scope) { CustomFieldPolicy::Scope.new(user, CustomField.where(resource_id: custom_form&.id), custom_form) }

  let(:custom_form) { create(:custom_form, participation_context: context) }
  let(:resource_atts) { {}.tap { |h| custom_form ? h[:resource] = custom_form : h[:resource_type] = 'User' } }
  let!(:visible_field) { create(:custom_field, hidden: false, enabled: true, **resource_atts) }
  let!(:disabled_field) { create(:custom_field, hidden: false, enabled: false, **resource_atts) }
  let!(:hidden_field) { create(:custom_field, hidden: true, enabled: true, **resource_atts) }

  shared_examples 'can see all fields' do
    %i[visible_field disabled_field hidden_field].each do |field_name|
      context field_name.to_s do
        let(:field) { send(field_name) }

        it { is_expected.to permit(:show) }
      end
    end

    it 'indexes all fields' do
      expect(scope.resolve).to match_array [visible_field, disabled_field, hidden_field]
    end
  end

  shared_examples 'can see only visible fields' do
    [
      [:visible_field, true],
      [:disabled_field, false],
      [:hidden_field, false]
    ].each do |field_name, permitted|
      context field_name.to_s do
        let(:field) { send(field_name) }

        it { is_expected.send(permitted ? :to : :not_to, permit(:show)) }
      end
    end

    it 'indexes only visible fields' do
      expect(scope.resolve).to match_array [visible_field]
    end
  end

  shared_examples 'cannot see any fields' do
    %i[visible_field disabled_field hidden_field].each do |field_name|
      context field_name.to_s do
        let(:field) { send(field_name) }

        it { is_expected.not_to permit(:show) }
      end
    end

    it 'does not index any field' do
      expect(scope.resolve).to be_empty
    end
  end

  context 'for a visitor' do
    let(:user) { nil }

    context 'cannot see the form context' do
      let(:context) { create(:private_admins_project) }

      include_examples 'cannot see any fields'
    end

    context 'can see the form context' do
      let(:context) { create(:project) }

      include_examples 'can see only visible fields'
    end

    context 'registration form' do
      let(:custom_form) { nil }

      include_examples 'can see only visible fields'
    end
  end

  context 'for a moderator' do
    let(:user) { create(:admin) }

    %i[input_form registration_form].each do |form_type|
      context form_type.to_s do
        let(:custom_form) do
          if form_type == :registration_form
            nil
          else
            create(:custom_form, participation_context: create(:native_survey_phase))
          end
        end

        include_examples 'can see all fields'
      end
    end
  end
end
