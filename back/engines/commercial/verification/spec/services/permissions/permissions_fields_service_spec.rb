# frozen_string_literal: true

require 'rails_helper'

describe Permissions::PermissionsFieldsService do
  let(:service) { described_class.new }

  before do
    create(:custom_field_gender, enabled: true, required: false)
    SettingsService.new.activate_feature! 'custom_permitted_by'
    SettingsService.new.activate_feature! 'user_confirmation'

    configuration = AppConfiguration.instance
    settings = configuration.settings
    settings['verification'] = {
      allowed: true,
      enabled: true,
      verification_methods: [
        { name: 'cow', api_username: 'fake_username', api_password: 'fake_password', rut_empresa: 'fake_rut_empresa' },
        { name: 'id_card_lookup', method_name_multiloc: { en: 'By social security number' }, card_id_multiloc: { en: 'Social security number' }, card_id_placeholder: 'xx-xxxxx-xx', card_id_tooltip_multiloc: { en: 'You can find this number on you card. We just check, we don\'t store it' }, explainer_image_url: 'https://some.fake/image.png' }
      ]
    }
    configuration.save!
  end

  describe '#fields_for_permission' do
    it 'returns verification in non-persisted default fields when permitted_by "users"' do
      permission = create(:permission, permitted_by: 'users')

      fields = service.fields_for_permission(permission)
      expect(fields.count).to eq 4
      expect(fields.map(&:persisted?)).to eq [false, false, false, false]
      expect(fields.pluck(:field_type)).to eq %w[name email verification custom_field]
      expect(fields.pluck(:enabled)).to eq [true, true, false, true]
      expect(fields.pluck(:required)).to eq [true, true, false, false]
      expect(fields.find { |f| f.field_type == 'email' }.config).to match({ 'password' => true, 'confirmed' => true })
    end
  end

  describe '#create_default_fields_for_custom_permitted_by' do
    let(:permission) { create(:permission, permitted_by: 'custom') }

    context 'permitted_by is "custom" and has no fields' do
      it 'creates default fields for the permission in the correct order' do
        service.create_default_fields_for_custom_permitted_by(permission: permission, previous_permitted_by: 'users')
        fields = permission.permissions_fields
        expect(fields.count).to eq 4
        expect(fields.pluck(:field_type)).to eq %w[name email verification custom_field]
        expect(fields.pluck(:ordering)).to eq [0, 1, 2, 3]
        expect(fields.pluck(:enabled)).to eq [true, true, false, true]
        expect(fields.pluck(:required)).to eq [true, true, false, false]
      end
    end
  end
end
