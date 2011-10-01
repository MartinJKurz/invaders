source 'http://rubygems.org'

gem 'rails', '3.1.0.rc8'

# Bundle edge Rails instead:
# gem 'rails',     :git => 'git://github.com/rails/rails.git'

gem 'simple_form', '1.5.1'
gem 'bcrypt-ruby', '3.0.0', :require => 'bcrypt'

gem 'kaminari', '0.12.4'

# MAK - problems with JS runtime
# commenting out some with #js

# Gems used only for assets and not required
# in production environments by default.
group :assets do
  #js gem 'sass-rails', "~> 3.1.0.rc"
  #js gem 'coffee-rails', "~> 3.1.0.rc"
  js gem 'uglifier', '1.0.3'
end

gem 'jquery-rails', '1.0.14'

# Use unicorn as the web server
# gem 'unicorn'

# Deploy with Capistrano
# gem 'capistrano'

# To use debugger
# gem 'ruby-debug19', :require => 'ruby-debug'

group :test do
  gem 'sqlite3', '1.3.4'
  # Pretty printed test output
  gem 'turn', '0.8.2', :require => false
  gem 'webrat', '0.7.1'
end

group :development do
  gem 'sqlite3', '1.3.4'
  gem 'rspec-rails', '2.6.1'
  gem 'annotate', '2.4.0'
end

group :production do
  # gems specifically for Heroku go here
  gem "pg"
end

