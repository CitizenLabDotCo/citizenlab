# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminApi::Schema do
  let(:context) { {} }
  let(:result) do
    described_class.execute(
      query_string,
      context: context,
      variables: variables
    )
  end

  describe 'project' do
    let(:query_string) do
      %|
        query projectQuery($id: ID!) {
          project(id: $id) {
            id
            slug
            publicationStatus
            visibleTo
            processType
          }
        }
      |
    end

    let(:project) { create(:project) }
    let(:variables) { { id: project.id } }

    it 'returns all projects' do
      response = result
      expect(response.dig('data', 'project')).to match({
        'id' => project.id,
        'slug' => project.slug,
        'publicationStatus' => project.admin_publication.publication_status,
        'visibleTo' => project.visible_to,
        'processType' => project.process_type
      })
    end
  end
end
