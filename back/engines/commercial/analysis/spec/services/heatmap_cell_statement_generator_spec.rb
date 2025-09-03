# frozen_string_literal: true

require 'rails_helper'

RSpec.configure do |config|
  config.before(:suite) do
    # Load fixed translations from the fixtures so we don't depend on the actual
    # translations
    I18n.load_path += Rails.root.glob('engines/commercial/analysis/spec/fixtures/locales/*.yml')
  end
end

describe Analysis::HeatmapCellStatementGenerator do
  subject(:service) { described_class.new }

  it '#generates tag<>custom field option statements' do
    cell = create(:heatmap_cell,
      row: create(:tag, name: 'Environment'),
      column: create(:option_bin, option_attrs: { title_multiloc: { 'en' => 'youth council' } }),
      unit: 'inputs')
    expect(service.generate(cell)['en']).to eq("People who respond '<span data-type=\"answer\" data-bin-id=\"#{cell.column.id}\">youth council</span>' to '<span data-type=\"question\" data-bin-id=\"#{cell.column.id}\">Member of councils?</span>' post <span data-type=\"percent\">10% more</span> in '<span data-type=\"tag\" data-tag-id=\"#{cell.row.id}\">Environment</span>' than average.")

    cell = create(:heatmap_cell,
      row: create(:tag, name: 'Environment'),
      column: create(:option_bin, option_attrs: { title_multiloc: { 'en' => 'youth council' } }),
      unit: 'likes')
    expect(service.generate(cell)['en']).to eq("People who respond '<span data-type=\"answer\" data-bin-id=\"#{cell.column.id}\">youth council</span>' to '<span data-type=\"question\" data-bin-id=\"#{cell.column.id}\">Member of councils?</span>' like <span data-type=\"percent\">10% more</span> inputs in '<span data-type=\"tag\" data-tag-id=\"#{cell.row.id}\">Environment</span>' than average.")

    cell = create(:heatmap_cell,
      row: create(:tag, name: 'Environment'),
      column: create(:option_bin, option_attrs: { title_multiloc: { 'en' => 'youth council' } }),
      unit: 'dislikes', lift: 0.85)
    expect(service.generate(cell)['en']).to eq("People who respond '<span data-type=\"answer\" data-bin-id=\"#{cell.column.id}\">youth council</span>' to '<span data-type=\"question\" data-bin-id=\"#{cell.column.id}\">Member of councils?</span>' dislike <span data-type=\"percent\">15% less</span> inputs in '<span data-type=\"tag\" data-tag-id=\"#{cell.row.id}\">Environment</span>' than average.")

    cell = create(:heatmap_cell,
      row: create(:tag, name: 'Environment'),
      column: create(:option_bin, option_attrs: { title_multiloc: { 'en' => 'youth council' } }),
      unit: 'participants')
    expect(service.generate(cell)['en']).to eq("People who respond '<span data-type=\"answer\" data-bin-id=\"#{cell.column.id}\">youth council</span>' to '<span data-type=\"question\" data-bin-id=\"#{cell.column.id}\">Member of councils?</span>' participate <span data-type=\"percent\">10% more</span> in '<span data-type=\"tag\" data-tag-id=\"#{cell.row.id}\">Environment</span>' than average.")
  end

  it '#generates custom field bin<>custom field bin statements' do
    cell = create(:heatmap_cell,
      row: create(:option_bin, option_attrs: { title_multiloc: { 'en' => 'youth council' } }),
      column: create(:option_bin, option_attrs: { title_multiloc: { 'en' => 'yes' } }),
      unit: 'inputs')
    expect(service.generate(cell)['en']).to eq("People who respond '<span data-type=\"answer\" data-bin-id=\"#{cell.row.id}\">youth council</span>' to '<span data-type=\"question\" data-bin-id=\"#{cell.row.id}\">Member of councils?</span>' answer '<span data-type=\"answer\" data-bin-id=\"#{cell.column.id}\">yes</span>' to '<span data-type=\"question\" data-bin-id=\"#{cell.column.id}\">Member of councils?</span>' <span data-type=\"percent\">10% more</span> than average.")

    cell = create(:heatmap_cell,
      row: create(:option_bin, option_attrs: { title_multiloc: { 'en' => 'youth council' } }),
      column: create(:option_bin, option_attrs: { title_multiloc: { 'en' => 'yes' } }),
      unit: 'likes')
    expect(service.generate(cell)['en']).to eq("People who respond '<span data-type=\"answer\" data-bin-id=\"#{cell.row.id}\">youth council</span>' to '<span data-type=\"question\" data-bin-id=\"#{cell.row.id}\">Member of councils?</span>' like <span data-type=\"percent\">10% more</span> inputs when they answer '<span data-type=\"answer\" data-bin-id=\"#{cell.column.id}\">yes</span>' to '<span data-type=\"question\" data-bin-id=\"#{cell.column.id}\">Member of councils?</span>' than average.")

    cell = create(:heatmap_cell,
      row: create(:option_bin, option_attrs: { title_multiloc: { 'en' => 'youth council' } }),
      column: create(:option_bin, option_attrs: { title_multiloc: { 'en' => 'yes' } }),
      unit: 'dislikes', lift: 0.85)
    expect(service.generate(cell)['en']).to eq("People who respond '<span data-type=\"answer\" data-bin-id=\"#{cell.row.id}\">youth council</span>' to '<span data-type=\"question\" data-bin-id=\"#{cell.row.id}\">Member of councils?</span>' dislike <span data-type=\"percent\">15% less</span> inputs when they answer '<span data-type=\"answer\" data-bin-id=\"#{cell.column.id}\">yes</span>' to '<span data-type=\"question\" data-bin-id=\"#{cell.column.id}\">Member of councils?</span>' than average.")

    cell = create(:heatmap_cell,
      row: create(:option_bin, option_attrs: { title_multiloc: { 'en' => 'youth council' } }),
      column: create(:option_bin, option_attrs: { title_multiloc: { 'en' => 'yes' } }),
      unit: 'participants')
    expect(service.generate(cell)['en']).to eq("People who respond '<span data-type=\"answer\" data-bin-id=\"#{cell.row.id}\">youth council</span>' to '<span data-type=\"question\" data-bin-id=\"#{cell.row.id}\">Member of councils?</span>' participate <span data-type=\"percent\">10% more</span> when they answer '<span data-type=\"answer\" data-bin-id=\"#{cell.column.id}\">yes</span>' to '<span data-type=\"question\" data-bin-id=\"#{cell.column.id}\">Member of councils?</span>' than average.")
  end
end
