# frozen_string_literal: true

FactoryBot.define do
  factory :heatmap_cell, class: 'Analysis::HeatmapCell' do
    analysis
    association :row, factory: :tag
    association :column, factory: :option_bin
    unit { 'inputs' }
    count { 10 }
    lift { 1.1 }
    p_value { 0.1 }
  end
end
