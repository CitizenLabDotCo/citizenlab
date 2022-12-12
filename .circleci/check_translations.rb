# frozen_string_literal: true

require 'crowdin-api'

FE_FO_SOURCE_PATH = '/front/app/translations/en.json'
FE_BO_SOURCE_PATH = '/front/app/translations/admin/en.json'
CROWDIN_PROJECT_ID = 'citizenlabdotcocitizenlab'
LOCALE_LEVELS = {
  'ar' => 4,
  'da' => 2,
  'de' => 2,
  'en' => 1,
  # 'en-CA' => 1,
  # 'en-GB' => 1,
  # 'es-CL' => 2,
  'es-ES' => 2,
  'fr' => 1,
  # 'fr-BE' => 1,
  'hr' => 4,
  # 'hu' => 5,
  'it' => 5,
  # 'kl' => 4,
  'lb' => 5,
  # 'mi' => 5,
  'mor-ar' => 5,
  'nl' => 1,
  # 'nl-BE' => 1,
  # 'no' => 4,
  'pl' => 4,
  'pt-BR' => 4,
  # 'ro' => 5,
  'sr' => 4
  # 'sr-CS' => 5
}

# Set of helper methods that query the crowdin API and extract the useful bits
class CrowdinWrapper
  attr_reader :crowdin

  def initialize(api_token)
    @crowdin = Crowdin::Client.new do |config|
      config.api_token = api_token
    end
  end

  def get_project_id(identifier)
    projects = crowdin.list_projects

    projects['data'].find do |p|
      p['data']['identifier'] == identifier
    end&.dig('data', 'id')
  end

  def get_branch_id(project_id, branch_name)
    branches = crowdin.list_branches({}, project_id)

    branches['data'].find do |b|
      b['data']['name'] == branch_name
    end&.dig('data', 'id')
  end

  def get_branch_source_files(project_id, branch_id)
    crowdin.list_files(
      {
        branchId: branch_id,
        recursion: true,
        limit: 100
      }, project_id
    )
  end

  def get_file_progress_by_locale(project_id, file_id)
    crowdin.get_file_progress(file_id, {}, project_id)['data'].map do |d|
      [d['data']['languageId'], d['data']['phrases']]
    end.to_h
  end
end

# Main class where the magic happens
class TranslationChecker
  def initialize
    @crwdn = CrowdinWrapper.new(ENV['CROWDIN_API_TOKEN'])
  end

  def check(branch)
    project_id = @crwdn.get_project_id(CROWDIN_PROJECT_ID)
    raise "Can't find project '#{CROWDIN_PROJECT_ID}' in crowdin" unless project_id

    branch_id = @crwdn.get_branch_id(project_id, branch)
    unless branch_id
      puts "Can\'t find matching branch '#{branch}' in crowdin, aborting without errors"
      return
    end

    files = @crwdn.get_branch_source_files(project_id, branch_id)

    fo_file_id = find_file_id_by_path(files, FE_FO_SOURCE_PATH)
    bo_file_id = find_file_id_by_path(files, FE_BO_SOURCE_PATH)

    fo_progress = @crwdn.get_file_progress_by_locale(project_id, fo_file_id)
    bo_progress = @crwdn.get_file_progress_by_locale(project_id, bo_file_id)

    passes = LOCALE_LEVELS.map do |locale, level|
      fo_progress[locale].transform_keys(&:to_sym) => {total: fo_total, translated: fo_translated}
      bo_progress[locale].transform_keys(&:to_sym) => {total: bo_total, translated: bo_translated}

      pass = level_passes?(level, fo_translated, fo_total, bo_translated, bo_total)

      puts "#{pass} #{locale} (L#{level}) \t front office #{fo_translated}/#{fo_total} \t back office #{bo_translated}/#{bo_total}"

      pass
    end

    raise 'Not all locales are translated to their minimum level' if passes.include?('❌')
  end

  private

  def find_file_id_by_path(files, path_postfix)
    files['data'].find do |f|
      f['data']['path'].end_with?(path_postfix)
    end['data']['id']
  end

  def level_passes?(level, fo_translated, fo_total, bo_translated, bo_total)
    fo_done = fo_translated >= fo_total
    bo_done = bo_translated >= bo_total

    if fo_done && bo_done
      '✅'
    elsif ([1, 2, 3].include?(level) && !fo_done) || (level == 1 && !bo_done)
      '❌'
    else
      '🟠'
    end
  end
end

puts ''"
# Legend
✅ All translations are present
🟠 Some translations are missing but the required translations are present
❌ Required translations are missing

# Checks
"''

TranslationChecker.new.check(ARGV[0])
