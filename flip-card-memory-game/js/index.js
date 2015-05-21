$(function(){

    var difficulty;
    var sourceType = "icons"; // icons OR images
    var numberUniqueCards;
    var numberMatches = 0;

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
        
        } else if(text == 'fail'){
            // If lost game
            increase('flip_lost');
            decrease('flip_abandoned');
            playAudio();
        }

        // Update stats
        updateStats();
    };

    // play audio on landing page
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
        
        setUpCards(numberUniqueCards);

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
                
                // temporarily remove the active class from the Start menu cards
                $('.c2').parents('.show-icon.hide-icon').toggleClass('show-icon');

                // default to icons
                var numberActiveCards = $('.card.active .show-icon').length; //2
                console.log("#active cards" + numberActiveCards );
                //TODO SHOULD BE 0 but menu card increments this to 1 on start
                if( sourceType == "images" ) {
                    numberActiveCards = $('.card.active.card-images').length;
                }

                if( numberActiveCards == 2 ) {
                    checkForMatchingCards(startTime);
                }

                //re-add active class to the Start menu card
                $('.c2').parents('.show-icon.hide-icon').toggleClass('show-icon');
            }
        });

        setTimerBar(timer);
        
        setPauseAction();
        setEscapeAction();
    }

    function setUpCards(numberUniqueCards) {
        // Note: default source type are icons
        if( sourceType == "icons" ) {
            // we use merge which will double up the unicodeIcons
            // which we then shuffle (so the "cards" are mixed)
            var unicodeIcons = getUnicodeSources(numberUniqueCards);
            unicodeIcons = shuffle($.merge(unicodeIcons, unicodeIcons));

            renderUnicodeSources(unicodeIcons);
        } else {
            var images = getImageSources(numberUniqueCards);
            renderImages(shuffle($.merge(images, images)));
        }
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

    function checkForMatchingCards(startTime) {
        setTimeout(function(){
            // get out an array sources of the active cards
            var cardSource1;
            var cardSource2;

            if( sourceType == "icons" ) {
                console.log($('.card.active .show-icon').length);
                cardSource1 = $('.card.active .show-icon')[0].data("source");
                cardSource2 = $('.card.active .show-icon')[1].data("source");
            
            } else if ( sourceType == "images" ) {
                cardSource1 = $(".card.active img")[0].src;
                cardSource2 = $(".card.active img")[1].src;
            }
            
            if( cardSource1 == cardSource2 ) {
                // the cards match, remove them from the board
                if( sourceType == "icons") {
                    $('.card.active .show-icon').parents('.card.active')
                        .toggleClass('active card found')
                        .empty();
                }
                else if( sourceType == "images" ) {
                    $('.card.active img').parents('.card-images')
                        .toggleClass('active card found')
                        .empty();
                }
                increase('flip_matched');
                //Increase number of consecutive matches between card pairs by 1;
                numberMatches ++;

                if (numberMatches == 3) {
                    //The number of matches between cards consecutively is 3
                    //so we temporarily flip all leftover cards on the game board
                    flashAllCards();
                    //then reset the counter
                    numberMatches = 0;
                }

                // if we know there are no more cards left to match in the game, end the game.
                checkGameEnded(difficulty, startTime);
            } else {
                // no match, so flip the cards back over
                $('#game .card.active')
                    .removeClass('active'); 
                increase('flip_wrong');
                numberMatches = 0;
            }
        }, 401);
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

    /* Code to get and render unicode icons for cards */
    function getUnicodeSources(numberIcons) {
        var unicodeSources = [];

        for( i=0; i<numberIcons; i++ ) {
            var unicodeString = "&#xf";
            // each icon has the number format: 001, 002 etc. 
            if( i < 10 ) {
                unicodeString += "00" + i;
            } else if( i > 99 ) {
                unicodeString += i;
            } else {
                unicodeString = "0" + i;
            }

            // set the source to be the complete unicode string
            // e.g."&#xf001"
            unicodeSources[i] = unicodeString;
        }
        return unicodeSources;
    }

    function renderUnicodeSources(unicodeSources) {
        var cardSideLength = 100/Math.sqrt(unicodeSources.length);
        
        for( i=0; i<unicodeSources.length; i++ ) {
            addIconCard(unicodeSources[i], cardSideLength);
        }
    }

    function addIconCard(card, cardSideLength) {
        var htmlToRender = '<div class="card" style="width:'+cardSideLength+'%;height:'+cardSideLength+'%;">'
                                +'<div class="flipper">'
                                    +'<div class="hide-icon"></div>'
                                    +'<div class="show-icon" data-source="'+card+'"/></div>' 
                                +'</div>'+
                            '</div>';

        //Add the card to the game's canvas/screen
        //force card size to be the correct width and height
        $(htmlToRender).appendTo('#game');
    }

    function showImage() {
        addClass('card-')
    }

    function hideImage() {

    }

    /* TASK: USE IMAGES INSTEAD OF ICONS */
    function getImageSources(numberUniqueCards) {
        var imageSources = [];
        // create the url path for each image file in the names array
        for ( i=1; i < numberUniqueCards+1; i++) {
            sourceUrl = 'images/';
            if( i < 10 ) {
                sourceUrl += '00' + i;
            } else if( i > 99 ) {
                sourceUrl += i;
            } else {
                sourceUrl += '0' + i;
            }
            // finally set the image type
            imageSources[i-1] = sourceUrl + '.png';
        }
        return imageSources;
    }

    function renderImages(imageSources) {
        var cardSideLength = 100/Math.sqrt(imageSources.length);

        for( i=0; i<imageSources.length; i++ ) {
            addImageCard(imageSources[i], cardSideLength);
        }
    }

    function addImageCard(imageSource, cardSideLength) {
        var htmlToRender = '<div class="card card-images" '
                                +'style="width:'+cardSideLength+'%; height:'+cardSideLength+'%;">'
                                +'<div class="flipper">'
                                    +'<div class="hide-image">'
                                        +'<div class="show-image">'
                                            +'<img src="'+imageSource+'" '
                                                +'style="height:100%; width:100%; text-align:center;"/>' 
                                        +'</div>'
                                    +'</div>'
                                +'</div>'
                            +'</div>'

        $(htmlToRender).appendTo('#game');
    }
    
    /* TASK: ADD A HINT - AFTER THREE CONSECUTIVE MATCHES FLASH ALL THE CARDS */
    function flashAllCards() {
        //Flip all the cards in the game for 0.3 seconds before hiding them
        $( '.card' ).addClass( 'active').delay( 300 ).queue(function() {
            $(this).removeClass( 'active');
            $(this).dequeue();
        });
    }

    /* TASK: ADD AUDIO TO THE GAME */
    function playAudio () {
        //document.getElementById('gameAudio').play();
        //song.play();
    }

    function pauseAudio() {
        document.getElementById('gameAudio').pause();
       // song.pause();
    }

    /*
     * Additional functionality:
     * - set the PAUSE and ESCAPE keys
     * - set timer progress bar
     */
    function setPauseAction() {
        // Set keyboard (p)ause action
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
        });
    }

    function setEscapeAction() {
        // Set keyboard [esc] action
        $(window).off().on('keyup', function(e){
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

    function toTime(nr){
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


});
