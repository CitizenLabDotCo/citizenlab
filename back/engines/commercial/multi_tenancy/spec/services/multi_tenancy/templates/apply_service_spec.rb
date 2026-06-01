# frozen_string_literal: true

require 'rails_helper'

describe MultiTenancy::Templates::ApplyService do
  let(:service) { described_class.new }

  describe '#apply_internal_template', :template_test do
    it 'raises an error if the template does not exist' do
      expect do
        service.apply_internal_template('non_existing_template')
      end.to raise_error(MultiTenancy::Templates::Utils::UnknownTemplateError)
    end
  end

  describe '#apply' do
    MultiTenancy::Templates::Utils.new.internal_template_names.map do |template_name|
      it "successfully applies '#{template_name}' template" do
        template_utils = MultiTenancy::Templates::Utils.new
        locales = template_utils.required_locales(template_name)
        locales = ['en'] if locales.blank?

        tenant_name = template_name.tr('._', '-')
        tenant = create(:tenant, name: tenant_name, host: "#{tenant_name}.localhost", locales: locales, lifecycle: 'active')

        tenant.switch do
          expect { service.apply(template_name) }.not_to raise_error
        end
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
