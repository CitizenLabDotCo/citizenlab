require 'rails_helper'

describe 'rake substitute_cl_gv' do
  before { load_rake_tasks_if_not_loaded }

  describe 'rake_20240531_substitute_gv' do
    it 'works or something' do
      {
        'test Go Vocal text' => 'test Go Vocal text',
        'test Citizenlab text' => 'test Go Vocal text',
        'test support@citizenlab.co to CitizenLab text' => 'test support@govocal.com to Go Vocal text',
        'The citizenlab address is: <p>CitizenLab NV - Anspachlaan 65 - 1000 Brussels - Belgium</p>' => 'The Go Vocal address is: <p>Go Vocal NV - Pachecolaan 34 - 1000 Brussels - Belgium</p>',
        'citizenlab.co/citizenlab-test' => 'citizenlab.co/citizenlab-test',
        'citizenlabco.typeform.com' => 'citizenlabco.typeform.com',
        '{citizenLabLink}' => '{citizenLabLink}',
        '<a href=\"https://www.citizenlab.co/en\" target=\"_blank\">CitizenLab,</a>' => '<a href=\"https://www.govocal.com/en\" target=\"_blank\">Go Vocal,</a>',
        'provide your personal data to Citizenlab.' => 'provide your personal data to Go Vocal.',
        'платформе и ЦитизенЛаб од било' => 'платформе и Go Vocal од било',
        'суппорт@цитизенлаб.цо' => 'support@govocal.com',
        'хттпс://суппорт.цитизенлаб.цо/артицлес/1771605' => 'хттпс://суппорт.цитизенлаб.цо/артицлес/1771605'

      }.each do |old_v, new_v|
        expect(rake_20240531_substitute_gv(old_v)).to eq(new_v)
      end
    end
  end
end
