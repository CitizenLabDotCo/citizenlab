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
    it 'assigns a fresh SecureRandom uuid to each UUID-keyed record, including areas_static_pages' do
      new_ids = [SecureRandom.uuid, SecureRandom.uuid, SecureRandom.uuid]
      allow(SecureRandom).to receive(:uuid).and_return(*new_ids)

      serialized_models = {
        'models' => {
          Area => { 'area-1' => { 'title_multiloc' => { 'en' => 'Area' } } },
          # areas_static_pages now has a uuid PK (TAN-7831), so its join rows each get a
          # distinct uuid instead of colliding when cast to the old bigint id.
          AreasStaticPage => { 'asp-1' => {}, 'asp-2' => {} }
        }
      }

      mapping = service.send(:generate_model_identifiers!, serialized_models)

      expect(serialized_models['models'][Area]['area-1']['id']).to eq(new_ids[0])
      expect(serialized_models['models'][AreasStaticPage]['asp-1']['id']).to eq(new_ids[1])
      expect(serialized_models['models'][AreasStaticPage]['asp-2']['id']).to eq(new_ids[2])
      expect(mapping).to eq('area-1' => new_ids[0], 'asp-1' => new_ids[1], 'asp-2' => new_ids[2])
    end

    it 'skips models whose primary key is not a UUID, leaving the id for the database' do
      column = instance_double(ActiveRecord::ConnectionAdapters::Column, sql_type: 'bigint')
      non_uuid_model = class_double(Area, attribute_names: ['id'], columns_hash: { 'id' => column })
      serialized_models = { 'models' => { non_uuid_model => { 'row-1' => {} } } }

      mapping = service.send(:generate_model_identifiers!, serialized_models)

      expect(serialized_models['models'][non_uuid_model]['row-1']).not_to have_key('id')
      expect(mapping).to be_empty
    end
  end
end
