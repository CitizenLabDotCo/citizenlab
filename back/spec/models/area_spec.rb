require 'rails_helper'

RSpec.describe Area, type: :model do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:area)).to be_valid
    end
  end

  describe 'default_scope' do
    it 'defaults to sorting areas by ordering' do
      expect(Area.pluck(:id)).to eq Area.order(ordering: :asc).pluck(:id)
    end
  end

  describe 'description_multiloc' do
    it 'sanitizes script tags in the description' do
      area = create(:area, description_multiloc: {
        'en' => '<p>Test</p><script>This should be removed!</script>'
      })
      expect(area.description_multiloc).to eq({'en' => '<p>Test</p>This should be removed!'})
    end
  end

  describe 'description sanitizer' do
    it 'with invalid locales marks the model as invalid' do
      area = build :area, description_multiloc: { 'se-BI' => 'awesome area' }
      expect(area).to be_invalid
    end
  end

  describe 'delete an area' do
    it 'with an ideas assocated to it should succeed' do
      area = create :area
      create :idea, areas: [area]
      expect { area.destroy }.not_to raise_error
    end
  end

  describe '#create' do
    before do
      create_list(:area, 3)
    end

    context 'when ordering is given' do
      subject { create(:area) }

      it { is_expected.not_to validate_presence_of(:ordering) }
      it { is_expected.to validate_numericality_of(:ordering) }
    end

    context 'when no ordering is given' do
      subject { create(:area) }

      it 'defaults to the end of the list' do
        last_area = Area.last
        expect(subject.ordering).to eq(last_area.ordering.to_i + 1)
      end
    end

    context 'when an ordering is given' do
      let(:ordering) { Area.last.ordering + 1 }
      subject { create(:area, ordering: ordering) }

      it 'should stay as given' do
        expect(subject.ordering).to eq(ordering)
      end
    end
  end
end
