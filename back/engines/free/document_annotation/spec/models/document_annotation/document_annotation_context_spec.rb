# frozen_string_literal: true

require 'rails_helper'

describe DocumentAnnotation::DocumentAnnotationPhase do
  describe 'validate document_annotation_embed_url for konveio' do
    it 'validates a valid document_annotation_embed_url for konveio from different orgs' do
      pc = build(
        :document_annotation_phase,
        document_annotation_embed_url: 'https://citizenlab.konveio.com/node/5'
      )
      expect(pc).to be_valid

      pc = build(
        :document_annotation_phase,
        document_annotation_embed_url: 'https://anotherorg.konveio.com/node/5'
      )
      expect(pc).to be_valid
    end

    it 'validates a valid document_annotation_embed_url for konveio with different top-level domains' do
      pc = build(
        :document_annotation_phase,
        document_annotation_embed_url: 'https://anotherorg.konveio.site/node/5'
      )
      expect(pc).to be_valid

      pc = build(
        :document_annotation_phase,
        document_annotation_embed_url: 'https://anotherorg.konveio.net/node/5'
      )
      expect(pc).to be_valid
    end

    it 'invalidates an invalid document_annotation_embed_url for konveio' do
      pc = build(
        :document_annotation_phase,
        document_annotation_embed_url: 'https://citizenlab.konveio.org/node/5'
      )
      expect(pc).to be_invalid
      pc = build(
        :document_annotation_phase,
        document_annotation_embed_url: 'https://konveio.com/node/5'
      )
      expect(pc).to be_invalid
    end
  end
end
