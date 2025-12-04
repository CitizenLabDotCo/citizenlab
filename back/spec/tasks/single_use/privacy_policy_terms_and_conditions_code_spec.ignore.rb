require 'rails_helper'

describe 'fix_existing_tenants:privacy_policy_terms_and_conditions_code rake task' do
  before { load_rake_tasks_if_not_loaded }

  it 'replaces the code for privacy policy and terms and conditions pages' do
    terms = build(:static_page, slug: 'terms-and-conditions', code: 'custom').tap { it.save(validate: false) }
    privc = create(:static_page, slug: 'privacy-policy', code: 'faq')
    other = create(:static_page, slug: 'other-page', code: 'custom')

    Rake::Task['fix_existing_tenants:privacy_policy_terms_and_conditions_code'].invoke

    expect(terms.reload.code).to eq 'terms-and-conditions'
    expect(privc.reload.code).to eq 'privacy-policy'
    expect(other).to eq other.reload
    expect(other.code).to eq 'custom'
  end

  it 'does not update the pages if they already have the right code' do
    terms = create(:static_page, slug: 'terms-and-conditions', code: 'terms-and-conditions')
    privc = create(:static_page, slug: 'privacy-policy', code: 'privacy-policy')

    expect { Rake::Task['fix_existing_tenants:privacy_policy_terms_and_conditions_code'].invoke }
      .to not_change { terms.reload.updated_at }
      .and not_change { privc.reload.updated_at }

    expect(terms.updated_at).to be_within(0.01.seconds).of(terms.reload.updated_at)
    expect(privc.updated_at).to be_within(0.01.seconds).of(privc.reload.updated_at)
  end
end
