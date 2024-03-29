# frozen_string_literal: true

FactoryBot.define do
  factory :default_layout, class: 'ContentBuilder::Layout'

  factory :layout, class: 'ContentBuilder::Layout' do
    transient do
      project { create(:project) }
    end
    content_buildable { project }
    code { 'layout-1' }
    enabled { true }
  end

  factory :homepage_layout, class: 'ContentBuilder::Layout' do
    code { 'homepage' }
    enabled { true }
  end
end
