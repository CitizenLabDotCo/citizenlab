# frozen_string_literal: true

require 'rails_helper'

describe 'rake checks:invalid_data' do
  before { load_rake_tasks_if_not_loaded }

  let(:task) { Rake::Task['checks:invalid_data'] }

  it 'runs without failures' do
    task.execute
  end
end
