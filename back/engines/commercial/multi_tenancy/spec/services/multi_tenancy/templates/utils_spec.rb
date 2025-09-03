# frozen_string_literal: true

require 'rails_helper'

describe MultiTenancy::Templates::Utils do
  subject(:service) do
    described_class.new(template_bucket: template_bucket, s3_client: s3_client)
  end

  let(:s3_client) { Aws::S3::Client.new(stub_responses: true) }
  let(:template_bucket) { 'template-bucket' }

  describe '#internal_template_names' do
    it 'returns expected templates' do
      expect(service.internal_template_names)
        .to contain_exactly('base', 'e2etests_template')
    end
  end

  describe '#external_template_names' do
    context 'when reading the manifest' do
      it 'returns expected templates' do
        s3_client.stub_responses(:get_object, lambda { |context|
          expect(context.params).to eq(bucket: template_bucket, checksum_mode: 'ENABLED', key: 'foo/manifest.json')
          { body: '{"bar": {"required_locales": ["en"]}, "qux": {"required_locales": ["en"]}}' }
        })

        expect(service.external_template_names(prefix: 'foo'))
          .to contain_exactly('bar', 'qux')
      end
    end

    context 'when ignoring the manifest' do
      it 'returns expected templates' do
        prefix = 'foo' # release prefix
        expected_templates = %w[bar baz]

        s3_client.stub_responses(:list_objects_v2, lambda { |context|
          expect(context.params)
            .to eq(bucket: template_bucket, prefix: prefix, delimiter: '/models.yml')

          common_prefixes = expected_templates.map do |template|
            { prefix: "#{prefix}/#{template}/models.yml" }
          end

          { common_prefixes: common_prefixes }
        })

        names = service.external_template_names(prefix: prefix, ignore_manifest: true)
        expect(names).to match_array(expected_templates)
      end
    end

    context 'when there is no manifest' do
      before do
        # manifest.json does not exist
        s3_client.stub_responses(:get_object, 'NoSuchKey')
      end

      it 'returns expected templates' do
        prefix = 'foo' # release prefix
        expected_templates = %w[bar baz qux]

        s3_client.stub_responses(:list_objects_v2, lambda { |context|
          expect(context.params)
            .to eq(bucket: template_bucket, prefix: prefix, delimiter: '/models.yml')

          common_prefixes = expected_templates.map do |template|
            { prefix: "#{prefix}/#{template}/models.yml" }
          end

          { common_prefixes: common_prefixes }
        })

        names = service.external_template_names(prefix: prefix, ignore_manifest: true)
        expect(names).to match_array(expected_templates)
      end
    end
  end

  describe '#external_manifest' do
    it 'returns expected manifest' do
      s3_client.stub_responses(:get_object, lambda { |context|
        expect(context.params).to eq(bucket: template_bucket, checksum_mode: 'ENABLED', key: 'foo/manifest.json')
        { body: '{"template": {"required_locales": ["en"]}}' }
      })

      manifest = service.external_manifest(prefix: 'foo')
      expect(manifest).to eq('template' => { 'required_locales' => ['en'] })
    end
  end

  describe '.user_locales' do
    where(:case_name, :expected_locales, :serialized_models) do
      [
        ['empty serialized models', [], {}],

        # internal template format
        ['single locale (internal template)', ['en'], { models: { 'user' => [
          { 'locale' => 'en' }
        ] } }],
        ['repeated locale (internal template)', ['en'], { models: { 'user' => [
          { 'locale' => 'en' },
          { 'locale' => 'en' }
        ] } }],
        ['multiple locales (internal template)', %w[en en-GB], { models: { 'user' => [
          { 'locale' => 'en' },
          { 'locale' => 'en-GB' }
        ] } }],

        # external template format
        ['single locale (external template)', ['en'], { models: { User => {
          'user-1' => { 'locale' => 'en' }
        } } }],
        ['multiple locales (external template)', %w[en en-GB], { models: { User => {
          'user-1' => { 'locale' => 'en' },
          'user-2' => { 'locale' => 'en-GB' }
        } } }]
      ]
    end

    with_them do
      it 'returns expected locales' do
        expect(described_class.user_locales(serialized_models)).to eq(expected_locales)
      end
    end
  end
end
