require 'rails_helper'

RSpec.describe Permission, type: :model do

  describe '#participation_conditions' do
    it 'returns expected output' do
      birthyear = create(:custom_field_number, title_multiloc: { 'en' => 'Birthyear?' }, key: 'birthyear', code: 'birthyear')

      create(:user, first_name: 'Sebi', email: 'sebi@citizenlab.co', birthyear: 1992)
      create(:user, first_name: 'Koen', email: 'koen@citizenlab.co', birthyear: 1987)
      create(:user, first_name: 'Flupke', email: 'flupke@gmail.com', birthyear: 1930)

      email_rule = {
        'ruleType' => 'email',
        'predicate' => 'ends_on',
        'value' => 'citizenlab.co'
      }
      bday_rule = {
        'ruleType' => 'custom_field_number',
        'customFieldId' => birthyear.id,
        'predicate' => 'is_smaller_than_or_equal',
        'value' => 1988
      }
      verified_rule = {
        'ruleType' => 'verified',
        'predicate' => 'is_verified'
      }

      manual = create(:group)
      manual.add_member create(:user)
      cl_verified = create(:smart_group, rules: [email_rule, verified_rule])
      veterans = create(:smart_group, rules: [bday_rule])
      verified = create(:smart_group, rules: [verified_rule])

      permission = build(:permission, permitted_by: 'groups', groups: [cl_verified, manual, verified, veterans])
      permission.save!(validate: false) # we make no assumptions on the registered scope-types.

      service = SmartGroups::RulesService.new
      expect(permission.participation_conditions).to match [
        [service.parse_json_rule(email_rule).description_multiloc],
        [service.parse_json_rule(bday_rule).description_multiloc]
      ]
    end
  end

  describe "#for_user" do
    before(:all) do
      # rubocop:disable RSpec/BeforeAfterAll
      @scope_types = PermissionsService.instance_variable_get(:@scope_spec_hash)

      # rubocop:disable Style/SingleLineMethods Layout/EmptyLineBetweenDefs
      dummy_global_scope = Module.new do
        def self.actions(_scope = nil) %w[a1 a2 a3 a4 a5] end
        def self.scope_type; nil end
        def self.scope_class; nil end
      end
      # rubocop:enable Style/SingleLineMethods Layout/EmptyLineBetweenDefs

      PermissionsService.clear_scope_types
      PermissionsService.register_scope_type(dummy_global_scope)
    end

    after(:all) do
      # Restore registered scope-types as they were before the tests.
      PermissionsService.instance_variable_set(:@scope_spec_hash, @scope_types)
    end

    before(:each) { described_class.destroy_all }

    # +let!(permissions)+ must be run after +before(:each)+ which deletes all permission records
    let!(:permissions) do
      [
        create(:global_permission, :by_everyone, action: 'a1'),
        create(:global_permission, :by_users, action: 'a2'),
        create(:global_permission, :by_admins_moderators, action: 'a3'),
        create(:global_permission, permitted_by: 'groups', groups: [manual_grp], action: 'a4'),
        create(:global_permission, permitted_by: 'groups', groups: [cl_veteran_grp], action: 'a5')
      ]
    end
    let(:manual_grp) { create(:group) }
    let(:cl_veteran_grp) do
      rule1 = { ruleType: 'email', predicate: 'ends_on', value: 'citizenlab.co' }

      birthyear_field = create(
        :custom_field_number,
        title_multiloc: { 'en' => 'Birthyear?' },
        key: 'birthyear',
        code: 'birthyear'
      )
      rule2 = {
        ruleType: 'custom_field_number',
        customFieldId: birthyear_field.id,
        predicate: 'is_smaller_than_or_equal',
        value: 1988
      }

      create(:smart_group, rules: [rule1, rule2])
    end

    context 'when user belongs to the authorized smart group' do
      let(:user) { create(:user, email: 'info@citizenlab.co', birthyear: 1980) }

      it {
        expect(described_class.for_user(user)).to match_array [permissions[0], permissions[1], permissions[4]]
      }
    end
  end
end
