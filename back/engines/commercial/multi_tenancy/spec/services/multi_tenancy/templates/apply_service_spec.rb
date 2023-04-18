# frozen_string_literal: true

require 'rails_helper'

describe MultiTenancy::Templates::ApplyService do
  let(:service) { described_class.new }

  describe '#apply', template_test: true do
    it 'raises an error if the template does not exist' do
      expect do
        service.apply('non_existing_template', external_template_group: 'test')
      end.to raise_error(MultiTenancy::Templates::Utils::UnknownTemplateError)
    end
  end

  describe '#apply' do
    MultiTenancy::Templates::Utils.new.available_internal_templates.map do |template_name|
      it "successfully applies '#{template_name}' template" do
        template_utils = MultiTenancy::Templates::Utils.new
        locales = template_utils.required_locales(template_name)
        locales = ['en'] if locales.blank?

        tenant_name = template_name.tr('._', '-')
        tenant = create(:tenant, name: tenant_name, host: "#{tenant_name}.localhost", locales: locales, lifecycle: 'active')

        tenant.switch { service.apply(template_name) }
      end
    end
  end

  describe '#apply_internal_template' do
    it 'raises an error if the template does not exist' do
      expect { service.apply_internal_template('non_existing_template') }
        .to raise_error(MultiTenancy::Templates::Utils::UnknownTemplateError)
    end
  end
end
