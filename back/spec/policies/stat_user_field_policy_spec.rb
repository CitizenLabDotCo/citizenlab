# frozen_string_literal: true

require 'rails_helper'

RSpec.describe StatUserFieldPolicy do
  subject(:policy) { described_class.new(user, nil) }

  context 'when the user has admin rights' do
    let_it_be(:user) { build(:admin) }

    it { is_expected.to permit(:users_by_birthyear) }
    it { is_expected.to permit(:users_by_domicile) }
    it { is_expected.to permit(:users_by_education) }
    it { is_expected.to permit(:users_by_custom_field) }
    it { is_expected.to permit(:users_by_gender_as_xlsx) }
    it { is_expected.to permit(:users_by_birthyear_as_xlsx) }
    it { is_expected.to permit(:users_by_domicile_as_xlsx) }
    it { is_expected.to permit(:users_by_education_as_xlsx) }
    it { is_expected.to permit(:users_by_custom_field_as_xlsx) }
  end

  context 'when user is a normal user' do
    let_it_be(:user) { build(:user) }

    it { is_expected.not_to permit(:users_by_birthyear) }
    it { is_expected.not_to permit(:users_by_domicile) }
    it { is_expected.not_to permit(:users_by_education) }
    it { is_expected.not_to permit(:users_by_custom_field) }
    it { is_expected.not_to permit(:users_by_gender_as_xlsx) }
    it { is_expected.not_to permit(:users_by_birthyear_as_xlsx) }
    it { is_expected.not_to permit(:users_by_domicile_as_xlsx) }
    it { is_expected.not_to permit(:users_by_education_as_xlsx) }
    it { is_expected.not_to permit(:users_by_custom_field_as_xlsx) }
  end

  context 'when user is a visitor' do
    let_it_be(:user) { nil }

    it { is_expected.not_to permit(:users_by_birthyear) }
    it { is_expected.not_to permit(:users_by_domicile) }
    it { is_expected.not_to permit(:users_by_education) }
    it { is_expected.not_to permit(:users_by_custom_field) }
    it { is_expected.not_to permit(:users_by_gender_as_xlsx) }
    it { is_expected.not_to permit(:users_by_birthyear_as_xlsx) }
    it { is_expected.not_to permit(:users_by_domicile_as_xlsx) }
    it { is_expected.not_to permit(:users_by_education_as_xlsx) }
    it { is_expected.not_to permit(:users_by_custom_field_as_xlsx) }
  end
end
