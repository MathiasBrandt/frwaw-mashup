var apiKey = 'bc087c0b6239762cbcb64b281dde7b54';
var url = 'https://api.flickr.com/services/rest/';
var storedImages = [];

$(document).ready(function() {
    // show the welcome popup
    $('#imageModal').modal('show');

    // load stored images
    var didLoad = loadImagesFromStorage();

    // if some images were loaded from local storage, remove the text from the drop container
    if(didLoad) {
        hideDropContainerText();
    }
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

// search flickr for a specific search term and add resulting images to the slideshow
function searchFlickr() {
    // what to search for, entered by the user
    var searchTerm = document.getElementById('searchInput').value;

    // show 'loading' text in the slideshow
    $('#slideshow').html($('<div/>', {
        class: 'loading-text text-center', text: 'Loading ...'
    }));

    // perform a flickr search
    doSearch(searchTerm).done(function(data) {
        // set the result count in the gui
        $('#resultCount').html('Results: ' + data.photos.total);
        // clear the slideshow for 'loading' text or previously shown images
        $('#slideshow').empty();

        data.photos.photo.forEach(function(photo) {
            // append each image in the flickr search result to the slideshow
            createImage(photo).appendTo('#slideshow');
        });
    });
}

// get the next page of images from flickr
function getNextPage() {
    setPageNumber(getPageNumber() + 1);
    searchFlickr();
}

// get the previous page of images from flickr
function getPreviousPage() {
    setPageNumber(Math.max(getPageNumber() - 1, 1));
    searchFlickr();
}

// get the current page number
function getPageNumber() {
    return parseInt(document.getElementById('pageNumber').value);
}

// set the current page number
function setPageNumber(page) {
    document.getElementById('pageNumber').value = page;
}

// callback for when user starts to drag an image from the slideshow
function drag(event) {
    event.originalEvent.dataTransfer.setData('text', event.target.id);

    hideDropContainerText();
}

// callback for when user drops an image in the drop container
function drop(event) {
    event.preventDefault();

    // get the image element from the slideshow, fade it out, move it to the drop container, and fade it in again
    var targetId = event.dataTransfer.getData('text');
    var element = document.getElementById(targetId);
    var jQueryElement = $('#' + targetId);

    jQueryElement.fadeOut(250, function() {
        event.target.appendChild(element);
        jQueryElement.addClass('drop-container-image');
        jQueryElement.fadeIn(250);
    });

    // save image in storage by creating a custom element
    var imgSrc = jQueryElement.children('img').attr('src');
    var storedElement = {
        id: targetId,
        src: imgSrc
    };

    storedImages.push(storedElement);
    localStorage.savedImages = JSON.stringify(storedImages);
}

function allowDrop(event) {
    event.preventDefault();
}

// perform a flickr search
function doSearch(searchTerm) {
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

// create an image element inside a div container from a flickr photo element
function createImage(photo) {
    // construct the image source
    var imgSrc = 'https://farm' + photo.farm + '.staticflickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '.jpg';

    // create containing div element
    var container = $('<div/>', {
        id: photo.id,
        class: 'slideshowImage',
        draggable: true
    });

    // bind the drag function to the containing div
    container.bind('dragstart', function(event) {
        drag(event);
    });

    // create the image element, and set up onClick popup
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

    // make the image fade in once it has been downloaded
    image.on('load', function() {
        $(this).removeClass('hidden');
        $(this).addClass('fadeIn');
    });

    return container.append(image);
}

// loads images that has previously been saved by the user in localStorage
function loadImagesFromStorage() {
    var imagesInStorage = localStorage.savedImages;

    if(imagesInStorage != null) {
        storedImages = JSON.parse(localStorage.savedImages);

        storedImages.forEach(function (imageElement) {
            getFlickrInfo(imageElement.id).done(function (imageInfo) {
                createImage(imageInfo.photo).addClass('drop-container-image').appendTo('#drop-container');
            })
        });

        // returns true if one or more images were loaded, false otherwise
        return storedImages.length > 0;
    }

    return false;
}

// get image info from flickr
function getFlickrInfo(id) {
    return $.ajax({
        dataType: 'json',
        url: url,
        data: {
            'method' : 'flickr.photos.getInfo',
            'api_key' : apiKey,
            'format' : 'json',
            'nojsoncallback' : 1,
            'photo_id' : id
        }
    });
}

// clear the text in the drop container
function hideDropContainerText() {
    $('#drop-text').hide();
    $('#drop-container').removeClass('text-center');
    $('#drop-container').removeClass('drop-text');
}

function showDropContainerText() {
    $('#drop-text').show();
    $('#drop-container').addClass('text-center');
    $('#drop-container').addClass('drop-text');
}

function clearLocalStorage() {
    localStorage.clear();
    $('.drop-container-image').remove();

    showDropContainerText();
}