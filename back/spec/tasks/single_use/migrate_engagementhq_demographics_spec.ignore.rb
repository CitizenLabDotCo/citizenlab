require 'rails_helper'

describe 'rake single_use:migrate_engagementhq_demographics' do
  before { load_rake_tasks_if_not_loaded }

  it 'Migrates demographics' do
    create(:custom_field_birthyear)
    create(:custom_field, :for_registration, key: 'postal_code_s0n', input_type: 'text')
    connections = create(:custom_field_multiselect, :for_registration, key: 'connections_to_new_westminster_select_all_that_apply_320')
    connections.options.create!([
      { key: 'residential_property_owner_condo_townhouse_house_etc_in_new_west_jfd', title_multiloc: { 'en' => 'Residential property owner (condo, townhouse, house, etc.) in New West' } },
      { key: 'student_in_new_west_z75', title_multiloc: { 'en' => 'Student in New West' } },
      { key: 'under_housed_or_unhoused_having_inadequate_or_unstable_housing_atrisk_of_experiencing_homelessness_experiencing_hidden_homelessness_i_e_couchsurfing_or_unsheltered_in_new_west_jh2', title_multiloc: { 'en' => 'Under-housed or unhoused (having inadequate or unstable housing, at risk of experiencing homelessness, experiencing hidden homelessness – i.e. couchsurfing, or unsheltered) in New West' } }
    ])
    create(:custom_field_multiselect, :for_registration, key: 'optional_more_info_about_you_select_any_all_that_apply_snh')

    create(:user, email: 'user1@test.com', first_name: 'user1', last_name: '', custom_field_values: {})
    create(:user, email: 'user2@test.com', first_name: 'user2', last_name: '', custom_field_values: { 'birthyear' => 1990 })
    create(:user, email: 'user3@test.com', first_name: 'user3', last_name: '', custom_field_values: {})

    Rake::Task['single_use:migrate_engagementhq_demographics'].invoke(Tenant.current.host, Rails.root.join('spec/fixtures/engagementhq_demographics.csv'))

    expect(User.find_by(email: 'user1@test.com').custom_field_values).to eq({ 'postal_code_s0n' => 'New Westminster, BC, V3M6K3', 'birthyear' => 2024, 'connections_to_new_westminster_select_all_that_apply_320' => ['residential_property_owner_condo_townhouse_house_etc_in_new_west_jfd'] })
    expect(User.find_by(email: 'user2@test.com').custom_field_values).to eq({ 'postal_code_s0n' => 'New Westminster, BC, V3M3C7', 'birthyear' => 1990, 'connections_to_new_westminster_select_all_that_apply_320' => %w[residential_property_owner_condo_townhouse_house_etc_in_new_west_jfd student_in_new_west_z75 under_housed_or_unhoused_having_inadequate_or_unstable_housing_atrisk_of_experiencing_homelessness_experiencing_hidden_homelessness_i_e_couchsurfing_or_unsheltered_in_new_west_jh2] })
    expect(User.find_by(email: 'user3@test.com').custom_field_values).to eq({ 'postal_code_s0n' => 'New Westminster, BC, V3M4B5', 'birthyear' => 1905, 'connections_to_new_westminster_select_all_that_apply_320' => %w[student_in_new_west_z75 under_housed_or_unhoused_having_inadequate_or_unstable_housing_atrisk_of_experiencing_homelessness_experiencing_hidden_homelessness_i_e_couchsurfing_or_unsheltered_in_new_west_jh2] })
  end
end
