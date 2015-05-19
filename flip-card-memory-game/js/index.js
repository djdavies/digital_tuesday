$(function(){

    function set(key, value) { 
        localStorage.setItem(key, value);
    }
    
    function get(key) {
        return localStorage.getItem(key);
    }
    
    //Function to take a number and increase it
    function increase(el) { 
        set(el, parseInt( get(el) ) + 1);
    }

    //Function to take number and decreases it
    function decrease(el) { 
        set(el, parseInt( get(el) ) - 1);
    }

    var toTime = function(nr){
        if(nr == '-:-') { 
            return nr;
        } else { 
            var n = ' '+nr/1000+' ';
            return n.substr(0, n.length-1)+'s';
        }
    };

    function updateStats(){
        $('#stats').html('<div class="padded"><h2>Figures: <span>'+
            '<b>'+get('flip_won')+'</b><i>Won</i>'+
            '<b>'+get('flip_lost')+'</b><i>Lost</i>'+
            '<b>'+get('flip_abandoned')+'</b><i>Aborted</i></span></h2>'+
            '<ul><li><b>Best Casual:</b> <span>'+toTime( get('flip_casual') )+'</span></li>'+
            '<li><b>Best Medium:</b> <span>'+toTime( get('flip_medium') )+'</span></li>'+
            '<li><b>Best Hard:</b> <span>'+toTime( get('flip_hard') )+'</span></li></ul>'+
            '<ul><li><b>Total Flips:</b> <span>'+parseInt( ( parseInt(get('flip_matched')) + parseInt(get('flip_wrong')) ) * 2)+'</span></li>'+
            '<li><b>Matched Flips:</b> <span>'+get('flip_matched')+'</span></li>'+
            '<li><b>Wrong Flips:</b> <span>'+get('flip_wrong')+'</span></li></ul></div>');
    };

    //Randomly shuffle the cards
    function shuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    };

    function startScreen(text){
        $('#game').removeAttr('class').empty();
        $('.logo').fadeIn(250);

        $('.c1').text(text.substring(0, 1));
        $('.c2').text(text.substring(1, 2));
        $('.c3').text(text.substring(2, 3));
        $('.c4').text(text.substring(3, 4));

        // If won game
        if(text == 'nice'){
            increase('flip_won');
            decrease('flip_abandoned');
        }

        // If lost game
        else if(text == 'fail'){
            increase('flip_lost');
            decrease('flip_abandoned');
        }

        // Update stats
        updateStats();
    };

    /* LOAD GAME ACTIONS */

    // Init localStorage
    if( !get('flip_won') && !get('flip_lost') && !get('flip_abandoned') ){
        //Overall Game stats
        set('flip_won', 0);
        set('flip_lost', 0);
        set('flip_abandoned', 0);
        //Best times
        set('flip_casual', '-:-');
        set('flip_medium', '-:-');
        set('flip_hard', '-:-');
        //Cards stats
        set('flip_matched', 0);
        set('flip_wrong', 0);
    }

    // Fill stats
    if( get('flip_won') > 0 || get('flip_lost') > 0 || get('flip_abandoned') > 0) {
        updateStats();
    }

    // Toggle start screen cards
    $('.logo .card:not(".twist")').on('click', function(e){
        $(this).toggleClass('active').siblings().not('.twist').removeClass('active');
        if( $(e.target).is('.playnow') ) { 
            $('.logo .card').last().addClass('active'); 
        }
    });

    // Start game
    $('.play').on('click', function(){
        increase('flip_abandoned');
        
        $playButton = $(this);
        
        var numberUniqueCards   = getNumberUniqueCards($playButton);
        var difficulty          = getDifficulty($playButton);
        timer                   = getTimeLimit($playButton, numberUniqueCards); // time in milliseconds
        $('#game').addClass(difficulty);

        // start the actual game
        $('.logo').fadeOut(250, playGame(numberUniqueCards));
    });

    function playGame(numberUniqueCards) {
        var startTime  = $.now();
        
        // and add it to the board
        var shuffledCardSet = getRandomShuffledSet(numberUniqueCards);

        addCardsToGameCanvas(shuffledCardSet);

        // Set the card actions
        $('#game .card').on({
            'mousedown' : function(){
                // if game paused do nothing
                if($('#game').attr('data-paused') == 1) {
                    return;
                }
                
                var thisCard = $(this);
                // set this card to be active
                thisCard.addClass('active');
                
                var cardValue = thisCard.find('.b').attr('data-f');
                checkForMatchingCards(cardValue, startTime);
            }
        });

        setTimerBar(timer);
        
        setPauseAndEscape();
    }

    function getNumberUniqueCards(playButton) {
        // default: easy level
        var numberUniqueCards = 8;
        if ( playButton.hasClass("difficulty-medium") ) {
            numberUniqueCards = 16;
        
        } else if ( playButton.hasClass("difficulty-hard") ) {
            numberUniqueCards = 32;
        
        }
        return numberUniqueCards;
    }

    function getDifficulty(playButton) {
        // default: easy level
        var difficulty = 'easy';
        if ( playButton.hasClass("difficulty-medium") ) {
            difficulty = 'medium';
        
        } else if ( playButton.hasClass("difficulty-hard") ) {
            difficulty = 'hard';

        }
        return difficulty;
    }

    function getTimeLimit(playButton, numberUniqueCards) {
        var timeLimit = 1000; // milliseconds
        if ( playButton.hasClass("difficulty-medium") ) {
            timeLimit *= numberUniqueCards * 4;
        
        } else if ( playButton.hasClass("difficulty-hard") ) {
            timeLimit *= numberUniqueCards * 5;
        
        } else {
            // default: easy level
            timeLimit *= numberUniqueCards * 6;
        }
        return timeLimit;
    }

    function getRandomShuffledSet(numberUniqueCards) {
        cardSet = [];
        // Create and add shuffled cards to game
        for (i = 0; i < numberUniqueCards; i++) { 
            cardSet.push(i);
        }
        //TODO what does merge do here!
        // return the same card set but shuffled
        return shuffle( $.merge(cardSet,cardSet) );
    }

    function addCardsToGameCanvas(shuffledCards) {
        cardWidthHeight = 100/Math.sqrt(shuffledCards.length);

        for (i = 0; i < shuffledCards.length; i++) {
            //Get the current card
            //TODO find out what setting the current card does
            var currentCardValue = shuffledCards[i];
            if ( currentCardValue < 10 ) {
                currentCardValue = "0" + currentCardValue;
            }

            //Add the card to the game's canvas/screen
            // force card size to be the correct width and height
            $('<div class="card" style="width:'+cardWidthHeight+'%;height:'+cardWidthHeight+'%;">'
                +'<div class="flipper">'
                    +'<div class="f"></div>'
                    +'<div class="b" data-f="&#xf0'+currentCardValue+';"></div>' 
                +'</div></div>'
            ).appendTo('#game');
        }
    }

    function setTimerBar(timer) {
        // Add timer bar
        $('<i class="timer"></i>').prependTo('#game')
            .css({
                'animation' : 'timer '+timer+'ms linear'
            })
            .one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e) {
                startScreen('fail'); // fail game
            });
    }

    function checkGameEnded(difficulty, startTime) {
        // Win game
        if( !$('#game .card').length ){
            var time = $.now() - startTime;
            if( get('flip_'+difficulty) == '-:-' || get('flip_'+difficulty) > time ){
                set('flip_'+difficulty, time); // increase best score
            }
            startScreen('nice');
        }
        // SOMETHING HERE GAME END (MUSIC ETC)
    }

    function checkForMatchingCards(cardValue, startTime) {
        // get collection of all cards with the matching pattern 
        // (e.g. A and A)
        var selectedCards = $('#game .active .b[data-f='+cardValue+']');

        if( $('#game').find('.card.active').length > 1){
            setTimeout(function(){
                
                if( selectedCards.length > 1 ) {
                    // we know the cards match
                    // so remove them from the board
                    selectedCards.parents('.card')
                        .toggleClass('active card found')
                        .empty();
                    increase('flip_matched');

                    // if we know there are no more cards left to match in the game, end the game.
                    checkGameEnded(difficulty, startTime);
                } else {
                    // we know the cards are different 
                    // fail
                    $('#game .card.active')
                        .removeClass('active'); 
                    increase('flip_wrong');
                }
            }, 401);
        }
    }

    function setPauseAndEscape() {
        // Set keyboard (p)ause and [esc] actions
        $(window).off().on('keyup', function(e){
            // Pause game. (p)
            if(e.keyCode == 80){
                if( $('#game').attr('data-paused') == 1 ) { //was paused, now resume
                    $('#game').attr('data-paused', '0');
                    $('.timer').css('animation-play-state', 'running');
                    $('.pause').remove();
                } else {
                    $('#game').attr('data-paused', '1');
                    $('.timer').css('animation-play-state', 'paused');
                    $('<div class="pause"></div>').appendTo('body');
                }
            }
            // Abandon game. (ESC)
            if(e.keyCode == 27){
                startScreen('flip');
                // If game was paused
                if( $('#game').attr('data-paused') == 1 ){
                    $('#game').attr('data-paused', '0');
                    $('.pause').remove();
                }
                $(window).off();
            }
        });
    }
});