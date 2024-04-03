# frozen_string_literal: true

FactoryBot.define do
  factory :custom_form do
    participation_context { create(:single_phase_ideation_project) }

    trait :with_default_fields do
      after(:create) do |cf|
        participation_method = Factory.instance.participation_method_for cf.participation_context
        participation_method.default_fields(cf).reverse_each do |field|
          field.save!
          field.move_to_top
        end
      end
    end

    # trait :with_all_survey_field_types do
    #   after(:create) do |cf|
    #     create(:custom_field, resource: cf, key: 'a_text_field', title_multiloc: { 'en' => 'A text field' }, enabled: true)
    #     create(:custom_field, resource: cf, key: 'number_field', title_multiloc: { 'en' => 'Number field' }, input_type: 'number', enabled: true)
    #     create(:custom_field_point, resource: cf, key: 'a_point_field', title_multiloc: { 'en' => 'Point field' }, enabled: true)
    #
    #     select_field = create(:custom_field, resource: cf, key: 'select_field', title_multiloc: { 'en' => 'Select field' }, input_type: 'select', enabled: true)
    #     create(:custom_field_option, custom_field: select_field, key: 'yes', title_multiloc: { 'en' => 'Yes' })
    #     create(:custom_field_option, custom_field: select_field, key: 'no', title_multiloc: { 'en' => 'No' })
    #     create(:custom_field, resource: cf, key: 'page', input_type: 'page', enabled: true)
    #
    #     multiselect_field = create(:custom_field, resource: cf, key: 'multiselect_field', title_multiloc: { 'en' => 'Multi select field' }, input_type: 'multiselect', enabled: true)
    #     create(:custom_field_option, custom_field: multiselect_field, key: 'this', title_multiloc: { 'en' => 'This' })
    #     create(:custom_field_option, custom_field: multiselect_field, key: 'that', title_multiloc: { 'en' => 'That' })
    #
    #     create(:custom_field, resource: cf, key: 'page', input_type: 'page', enabled: true)
    #
    #     another_select_field = create(:custom_field, resource: cf, key: 'another_select_field', title_multiloc: { 'en' => 'Another select field' }, input_type: 'select', enabled: true)
    #     create(:custom_field_option, custom_field: another_select_field, key: 'yes', title_multiloc: { 'en' => 'Yes' })
    #     create(:custom_field_option, custom_field: another_select_field, key: 'no', title_multiloc: { 'en' => 'No' })
    #   end
    #   end
  end
end
