# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::Reporting::InputTag do
  it 'exposes one row per tag on an input, with its localized label' do
    idea = create(:idea)
    tag = create(:input_topic, project: idea.project, title_multiloc: { 'en' => 'Nature', 'nl-BE' => 'Natuur' })
    idea.input_topics << tag
    row = described_class.find_by!(input_id: idea.id)

    expect(row.tag_id).to eq tag.id
    expect(row.tag_label).to eq 'Nature'
    expect(row.parent_tag_id).to be_nil
  end

  it 'exposes the parent of a nested tag for rollups' do
    idea = create(:idea)
    parent = create(:input_topic, project: idea.project)
    child = create(:input_topic, project: idea.project, parent: parent)
    idea.input_topics << child

    expect(described_class.find_by!(input_id: idea.id).parent_tag_id).to eq parent.id
  end

  it 'excludes tags of draft inputs' do
    idea = create(:idea, publication_status: 'draft')
    idea.input_topics << create(:input_topic, project: idea.project)

    expect(described_class.where(input_id: idea.id)).to be_empty
  end
end
