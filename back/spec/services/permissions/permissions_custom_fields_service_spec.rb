# frozen_string_literal: true

require 'rails_helper'

describe Permissions::PermissionsCustomFieldsService do
  let(:service) { described_class.new }

  before do
    @domicile_field = create(:custom_field_domicile, enabled: true, required: true)
    @gender_field = create(:custom_field_gender, enabled: true, required: false)
    AppConfiguration.instance.settings['id_config'] = { 'allowed' => true, 'enabled' => true, 'id_methods' => [{ name: 'fake_sso', enabled_for_verified_actions: true }] }
    AppConfiguration.instance.save!
  end

  describe '#fields_for_permission' do
    context "custom_fields_behavior is 'global'" do
      it 'returns non-persisted default fields when permitted_by "users"' do
        permission = create(:permission, permitted_by: 'users', custom_fields_behavior: 'global')
        fields = service.fields_for_permission(permission)
        expect(fields.count).to eq 2
        expect(fields.map(&:persisted?)).to contain_exactly(false, false)
        expect(fields.pluck(:required)).to contain_exactly(true, false)
      end

      it 'returns non-persisted default fields when require_verification = true' do
        permission = create(:permission, permitted_by: 'users', require_verification: true, custom_fields_behavior: 'global')
        fields = service.fields_for_permission(permission)
        expect(fields.count).to eq 2
        expect(fields.map(&:persisted?)).to contain_exactly(false, false)
        expect(fields.pluck(:required)).to contain_exactly(false, true)
      end

      it 'returns no permissions fields when permitted_by "everyone" and they cannot be asked in the form' do
        phase = create(:native_survey_phase)
        permission = create(
          :permission,
          permission_scope: phase,
          permitted_by: 'everyone',
          custom_fields_behavior: 'global',
          user_data_collection: 'anonymous'
        )
        expect(service.fields_for_permission(permission)).to be_empty
      end

      it 'returns the platform fields when permitted_by "everyone" and user fields are allowed in survey form' do
        phase = create(:native_survey_phase)
        permission = create(
          :permission,
          permission_scope: phase,
          permitted_by: 'everyone',
          custom_fields_behavior: 'global',
          user_fields_in_form: true
        )
        fields = service.fields_for_permission(permission)
        expect(fields.map { |field| field.custom_field.code }).to eq %w[domicile gender]
      end

      context 'fields related to groups' do
        it 'automatically adds any fields requiring a value in a smart group as required after existing fields' do
          permission = create(:permission, permitted_by: 'users', custom_fields_behavior: 'global')
          custom_field = create(:custom_field_birthyear, enabled: false)
          group = create(:smart_group, rules: [
            { ruleType: 'custom_field_select', customFieldId: custom_field.id, predicate: 'is_one_of', value: ['a7212e05-2ff0-4c7f-89d3-dbfc7c049aa5'] }
          ])
          fields = service.fields_for_permission(permission)
          expect(fields.count).to eq 2
          permission.groups << group
          fields = service.fields_for_permission(permission)
          expect(fields.count).to eq 3
          expect(fields.last.custom_field_id).to eq custom_field.id
          expect(fields.last.lock).to eq 'group'
          expect(fields.last.required).to be true
        end

        it 'ignores smart groups with no custom field' do
          permission = create(:permission, permitted_by: 'users')
          group = create(:smart_group, rules: [
            { ruleType: 'email', predicate: 'ends_on', value: 'test.com' }
          ])

          fields = service.fields_for_permission(permission)
          expect(fields.count).to eq 2
          permission.groups << group
          fields = service.fields_for_permission(permission)
          expect(fields.count).to eq 2
        end

        it 'adds any fields used by a smart group where value should be empty as optional after existing fields' do
          permission = create(:permission, permitted_by: 'users', custom_fields_behavior: 'global')
          custom_field = create(:custom_field_birthyear, enabled: false)
          group = create(:smart_group, rules: [
            { ruleType: 'custom_field_select', customFieldId: custom_field.id, predicate: 'is_empty' }
          ])
          fields = service.fields_for_permission(permission)
          expect(fields.count).to eq 2
          permission.groups << group
          fields = service.fields_for_permission(permission)
          expect(fields.count).to eq 3
          expect(fields.last.custom_field_id).to eq custom_field.id
          expect(fields.last.lock).to eq 'group'
          expect(fields.last.required).to be false
        end

        describe '#extract_custom_field_ids_from_rules' do
          it 'successfully extracts custom field ids and whether required from rules' do
            groups = [
              create(:smart_group, rules: [
                { ruleType: 'custom_field_select', customFieldId: '19b2088c-bb8c-4f3c-812d-4a2faf594497', predicate: 'is_empty' },
                { ruleType: 'custom_field_select', customFieldId: '9b43081c-2ba1-432a-89fb-81cfa243cee7', predicate: 'is_one_of', value: ['a7212e05-2ff0-4c7f-89d3-dbfc7c049aa5'] },
                { ruleType: 'email', predicate: 'ends_on', value: 'test.com' }
              ]),
              create(:smart_group, rules: [
                { ruleType: 'custom_field_select', customFieldId: '8240f6b0-aca3-4151-a8ca-f68a028d0e83', predicate: 'is_one_of', value: ['a7212e05-2ff0-4c7f-89d3-dbfc7c049aa5'] }
              ]),
              create(:smart_group, rules: [
                { ruleType: 'custom_field_select', customFieldId: '2a982fca-e026-4173-9ddd-03a8082160dc', predicate: 'is_empty' }
              ])
            ]
            expect(service.send(:extract_custom_field_ids_from_rules, groups)).to contain_exactly({ id: '19b2088c-bb8c-4f3c-812d-4a2faf594497', required: false }, { id: '9b43081c-2ba1-432a-89fb-81cfa243cee7', required: true }, { id: '8240f6b0-aca3-4151-a8ca-f68a028d0e83', required: true }, { id: '2a982fca-e026-4173-9ddd-03a8082160dc', required: false })
          end
        end
      end
    end

    context "custom_fields_behavior is 'disabled'" do
      let(:permission) { create(:permission, permitted_by: 'users') }

      it 'returns no fields for every permitted_by' do
        %w[everyone users admins_moderators].each do |permitted_by|
          permission.update!(permitted_by: permitted_by, custom_fields_behavior: 'disabled')
          expect(service.fields_for_permission(permission)).to be_empty
        end
      end

      it 'returns no fields even when fields are persisted' do
        create(:permissions_custom_field, permission: permission, custom_field: create(:custom_field_birthyear))
        permission.update!(custom_fields_behavior: 'disabled')
        expect(service.fields_for_permission(permission)).to be_empty
      end
    end

    context "custom_fields_behavior is 'custom'" do
      let(:permission) { create(:permission, permitted_by: 'users') }

      it 'returns persisted fields for every permitted_by that is asked questions' do
        domicile_field = create(:permissions_custom_field, permission: permission, custom_field: create(:custom_field_birthyear))
        %w[everyone users].each do |permitted_by|
          permission.update!(permitted_by: permitted_by, custom_fields_behavior: 'custom')
          fields = service.fields_for_permission(permission)
          expect(fields.count).to eq 1
          expect(fields.first.persisted?).to be true
          expect(fields.first).to eq domicile_field
        end
      end

      it 'returns persisted fields when permitted_by "everyone" and user fields are allowed in survey form' do
        domicile_field = create(:permissions_custom_field, permission: permission, custom_field: create(:custom_field_birthyear))
        phase = create(:native_survey_phase)
        permission.update!(
          permitted_by: 'everyone',
          permission_scope: phase,
          custom_fields_behavior: 'custom',
          user_fields_in_form: true
        )
        fields = service.fields_for_permission(permission)
        expect(fields.count).to eq 1
        expect(fields.first.persisted?).to be true
        expect(fields.first).to eq domicile_field
      end

      context 'fields related to groups' do
        it 'automatically adds any fields used in a group to the end' do
          permission = create(:permission, permitted_by: 'users', custom_fields_behavior: 'custom')
          create(:permissions_custom_field, permission: permission, custom_field: create(:custom_field_birthyear))
          group_custom_field = create(:custom_field, enabled: false)
          group = create(:smart_group, rules: [
            { ruleType: 'custom_field_select', customFieldId: group_custom_field.id, predicate: 'is_empty' }
          ])
          fields = service.fields_for_permission(permission)
          expect(fields.count).to eq 1
          permission.groups << group
          fields = service.fields_for_permission(permission)
          expect(fields.count).to eq 2
          expect(fields.first.persisted?).to be true
          expect(fields.first.lock).to be_nil
          expect(fields.last.custom_field_id).to eq group_custom_field.id
          expect(fields.last.persisted?).to be false
          expect(fields.last.required).to be false
          expect(fields.last.lock).to eq 'group'
        end

        it 'updates existing fields if used in a group' do
          permission = create(:permission, permitted_by: 'users', custom_fields_behavior: 'custom')
          service.persist_default_fields(permission)
          fields = service.fields_for_permission(permission)
          gender_field = fields.last
          gender_field.update!(required: false)
          expect(gender_field.custom_field.code).to eq 'gender'
          expect(gender_field.required).to be false

          group = create(:smart_group, rules: [
            { ruleType: 'custom_field_select', customFieldId: gender_field.custom_field_id, predicate: 'is_one_of', value: ['b167e8b7-efd6-4948-a182-69749fbbd6f3'] }
          ])
          permission.groups << group
          fields = service.fields_for_permission(permission)
          expect(fields.last.id).to eq gender_field.id
          expect(fields.last.custom_field.code).to eq 'gender'
          expect(fields.last.required).to be true
        end
      end
    end

    context 'verification' do
      before do
        @gender_field.update!(enabled: false, required: false)
        @domicile_field.update!(enabled: true, required: false)
      end

      context 'when permission does not have require_verification=true and there are no groups' do
        let(:permission) { create(:permission, permitted_by: 'users') }

        it 'returns default fields without those linked to verification' do
          fields = service.fields_for_permission(permission, return_hidden: true)
          expect(fields.pluck(:ordering)).to eq [0]
          expect(fields.pluck(:required)).to eq [false]
          expect(fields.filter_map { |f| f.custom_field&.code }).to eq %w[domicile]
        end
      end

      context 'when permission has require_verification=true' do
        it 'adds additional fields linked to verification method' do
          permission = create(:permission, permitted_by: 'users', require_verification: true)
          fields = service.fields_for_permission(permission, return_hidden: true)
          expect(fields.pluck(:ordering)).to eq [0, 1]
          expect(fields.pluck(:lock)).to eq ['verification', nil]
          expect(fields.pluck(:required)).to eq [true, false]
          expect(fields.filter_map { |f| f.custom_field&.code }).to eq %w[gender domicile]
        end

        it 'sets the field to required and reorders if the permissions_custom_field is already there but not required' do
          @gender_field.update!(enabled: true)

          # check initial state
          permission = create(:permission, permitted_by: 'users')
          fields = service.fields_for_permission(permission, return_hidden: true)
          expect(fields.pluck(:ordering)).to eq [0, 1]
          expect(fields.pluck(:lock)).to eq [nil, nil]
          expect(fields.pluck(:required)).to eq [false, false]
          expect(fields.filter_map { |f| f.custom_field&.code }).to eq %w[domicile gender]

          # check has changed after updating to verified permitted_by
          permission.update!(require_verification: true)
          fields = service.fields_for_permission(permission, return_hidden: true)
          expect(fields.pluck(:ordering)).to eq [0, 1]
          expect(fields.pluck(:lock)).to eq ['verification', nil]
          expect(fields.pluck(:required)).to eq [true, false]
          expect(fields.filter_map { |f| f.custom_field&.code }).to eq %w[gender domicile]
        end

        it 'sets the value of lock to "verification" and reorders for fields already added and locked by groups' do
          permission = create(:permission, permitted_by: 'users')
          group = create(:smart_group, rules: [
            { ruleType: 'custom_field_select', customFieldId: @gender_field.id, predicate: 'is_one_of', value: ['a7212e05-2ff0-4c7f-89d3-dbfc7c049aa5'] }
          ])
          permission.groups << group

          # check initial state
          fields = service.fields_for_permission(permission, return_hidden: true)
          expect(fields.pluck(:ordering)).to eq [0, 1]
          expect(fields.pluck(:lock)).to eq [nil, 'group']
          expect(fields.pluck(:required)).to eq [false, true]
          expect(fields.filter_map { |f| f.custom_field&.code }).to eq %w[domicile gender]

          # check has changed after updating to require_verification
          permission.update!(require_verification: true)
          fields = service.fields_for_permission(permission, return_hidden: true)
          expect(fields.pluck(:ordering)).to eq [0, 1]
          expect(fields.pluck(:lock)).to eq ['verification', nil]
          expect(fields.pluck(:required)).to eq [true, false]
          expect(fields.filter_map { |f| f.custom_field&.code }).to eq %w[gender domicile]
        end
      end
    end
  end

  describe '#persist_default_fields' do
    let(:permission) { create(:permission, permitted_by: 'users') }

    context 'permitted_by is "users" and has no persisted permissions fields' do
      it 'creates default fields for the permission in the correct order' do
        service.persist_default_fields(permission)
        fields = permission.permissions_custom_fields
        expect(fields.count).to eq 2
        expect(fields.pluck(:ordering)).to eq [0, 1]
        expect(fields.pluck(:required)).to eq [true, false]
      end
    end

    context 'permitted_by is "everyone" and has no persisted permissions fields' do
      it 'creates the platform fields, which #fields_for_permission would not resolve to' do
        permission.update!(permitted_by: 'everyone')
        service.persist_default_fields(permission)
        expect(permission.permissions_custom_fields.count).to eq 2
      end
    end

    context 'permission already has fields' do
      it 'does not add fields' do
        service.persist_default_fields(permission)
        num_permissions_custom_fields = permission.permissions_custom_fields.count

        service.persist_default_fields(permission)
        expect(permission.permissions_custom_fields.count).to eq num_permissions_custom_fields
      end
    end
  end

  # The three attributes that decide which demographic questions get asked interact,
  # so they are documented together: custom_fields_behavior picks the source,
  # permitted_by decides whether the platform-wide fields apply at all
  # (#default_fields is empty unless #allow_global_custom_fields?), and for 'everyone'
  # nothing is asked unless the questions can be asked in the form itself, which on a
  # native survey depends on user_data_collection.
  describe 'combinations of permitted_by, user_data_collection and custom_fields_behavior' do
    # Disabled, so that it is not one of the platform's fields and the persisted
    # field is told apart from the global ones by its code alone.
    let!(:birthyear_field) { create(:custom_field_birthyear, enabled: false) }

    def asked_question_codes(permitted_by:, behavior:, user_data_collection: 'all_data')
      permission = create(
        :permission,
        action: 'posting_idea',
        permission_scope: create(:native_survey_phase),
        permitted_by: permitted_by,
        user_data_collection: user_data_collection,
        custom_fields_behavior: behavior
      )
      create(:permissions_custom_field, permission: permission, custom_field: birthyear_field)

      service.fields_for_permission(permission).map { |field| field.custom_field.code }
    end

    {
      # permitted_by, user_data_collection, custom_fields_behavior => questions asked
      %w[users all_data global] => %w[domicile gender],
      %w[users all_data disabled] => [],
      %w[users all_data custom] => %w[birthyear],
      # user_data_collection does not gate the questions when users have to register
      %w[users anonymous global] => %w[domicile gender],
      %w[users anonymous custom] => %w[birthyear],
      # 'everyone' can only be asked in the form, but does resolve the global fields
      %w[everyone all_data global] => %w[domicile gender],
      %w[everyone all_data disabled] => [],
      %w[everyone all_data custom] => %w[birthyear],
      # an anonymous survey cannot ask anything, whatever is configured
      %w[everyone anonymous global] => [],
      %w[everyone anonymous disabled] => [],
      %w[everyone anonymous custom] => [],
      # admins and managers are never asked demographic questions at all
      %w[admins_moderators all_data global] => [],
      %w[admins_moderators all_data disabled] => [],
      %w[admins_moderators all_data custom] => []
    }.each do |(permitted_by, user_data_collection, behavior), expected_codes|
      it "asks #{expected_codes.presence&.join(', ') || 'nothing'} when permitted_by is '#{permitted_by}', user_data_collection is '#{user_data_collection}' and custom_fields_behavior is '#{behavior}'" do
        codes = asked_question_codes(
          permitted_by: permitted_by,
          user_data_collection: user_data_collection,
          behavior: behavior
        )
        expect(codes).to eq expected_codes
      end
    end
  end
end
