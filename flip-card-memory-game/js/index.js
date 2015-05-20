$(function(){

    var difficulty;
    var numberUniqueCards;
    var numberMatches = 0;

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
            playAudio();
        }

        // If lost game
        else if(text == 'fail'){
            increase('flip_lost');
            decrease('flip_abandoned');
            playAudio();
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
    
    playAudio();
    
    // Start game
    $('.play').on('click', function(e){
        e.preventDefault();
        increase('flip_abandoned');
        
        $playButton = $(this);
        
        var numberUniqueCards   = getNumberUniqueCards($playButton);
        difficulty              = setDifficulty($playButton);
        timer                   = getTimeLimit($playButton, numberUniqueCards); // time in milliseconds
        $('#game').addClass(difficulty);

        // start the actual game
        $('.logo').fadeOut(250, playGame(numberUniqueCards));

    });

    function playGame(numberUniqueCards) {
        var startTime  = $.now();
        pauseAudio();
        
        setUpCards(numberUniqueCards, "images");

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
                
                var cardValue = thisCard.find('.card-visible').attr('data-source');
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
            numberUniqueCards = 18;
        
        } else if ( playButton.hasClass("difficulty-hard") ) {
            numberUniqueCards = 32;
        
        }
        return numberUniqueCards;
    }

    function setDifficulty(playButton) {
        // default: easy level
        difficulty = 'easy';
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
            timeLimit *= numberUniqueCards * 6;
        
        } else {
            // default: easy level
            timeLimit *= numberUniqueCards * 8;
        }
        return timeLimit;
    }

    function setUpCards(numberUniqueCards, sourceType) {
        
        if( sourceType == "images" ) {
            // var images = getImageSources(numberUniqueCards);
            // renderImages(shuffle($.merge(images, images)));
        } else {
            // default to icons
            // we use merge which will double up the unicodeIcons
            // which we then shuffle (so the "cards" are mixed)
            var unicodeIcons = getUnicodeSources(numberUniqueCards);
            unicodeIcons = shuffle($.merge(unicodeIcons, unicodeIcons));

            renderUnicodeSources(unicodeIcons);
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

    function checkGameEnded(startTime) {
        // Win game
        if( !$('#game .card').length ){
            var time = $.now() - startTime;
            if( get('flip_'+difficulty) == '-:-' || get('flip_'+difficulty) > time ){
                set('flip_'+difficulty, time); // increase best score
            }
            startScreen('nice');
        }
        playAudio();
    }

    function checkForMatchingCards(cardValue, startTime) {
        // get collection of all cards with the matching pattern 
        // (e.g. A and A)
        var selectedCards = $('#game .active .card-visible[data-source='+cardValue+']');
        
        if( $('#game').find('.card.active').length > 1){
            setTimeout(function(){

                if( selectedCards.length > 1 ) {
                    // we know the cards match
                    // so remove them from the board
                    selectedCards.parents('.card')
                        .toggleClass('active card found')
                        .empty();
                    increase('flip_matched');
                    //Increase number of matches between card pairs by 1;
                    numberMatches ++;
                    //The number of matches between cards can be fully divided by 3
                    //so highlight a matching pair from the leftover ones

                    console.log("current number of matches: " + numberMatches);
                    if (numberMatches == 3) {
                        highlightCards();
                        numberMatches = 0;
                    }

                    // if we know there are no more cards left to match in the game, end the game.
                    checkGameEnded(difficulty, startTime);
                } else {
                    // we know the cards are different 
                    // fail
                    $('#game .card.active')
                        .removeClass('active'); 
                    increase('flip_wrong');
                    console.log("current number of matches: " + numberMatches);
                    numberMatches = 0;
                }
            }, 401);
        }
    }

    function removeMatchedCardPair(card1, card2) {
        card1.parents('.card')
            .toggleClass('active card found')
            .empty();

        card2.parents('.card')
            .toggleClass('active card found')
            .empty();

        return;
    }

    function getUnicodeSources(numberIcons) {
        var unicodeSources = [];
        var unicodeStarter = "&#xf";
        for( i=1; i<numberIcons+1; i++ ) {
            // each icon has the number format: 001, 002 etc. 
            if( i < 10 ) {
                unicodeSources[i] = unicodeStarter + "00" + i;
            } else if( i > 99 ) {
                unicodeSources[i] = unicodeStarter + i;
            } else {
                unicodeSources[i] = unicodeStarter + "0" + i;
            }
        }
        return unicodeSources;
    }

    function renderUnicodeSources(unicodeSources) {
        var cardWidthHeight = 100/Math.sqrt(unicodeSources.length);

        for( i=0; i<unicodeSources.length; i++ ) {
            //Add the card to the game's canvas/screen
            // force card size to be the correct width and height
            $('<div class="card" style="width:'+cardWidthHeight+'%;height:'+cardWidthHeight+'%;">'
                +'<div class="flipper">'
                    +'<div class="card-hidden"></div>'
                    +'<div class="card-visible" data-source="'+unicodeSources[i]+'"/></div>' 
                +'</div>'+
            '</div>').appendTo('#game');
        }
    }

    function getImageSources(numberUniqueCards) {
        var imageSources = [];
        // create the url path for each image file in the names array
        for ( i=1; i <numberUniqueCards+1; i++) {
            if( i < 10 ) {
                imageSources[i] = 'images/image00' + i + '.png';
            } else if( i > 99 ) {
                imageSources[i] = 'images/image' + i + '.png';
            } else {
                imageSources[i] = 'images/image0' + i + '.png';
            }
        }
        return imageSources;
    }

    function renderImages(imageSources) {
        var cardWidthHeight = 100/Math.sqrt(imageSources.length);

        for( i=0; i<imageSources.length; i++ ) {
            //Add the card to the game's canvas/screen
            // force card size to be the correct width and height
            $('<div class="card" style="width:'+cardWidthHeight+'%; height:'+cardWidthHeight+'%;">'
                +'<div class="container" style="overflow:hidden;">'
                    +'<div class="flipper">'
                        +'<div class="card-hidden"></div>'
                            +'<img class="image-visible" src="'+imageSources[i]+'" style="align:middle;"/>' 
                    +'</div>'
                +'</div>'
            +'</div>').appendTo('#game');
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

    function highlightCards() {
        //Pick a pair of matching cards from the remaining ones and highlight them
        console.log("number of matches is divisiable by 3 with no remainder" );
    }

    function playAudio () {
        //document.getElementById('gameAudio').play();
        //song.play();
    }

    function pauseAudio() {
        document.getElementById('gameAudio').pause();
       // song.pause();
    }
});
