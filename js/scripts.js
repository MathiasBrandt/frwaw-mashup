var apiKey = 'bc087c0b6239762cbcb64b281dde7b54';
var url = 'https://api.flickr.com/services/rest/';

function searchFlickr() {
    var searchTerm = document.getElementById('flickr.searchTerm').value;

    doSearch(searchTerm).done(function(data) {
        $('#resultCount').append(' ' + data.photos.total);

        data.photos.photo.forEach(function(photo) {
            // TODO: instead of using appendTo() multiple times, somehow concatenate the results together and perform one big appendTo()
            createImage(photo).appendTo('#resultImages');
        });

        console.log(data.photos);


    });

}

function doSearch(searchTerm) {
    return $.ajax({
        dataType: 'json',
        url: url,
        data: {
            'method' : 'flickr.photos.search',
            'api_key' : apiKey,
            'format' : 'json',
            'tags' : searchTerm,
            'per_page' : 3,
            'nojsoncallback' : 1
        }
    });
}

function createImage(photo) {
    var container = $('<div/>', {
        class: 'flickrImage'
    });

    var title = $('<div/>', {
        class: 'title',
        text: photo.title
    });

    var image = jQuery('<img/>', {
        src: 'https://farm' + photo.farm + '.staticflickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '.jpg'
    });

    return container.append(title).append(image);
}