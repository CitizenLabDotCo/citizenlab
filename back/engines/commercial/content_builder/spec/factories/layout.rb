FactoryBot.define do
  factory :default_layout, class: 'ContentBuilder::Layout'

  factory :layout, class: 'ContentBuilder::Layout' do
    transient do
      project { create(:project) }
    end
    craftjs_jsonmultiloc { {} }
    content_buildable_type { project.class.name }
    content_buildable_id { project.id }
    code { 'layout-1' }
    enabled { true }
  end
end
