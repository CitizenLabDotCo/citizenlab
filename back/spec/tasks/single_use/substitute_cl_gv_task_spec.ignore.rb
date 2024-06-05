require 'rails_helper'

describe 'rake substitute_cl_gv' do
  before { load_rake_tasks_if_not_loaded }

  describe 'rake_20240531_substitute_gv' do 
    it 'works or something' do
      {
        'test Go Vocal text' => 'test Go Vocal text',
        'test Citizenlab text' => 'test Go Vocal text',
        'test support@citizenlab.co to CitizenLab text' => 'test support@govocal.com to Go Vocal text',
        'The citizenlab address is: CitizenLab NV - Anspachlaan 65 - 1000 Brussels - Belgium' => 'The Go Vocal address is: Go Vocal NV - Pachecolaan 34 - 1000 Brussels - Belgium',
      }.each do |old_v, new_v|
        expect(rake_20240531_substitute_gv(old_v)).to eq(new_v)
      end
    end
  end
end
