# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::FactVisit do
  subject(:fact_visit) { build(:fact_visit) }

  describe 'validations' do
    it { is_expected.to be_valid }
    it { is_expected.to validate_presence_of(:visitor_id) }
    it { is_expected.to validate_presence_of(:duration) }
    it { is_expected.to validate_presence_of(:pages_visited) }
    it { is_expected.to validate_presence_of(:matomo_visit_id) }
    it { is_expected.to validate_presence_of(:matomo_last_action_time) }
    it { is_expected.to validate_uniqueness_of(:matomo_visit_id) }
  end

  describe 'database behaviour' do
    # Using mostly batch inserts so DB index is actually more important than model validations
    it { is_expected.to have_db_index(:matomo_visit_id).unique }
  end

  describe 'associations' do
    it { is_expected.to belong_to(:dimension_date_first_action).class_name('Analytics::DimensionDate') }
    it { is_expected.to belong_to(:dimension_date_last_action).class_name('Analytics::DimensionDate') }
    it { is_expected.to belong_to(:dimension_referrer_type) }
    it { is_expected.to belong_to(:dimension_user).optional }

    it 'can associate a visit with multiple projects in the dimension_projects db view' do
      create_list(:project, 2)
      dimension_project1, dimension_project2 = Analytics::DimensionProject.first(2)
      fact_visit.dimension_projects << [dimension_project1, dimension_project2]

      expect(fact_visit.dimension_projects.length).to eq(2)
    end

    it 'can associate a visit with multiple locales' do
      locale1, locale2 = create_list(:dimension_locale, 2)
      fact_visit.dimension_locales << [locale1, locale2]

      expect(fact_visit.dimension_locales.length).to eq(2)
    end

    it 'can associate a visit with a user in dimension_users db view' do
      user = create(:user)
      dimension_user = Analytics::DimensionUser.first
      fact_visit.dimension_user = dimension_user

      expect(fact_visit.dimension_user.id).to eq(user.id)
    end
  end
end
