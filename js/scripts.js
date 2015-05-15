var apiKey = 'bc087c0b6239762cbcb64b281dde7b54';
var url = 'https://api.flickr.com/services/rest/';

$(document).ready(function() {
    $('#imageModal').modal('show');
})

// using keyup instead of keydown to prevent sending too many requests
$(document).keyup(function(e) {
    switch(e.which) {
        case 37: // left
            getPreviousPage();
            break;

        case 39: // right
            getNextPage();
            break;

        default: return; // exit this handler for other keys
    }
    e.preventDefault(); // prevent the default action (scroll / move caret)
});

function searchFlickr() {
    var searchTerm = document.getElementById('searchInput').value;

    $('#slideshow').html($('<div/>', { class: 'loading-text text-center', text: 'Loading ...' }));

    doSearch(searchTerm).done(function(data) {
        $('#resultCount').html('Results: ' + data.photos.total);
        $('#slideshow').empty();

        data.photos.photo.forEach(function(photo) {
            // TODO: instead of using appendTo() multiple times, somehow concatenate the results together and perform one big appendTo()
            createImage(photo).appendTo('#slideshow');
        });
    });
}

function getNextPage() {
    setPageNumber(getPageNumber() + 1);
    searchFlickr();
}

function getPreviousPage() {
    setPageNumber(Math.max(getPageNumber() - 1, 1));
    searchFlickr();
}

function getPageNumber() {
    return parseInt(document.getElementById('pageNumber').value);
}

function setPageNumber(page) {
    document.getElementById('pageNumber').value = page;
}

function reverse() {
    $('.slideshowImage img').each(function() {
        $(this).css('animation-direction', 'reverse');
    });
}

function drag(event) {
    event.originalEvent.dataTransfer.setData('text', event.target.id);
    console.log('dragging: ' + event.target.id);
}

function drop(event) {
    event.preventDefault();

    $('#drop-text').remove();
    $('#drop-container').removeClass('text-center');
    $('#drop-container').removeClass('drop-text');

    var data = event.dataTransfer.getData('text');
    event.target.appendChild(document.getElementById(data));
    console.log('dropping: ' + data);
}

function allowDrop(event) {
    event.preventDefault();
}

function doSearch(searchTerm) {
    console.log('searching page ' + getPageNumber());
    return $.ajax({
        dataType: 'json',
        url: url,
        data: {
            'method' : 'flickr.photos.search',
            'api_key' : apiKey,
            'format' : 'json',
            'tags' : searchTerm,
            'per_page' : 8,
            'nojsoncallback' : 1,
            'page' : getPageNumber()
        }
    });
}

function createImage(photo) {
    var imgSrc = 'https://farm' + photo.farm + '.staticflickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '.jpg';

    var container = $('<div/>', {
        id: photo.id,
        class: 'slideshowImage',
        draggable: true
    });

    container.bind('dragstart', function(event) { drag(event); });

    var image = $('<img/>', {
        src: imgSrc,
        class: 'hidden',
        draggable: false,
        click: function() {
            $('#image-modal-title').html(photo.title);
            $('#image-modal-body').html($('<img/>', {
                src: imgSrc,
                class: 'modalImage',
                click: function() {
                    $('#imageModal').modal('hide');
                }
            }));

            if(!$('#modal-size').hasClass('modal-lg')) {
                $('#modal-size').addClass('modal-lg');
            }

            $('#imageModal').modal('show');
        }
    });

    image.on('load', function() {
        $(this).removeClass('hidden');
        $(this).addClass('fadeIn');
    });

    return container.append(image);
}