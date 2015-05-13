var apiKey = 'bc087c0b6239762cbcb64b281dde7b54';
var url = 'https://api.flickr.com/services/rest/';

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

    var container = $('<div/>', { class: 'slideshowImage' });

    var image = jQuery('<img/>', {
        src: imgSrc,
        click: function() {
            $('#image-modal-title').html(photo.title);
            $('#image-modal-body').html($('<img/>', {
                src: imgSrc,
                class: 'modalImage',
                click: function() {
                    $('#imageModal').modal('hide');
                }
            }));

            $('#imageModal').modal('show');
        }
    });

    return container.append(image);
}