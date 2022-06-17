# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Pin, type: :model do
  let(:home_page) { create(:home_page) }
  let(:project) { create(:project) }
  let(:project_folder) { create(:project_folder) }

  it 'can relate to a project' do
    expect(described_class.create!(page: home_page, admin_publication: project.admin_publication)).to be_persisted
  end

  it 'can relate to a folder', skip: 'cannot reference project_folder factory because it lives in a separate engine' do
    expect(described_class.create!(page: home_page, admin_publication: project_folder.admin_publication)).to be_persisted
  end

  it 'cannot relate to the same admin publication on the same page' do
    _pin_one = described_class.create!(page: home_page, admin_publication: project.admin_publication)
    pin_two = described_class.new(page: home_page, admin_publication: project.admin_publication)

    expect(pin_two).to be_invalid
    expect(pin_two.errors[:admin_publication]).to eq(['has already been taken'])
  end

  it 'allows up to 3 pins per page' do
    projects = create_list(:project, 4)

    pins = projects.map do |project|
      described_class.new(page: home_page, admin_publication: project.admin_publication)
    end

    pins.take(3).each(&:save!)

    pin_four = pins.last
    expect(pin_four).to be_invalid
    expect(pin_two.errors[:admin_publication]).to eq(['Maximum three pins per per page allowed'])
  end
end
