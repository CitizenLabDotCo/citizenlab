# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Serializers::Base do
  let_it_be(:current_user) { create(:super_admin) }

  describe 'wrapping a web API serializer' do
    it 'flattens the JSONAPI output into a plain hash' do
      project = create(:project)

      serialized = McpServer::Serializers::Project.serialize(project, params: { current_user: })

      expect(serialized).to be_a(Hash)
      expect(serialized[:id]).to eq(project.id)
      expect(serialized[:title_multiloc]).to eq(project.title_multiloc)
      expect(serialized).not_to include(:data, :attributes, :relationships)
    end

    it 'merges the click-through URLs when the serializer opts in' do
      project = create(:project)

      serialized = McpServer::Serializers::Project.serialize(project, params: { current_user: })

      expect(serialized[:admin_url]).to end_with("/admin/projects/#{project.id}")
      expect(serialized[:public_url]).to end_with("/projects/#{project.slug}")
    end
  end

  describe 'inline relationships' do
    it 'embeds the related resources instead of exposing ids' do
      field = create(:custom_field_select, :with_options)

      serialized = McpServer::Serializers::CustomField.serialize(field)

      expect(serialized[:options]).to be_an(Array)
      expect(serialized[:options].pluck(:id)).to match_array(field.options.pluck(:id))
      expect(serialized[:options].first).to include(:title_multiloc)
      expect(serialized).not_to include(:option_ids)
    end
  end

  describe 'building from scratch (no wraps)' do
    it 'uses the #attributes override' do
      permission = create(:permission)

      serialized = McpServer::Serializers::Permission.serialize(permission)

      expect(serialized.keys).to eq(
        %i[action permitted_by group_ids demographic_questions verification_expiry access_denied_explanation_multiloc]
      )
    end

    it 'raises when neither wraps nor #attributes is provided' do
      serializer = Class.new(described_class)

      expect { serializer.serialize(create(:area)) }
        .to raise_error(NotImplementedError, /wraps/)
    end
  end

  describe 'collection semantics' do
    it 'returns an array for a relation and a hash for a single record' do
      create_list(:area, 2)
      params = { current_user: }

      expect(McpServer::Serializers::Area.serialize(Area.all, params:)).to be_an(Array)
      expect(McpServer::Serializers::Area.serialize(Area.first, params:)).to be_a(Hash)
    end

    it 'returns an empty array for an empty relation' do
      expect(McpServer::Serializers::Area.serialize(Area.none)).to eq([])
    end
  end
end
