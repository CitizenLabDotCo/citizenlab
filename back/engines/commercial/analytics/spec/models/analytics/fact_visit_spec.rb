# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::FactVisit, type: :model do
  it 'Can create a visit' do
    create(:fact_visit)
  end

  it 'Can associate a visit with multiple projects in the dimension_projects db view' do
    project1 = create(:project)
    project2 = create(:project)
    dimension_project1 = Analytics::DimensionProject.first
    dimension_project2 = Analytics::DimensionProject.last

    visit = create(:fact_visit)
    visit.dimension_project << dimension_project1
    visit.dimension_project << dimension_project2

    assert(visit.dimension_project[0].id == project1.id)
    assert(visit.dimension_project[1].id == project2.id)
  end

  it 'Can associate a visit with multiple locales' do
    locale_en = create(:dimension_locale_en)
    locale_nl = create(:dimension_locale_nl)

    visit = create(:fact_visit)
    visit.dimension_locale << locale_en
    visit.dimension_locale << locale_nl

    assert(visit.dimension_locale[0].id == locale_en.id)
    assert(visit.dimension_locale[1].id == locale_nl.id)
  end

  it 'Can create a visit with no user' do
    create(:fact_visit_no_user)
  end

  it 'Can associate a visit with a user in dimension_users db view' do
    user = create(:user)
    dimension_user = Analytics::DimensionUser.first

    visit = create(:fact_visit_no_user)
    visit.dimension_user = dimension_user

    assert(visit.dimension_user.id == user.id)
  end
end
