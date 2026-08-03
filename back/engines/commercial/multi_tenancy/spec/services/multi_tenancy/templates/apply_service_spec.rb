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

  describe 'tenant S3 client' do
    subject(:client) { described_class.new.send(:instance_variable_get, :@tenant_s3_client) }

    before { stub_env('AWS_REGION' => 'eu-central-1', 'AWS_ACCESS_KEY_ID' => 'k', 'AWS_SECRET_ACCESS_KEY' => 's') }

    it 'defaults to an endpoint-aware client honouring AWS_S3_ENDPOINT' do
      stub_env('AWS_S3_ENDPOINT', 'https://s3.fr-par.scw.cloud')
      expect(client.config.endpoint.to_s).to eq('https://s3.fr-par.scw.cloud')
      expect(client.config.force_path_style).to be(true)
    end

    it 'defaults to AWS S3 when AWS_S3_ENDPOINT is unset' do
      stub_env('AWS_S3_ENDPOINT', nil)
      expect(client.config.endpoint.to_s).to eq('https://s3.eu-central-1.amazonaws.com')
      expect(client.config.force_path_style).to be(false)
    end

    it 'still lets an injected client win (dependency injection preserved)' do
      injected = instance_double(Aws::S3::Client)
      service = described_class.new(tenant_s3_client: injected)
      expect(service.send(:instance_variable_get, :@tenant_s3_client)).to be(injected)
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
