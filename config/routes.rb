=begin

invaders is a static page, should be changed:
1. the html must be dynamically created from a html.erb
   - VC only:
   - controller for the game(s)
2. invaders is just one of many games.
   more games can be added by the admin:
   - MVC!
    - M: the Game
    - V: the <game>.html.erb
    - additional resources for the view (the game JS)
    - C: functionality for the admin to add, delete, change games


currently these files are used for invaders:
mt_invaders_alone.html
mt_invaders.js
mootools-core-1.4.0-full-compat-yc.js
lib/mt_sounds.js
lib/mt_blockfont.js
invader_sounds/...

1. VC
- a game controller
- invaders action
- invaders view
- invaders resources

2. using MVC:
all files must be in the database

Game model with these fields:
- <game>.html.erb
- resources


=end




Invaders::Application.routes.draw do
  # get "articles/new"    this was created
  # resources :articles, :only => [:show, :new, :create, :edit, :update, :index]
  resources :articles
  #get "delete_article" => "articles#delete_article", :as => "delete_article"
  get "delete_article" => "articles#destroy", :as => "delete_article"
  


  get "log_in" => "sessions#new", :as => "log_in"
  get "log_out" => "sessions#destroy", :as => "log_out"
  get "logout_and_delete_user" => "sessions#logout_and_delete_user", :as => "logout_and_delete_user"

  get "pages/home"
  get "pages/contact"
  get "pages/about"
  get "pages/news"
  get "pages/help"
  get "pages/comments"
  get "pages/invaders"
  get "pages/get_current_user"

  
  # resources :scores
  get "scores/index"
  get "scores/destroy"
  get "scores/destroy_low_scores"
  get "scores/destroy_old_scores"



  get "users/destroy_old_users"

  # TODO: move:
  post "pages/post_score"
  get "pages/get_session_info"


  get "pages/test_page1"
  get "pages/test_page2"
  get "pages/test_page3"
  get "pages/test_page4"
  get "pages/test_page5"
  get "pages/menu_test"
  get "pages/menu_test2"
  get "pages/dragable_test"
  get "pages/events_test"
  post "pages/test_post_browser_info"

  resources :users
  resources :sessions

  match '/signup',  :to => 'users#new'
  # get "signup" => "users#new", :as => "signup"    # same as above? why? Ryan uses this syntax

  root :to => 'pages#home'

  # last line:
  # match ':action' => 'static#:action'


  # get "users/new"

  # The priority is based upon order of creation:
  # first created -> highest priority.

  # Sample of regular route:
  #   match 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   match 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Sample resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Sample resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Sample resource route with more complex sub-resources
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', :on => :collection
  #     end
  #   end

  # Sample resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.
  # root :to => 'welcome#index'

  # See how all your routes lay out with "rake routes"

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id(.:format)))'
end
