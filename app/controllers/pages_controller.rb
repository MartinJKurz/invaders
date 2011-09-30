class PagesController < ApplicationController
  def home
    @title = "Home"
  end

  def contact
    @title = "Contact"
  end


  def get_current_user
    respond_to do |format|  
      format.json {
        if current_user
          render :json => {name: current_user.name, sound: current_user.sound, volume: current_user.volume}
        else
          render :json => nil
        end
      }
    end  
  end

  def get_session_info
    respond_to do |format|  
      format.json {
        if current_user
          #render :json => {:session => session}
          render :json => {:session => user_session.session}
        else
          render :json => nil
        end
      }
    end
  end


  def post_score
    if current_user
		res = current_user.add_score params[:game_id], params[:score]

        # ok scores = Score.find(:all, :limit => 10, :order => 'score desc', :conditions => ["game_id IN (?)", params[:game_id] ] )
        scores = Score.where(
          "game_id IN (?)",
          params[:game_id]
        ).order('score desc').first(10)

        scores_ret = []

        scores.each do |score|
          scores_ret << {:score => score.score, :name => User.find(score.user_id).name}
        end

        user_scores = Score.where(
          ["user_id IN (?) AND game_id IN (?)",
            current_user.id.to_s,
            params[:game_id]]
        ).order('score desc').first(9)

        user_scores_ret = []

        user_scores.each do |score|
          user_scores_ret << {:score => score.score}
        end

        render :json => {
          :success => true,
          :user => current_user.name,
          :game_id => params[:game_id],
          :score => params[:score],
          :highscores => scores_ret,
          :user_highscores => user_scores_ret,
          :add_score => res
        }
    else
        render :json => {:success => false, :user => nil}
    end
  end
  
=begin
  def post_score
    if current_user
		current_user.add_score params[:game_id], params[:score]

        # ok scores = Score.find(:all, :limit => 10, :order => 'score desc', :conditions => ["game_id IN (?)", params[:game_id] ] )
        scores = Score.where(
          "game_id IN (?)",
          params[:game_id]
        ).order('score desc').first(10)

        scores_ret = []

        scores.each do |score|
          scores_ret << {:score => score.score, :name => User.find(score.user_id).name}
        end

        user_scores = Score.where(
          ["user_id IN (?) AND game_id IN (?)",
            current_user.id.to_s,
            params[:game_id]]
        ).order('score desc').first(9)

        user_scores_ret = []

        user_scores.each do |score|
          user_scores_ret << {:score => score.score}
        end

        render :json => {
          :success => true,
          :user => current_user.name,
          :game_id => params[:game_id],
          :score => params[:score],
          :highscores => scores_ret,
          :user_highscores => user_scores_ret
        }
    else
        render :json => {:success => false, :user => nil}
    end
  end
=end

  def about
    @title = "About"
    # render :layout => false   # application.html (.erb) will NOT be used
  end

  def news
    @title = "News"
  end

  def help
    @title = "Help"
  end

  def comments
    @title = "Comments"
  end

  def invaders
    @title = "They're comming!!!"
    render :layout => false
  end
end
