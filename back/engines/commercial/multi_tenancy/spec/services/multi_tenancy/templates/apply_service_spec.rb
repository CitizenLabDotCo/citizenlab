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

  describe '#generate_model_identifiers!' do
    # AreasStaticPage is the only model with a bigint (sequence) PK; every other model
    # uses a UUID. Pre-generating a UUID for its id would cast to a garbage/colliding
    # integer and break template application, so its id must be left for the DB sequence.
    let(:serialized_models) do
      {
        'models' => {
          Area => { 'area-1' => { 'title_multiloc' => { 'en' => 'Area' } } },
          AreasStaticPage => { 'asp-1' => {}, 'asp-2' => {} }
        }
      }
    end

    it 'pre-generates a UUID id for UUID-keyed models' do
      mapping = service.send(:generate_model_identifiers!, serialized_models)

      generated_id = serialized_models['models'][Area]['area-1']['id']
      expect(generated_id).to match(/\A\h{8}-\h{4}-\h{4}-\h{4}-\h{12}\z/)
      expect(mapping['area-1']).to eq(generated_id)
    end

    it 'does not assign an id to bigint-keyed models (leaves it to the DB sequence)' do
      mapping = service.send(:generate_model_identifiers!, serialized_models)

      expect(serialized_models['models'][AreasStaticPage]['asp-1']).not_to have_key('id')
      expect(serialized_models['models'][AreasStaticPage]['asp-2']).not_to have_key('id')
      expect(mapping).not_to include('asp-1', 'asp-2')
    end
  end
end
