# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::FactVisit, type: :model do
  it 'can create a visit' do
    create(:fact_visit)
  end

  it 'can associate a visit with multiple projects in the dimension_projects db view' do
    project1, project2 = create_list(:project, 2)
    dimension_project1 = Analytics::DimensionProject.first
    dimension_project2 = Analytics::DimensionProject.last

    visit = create(:fact_visit)
    visit.dimension_projects << dimension_project1
    visit.dimension_projects << dimension_project2

    assert(visit.dimension_projects[0].id == project1.id)
    assert(visit.dimension_projects[1].id == project2.id)
  end

  it 'can associate a visit with multiple locales' do
    locale_en = create(:dimension_locale)
    locale_nl = create(:dimension_locale, name: 'nl')

    visit = create(:fact_visit)
    visit.dimension_locales << locale_en
    visit.dimension_locales << locale_nl

    assert(visit.dimension_locales[0].id == locale_en.id)
    assert(visit.dimension_locales[1].id == locale_nl.id)
  end

  it 'can associate a visit with a user in dimension_users db view' do
    user = create(:user)
    dimension_user = Analytics::DimensionUser.first

    visit = create(:fact_visit)
    visit.dimension_user = dimension_user

    assert(visit.dimension_user.id == user.id)
  end

  it 'cannot create another visit with the same matomo visit ID' do
    create(:fact_visit, matomo_visit_id: 1)
    expect { create(:fact_visit, matomo_visit_id: 1) }.to raise_error ActiveRecord::RecordNotUnique
  end
end
