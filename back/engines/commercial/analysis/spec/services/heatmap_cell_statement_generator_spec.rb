# frozen_string_literal: true

require 'rails_helper'

describe Analysis::HeatmapCellStatementGenerator do
  subject(:service) { described_class.new }

  it '#generates tag<>custom field option statements' do
    cell = build(:heatmap_cell,
      row: build(:tag, name: 'Environment'),
      column: build(:option_bin, option_attrs: { title_multiloc: { 'en' => 'youth council' } }),
      unit: 'inputs')
    expect(service.generate(cell)['en']).to eq("People who respond 'youth council' to 'Member of councils?' post 10% more in 'Environment' than average.")

    cell = build(:heatmap_cell,
      row: build(:tag, name: 'Environment'),
      column: build(:option_bin, option_attrs: { title_multiloc: { 'en' => 'youth council' } }),
      unit: 'likes')
    expect(service.generate(cell)['en']).to eq("People who respond 'youth council' to 'Member of councils?' like 10% more inputs in 'Environment' than average.")

    cell = build(:heatmap_cell,
      row: build(:tag, name: 'Environment'),
      column: build(:option_bin, option_attrs: { title_multiloc: { 'en' => 'youth council' } }),
      unit: 'dislikes', lift: 0.85)
    expect(service.generate(cell)['en']).to eq("People who respond 'youth council' to 'Member of councils?' dislike 15% less inputs in 'Environment' than average.")

    cell = build(:heatmap_cell,
      row: build(:tag, name: 'Environment'),
      column: build(:option_bin, option_attrs: { title_multiloc: { 'en' => 'youth council' } }),
      unit: 'participants')
    expect(service.generate(cell)['en']).to eq("People who respond 'youth council' to 'Member of councils?' participate 10% more in 'Environment' than average.")
  end

  it '#generates custom field bin<>custom field bin statements' do
    cell = build(:heatmap_cell,
      row: build(:option_bin, option_attrs: { title_multiloc: { 'en' => 'youth council' } }),
      column: build(:option_bin, option_attrs: { title_multiloc: { 'en' => 'yes' } }),
      unit: 'inputs')
    expect(service.generate(cell)['en']).to eq("People who respond 'youth council' to 'Member of councils?' answer 'yes' to 'Member of councils?' 10% more than average.")

    cell = build(:heatmap_cell,
      row: build(:option_bin, option_attrs: { title_multiloc: { 'en' => 'youth council' } }),
      column: build(:option_bin, option_attrs: { title_multiloc: { 'en' => 'yes' } }),
      unit: 'likes')
    expect(service.generate(cell)['en']).to eq("People who respond 'youth council' to 'Member of councils?' like 10% more inputs when they answer 'yes' to 'Member of councils?' than average.")

    cell = build(:heatmap_cell,
      row: build(:option_bin, option_attrs: { title_multiloc: { 'en' => 'youth council' } }),
      column: build(:option_bin, option_attrs: { title_multiloc: { 'en' => 'yes' } }),
      unit: 'dislikes', lift: 0.85)
    expect(service.generate(cell)['en']).to eq("People who respond 'youth council' to 'Member of councils?' dislike 15% less inputs when they answer 'yes' to 'Member of councils?' than average.")

    cell = build(:heatmap_cell,
      row: build(:option_bin, option_attrs: { title_multiloc: { 'en' => 'youth council' } }),
      column: build(:option_bin, option_attrs: { title_multiloc: { 'en' => 'yes' } }),
      unit: 'participants')
    expect(service.generate(cell)['en']).to eq("People who respond 'youth council' to 'Member of councils?' participate 10% more when they answer 'yes' to 'Member of councils?' than average.")
  end
end
