require 'project_folders/engine'
require 'project_folders/monkey_patches'

module ProjectFolders
  # Your code goes here...
  extend ActiveSupport::Autoload

  autoload :MonkeyPatches
end
