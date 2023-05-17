# frozen_string_literal: true

require 'rails_helper'

describe DocumentAnnotation::DocumentAnnotationParticipationContext do
  describe 'validate document_annotation_embed_url for konveio' do
    it 'validates a valid document_annotation_embed_url for konveio' do
      pc = build(
        :continuous_document_annotation_project,
        document_annotation_embed_url: 'https://citizenlab.konveio.com/node/5?iframe=true'
      )
      expect(pc).to be_valid
      pc = build(
        :continuous_document_annotation_project,
        document_annotation_embed_url: 'https://anotherorg.konveio.com/node/5?iframe=true'
      )
      expect(pc).to be_valid
    end

    it 'invalidates an invalid document_annotation_embed_url for konveio' do
      pc = build(
        :continuous_document_annotation_project,
        document_annotation_embed_url: 'https://citizenlab.konveio.org/node/5?iframe=true'
      )
      expect(pc).to be_invalid
      pc = build(
        :continuous_document_annotation_project,
        document_annotation_embed_url: 'https://konveio.com/node/5?iframe=true'
      )
      expect(pc).to be_invalid
    end
  end
end
