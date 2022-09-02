# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CustomField, type: :model do
  context 'hooks' do
    it 'generates a key on creation, if not specified' do
      cf = create(:custom_field, key: nil)
      expect(cf.key).to be_present
    end

    it 'generates unique keys in the resource_type scope, if not specified' do
      cf1 = create(:custom_field)
      cf2 = create(:custom_field)
      cf3 = create(:custom_field)
      expect([cf1, cf2, cf3].map(&:key).uniq).to match [cf1, cf2, cf3].map(&:key)
    end

    it 'generates a key made of non-Latin letters of title' do
      cf = create(:custom_field, key: nil, title_multiloc: { 'ar-SA': 'abbaالرئيسية' })
      expect(cf.key).to eq('abba')
    end

    it 'generates a present key from non-Latin title' do
      cf = create(:custom_field, key: nil, title_multiloc: { 'ar-SA': 'الرئيسية' })
      expect(cf.key).to be_present
    end
  end

  context 'when domicile field is created' do
    before { create_list(:area, 2) }

    let(:domicile_field) { create(:custom_field_domicile) }

    it 'creates custom field options from areas', :aggregate_failures do
      expect(domicile_field.options.count).to eq(Area.count)
      expect(domicile_field.options.take(Area.count).pluck(:id, :ordering, :title_multiloc))
        .to match_array(Area.pluck(:custom_field_option_id, :ordering, :title_multiloc))
      
      # 'somewhere else' option should be the last.
      expect(domicile_field.options.last.area).to be_nil
    end
  end

  describe 'description sanitizer' do
    it 'sanitizes script tags in the description' do
      custom_field = create(:custom_field, description_multiloc: {
        'en' => '<p>Test</p><script>This should be removed!</script><p>But this should stay</p><a href="http://www.citizenlab.co" rel="nofollow">Click</a>'
      })
      expect(custom_field.description_multiloc).to eq({ 'en' => '<p>Test</p>This should be removed!<p>But this should stay</p><a href="http://www.citizenlab.co" rel="nofollow">Click</a>' })
    end

    it 'does not sanitize allowed tags in the description' do
      description_multiloc = { 'en' => <<-DESC
      <h2> This is fine ! </h2>
      <h3> Everything is fine ! </h3>
      <ul>
        <li> <strong> strong </strong> </li>
        <li> <em> emphasis </em> </li>
        <li> <i> alternate </i> </li>
      </ul>
      <ol>
        <li> <u> unarticulated </u> </li>
        <li> <b> bold </b> </li>
        <li> <a href="https://www.example.com" rel="nofollow"> link </a> </li>
      </ol>
      DESC
      }

      custom_field = create(:custom_field, description_multiloc: description_multiloc)
      expect(custom_field.description_multiloc).to eq(description_multiloc)
    end
  end
end
