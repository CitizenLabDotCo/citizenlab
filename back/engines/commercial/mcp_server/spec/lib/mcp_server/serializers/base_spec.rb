# frozen_string_literal: true

require 'rails_helper'

# Tested through anonymous serializers that declare exactly the feature under test,
# so this spec depends on no domain serializer. Integration with the real web
# serializers is covered by the tool specs.
describe McpServer::Serializers::Base do
  let_it_be(:record) { create(:custom_field_select, :with_options) }

  describe '.serialize' do
    let(:serializer) do
      Class.new(described_class) do
        def attributes(record) = { id: record.id }
      end
    end

    it 'returns a hash for a single record and an array for a relation' do
      expect(serializer.serialize(record)).to be_a(Hash)
      expect(serializer.serialize(CustomField.all)).to be_an(Array)
    end

    it 'returns an empty array for an empty relation' do
      expect(serializer.serialize(CustomField.none)).to eq([])
    end
  end

  describe 'with a wrapped upstream serializer' do
    before do
      stub_const('UpstreamOptionSerializer', Class.new do
        include JSONAPI::Serializer
        set_type :option
        attribute :option_title, &:title_multiloc
      end)

      stub_const('UpstreamSerializer', Class.new do
        include JSONAPI::Serializer
        set_type :probe
        attribute :probe_title, &:title_multiloc
        attribute(:echo) { |_record, params| params[:probe] }
        has_many :options, serializer: UpstreamOptionSerializer
      end)
    end

    let(:serializer) { Class.new(described_class) { wraps UpstreamSerializer } }

    it 'flattens the JSONAPI output into a plain hash' do
      serialized = serializer.serialize(record)

      expect(serialized).to match(
        id: record.id,
        probe_title: record.title_multiloc,
        echo: nil,
        option_ids: match_array(record.option_ids)
      )
    end

    it 'serializes every record of a collection, in order' do
      other_record = create(:custom_field)

      serialized = serializer.serialize([record, other_record])

      expect(serialized).to match([
        a_hash_including(id: record.id, probe_title: record.title_multiloc),
        a_hash_including(id: other_record.id, probe_title: other_record.title_multiloc)
      ])
    end

    it 'forwards params to the upstream serializer' do
      serialized = serializer.serialize(record, params: { probe: 'x' })

      expect(serialized[:echo]).to eq('x')
    end

    it 'embeds relationships declared as inline instead of exposing ids' do
      serializer = Class.new(described_class) do
        wraps UpstreamSerializer
        inline :options
      end

      serialized = serializer.serialize(record)

      expect(serialized).not_to include(:option_ids)
      expect(serialized[:options]).to match_array(
        record.options.map { |option| { id: option.id, option_title: option.title_multiloc } }
      )
    end
  end

  describe 'with a from-scratch serializer (no wraps)' do
    let(:serializer) do
      Class.new(described_class) do
        def attributes(record) = { 'id' => record.id, 'kind' => 'probe' }
      end
    end

    it 'uses the #attributes override and symbolizes its top-level keys' do
      serialized = serializer.serialize(record)

      expect(serialized).to match(id: record.id, kind: 'probe')
    end

    it 'exposes `params` to the #attributes override' do
      serializer = Class.new(described_class) do
        def attributes(_record) = { echo: params[:probe] }
      end

      serialized = serializer.serialize(record, params: { probe: 'x' })

      expect(serialized).to eq(echo: 'x')
    end

    it 'raises when neither wraps nor #attributes is provided' do
      serializer = Class.new(described_class)

      expect { serializer.serialize(record) }
        .to raise_error(NotImplementedError, /wraps/)
    end
  end

  describe '#urls' do
    it 'returns the admin and public URLs of the record' do
      project = create(:project)
      serializer = Class.new(described_class) do
        def attributes(record) = urls(record)
      end

      serialized = serializer.serialize(project)

      expect(serialized).to match(
        admin_url: end_with("/admin/projects/#{project.id}"),
        public_url: end_with("/projects/#{project.slug}")
      )
    end
  end
end
