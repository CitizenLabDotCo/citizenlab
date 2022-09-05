# frozen_string_literal: true

FactoryBot.define do
  factory :default_layout, class: 'ContentBuilder::Layout'

  factory :layout, class: 'ContentBuilder::Layout' do
    transient do
      project { create(:project) }
    end
    craftjs_jsonmultiloc { {} }
    content_buildable { project }
    code { 'layout-1' }
    enabled { true }
  end
end
