# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Jsonapi do
  def resource(id, type, attributes = {}, relationships = nil)
    { id:, type:, attributes:, relationships: }.compact
  end

  it 'flattens a single resource by hoisting id and attributes' do
    jsonapi = { data: resource('p1', :project, { title: 'Hello' }) }

    expect(described_class.flatten(jsonapi)).to eq(id: 'p1', title: 'Hello')
  end

  it 'flattens an array of resources' do
    jsonapi = { data: [
      resource('p1', :project, { title: 'A' }),
      resource('p2', :project, { title: 'B' })
    ] }

    expect(described_class.flatten(jsonapi)).to eq(
      [{ id: 'p1', title: 'A' }, { id: 'p2', title: 'B' }]
    )
  end

  it 'surfaces a one-to-one relationship as <name>_id' do
    jsonapi = {
      data: resource(
        'p1', :project, {},
        { folder: { data: { id: 'f1', type: :folder } } }
      )
    }

    expect(described_class.flatten(jsonapi)).to eq(id: 'p1', folder_id: 'f1')
  end

  it 'surfaces a nil one-to-one relationship as <name>_id: nil' do
    jsonapi = { data: resource('p1', :project, {}, { folder: { data: nil } }) }

    expect(described_class.flatten(jsonapi)).to eq(id: 'p1', folder_id: nil)
  end

  it 'surfaces a one-to-many relationship as <name_singular>_ids' do
    jsonapi = {
      data: resource(
        'p1', :project, {},
        { areas: { data: [{ id: 'a1', type: :area }, { id: 'a2', type: :area }] } }
      )
    }

    expect(described_class.flatten(jsonapi)).to eq(id: 'p1', area_ids: %w[a1 a2])
  end

  describe 'inline relationships' do
    it 'embeds a one-to-many relationship from the included section' do
      jsonapi = {
        data: resource('q1', :question, { title: 'Q' }, { options: { data: [{ id: 'o1', type: :option }] } }),
        included: [resource('o1', :option, { title: 'O1' })]
      }

      expect(described_class.flatten(jsonapi, inline_rels: [:options])).to eq(
        id: 'q1', title: 'Q', options: [{ id: 'o1', title: 'O1' }]
      )
    end

    it 'embeds a one-to-one relationship as a single hash' do
      jsonapi = {
        data: resource('p1', :phase, {}, { form: { data: { id: 'f1', type: :form } } }),
        included: [resource('f1', :form, { opened: true })]
      }

      expect(described_class.flatten(jsonapi, inline_rels: [:form])).to eq(
        id: 'p1', form: { id: 'f1', opened: true }
      )
    end

    it 'embeds nil when the relationship is empty' do
      jsonapi = { data: resource('p1', :phase, {}, { form: { data: nil } }) }

      expect(described_class.flatten(jsonapi, inline_rels: [:form])).to eq(id: 'p1', form: nil)
    end
  end
end
