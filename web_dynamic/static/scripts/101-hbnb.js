$(function() {
    const HOST = 'http://127.0.0.1:5001';
    const amenities = {};
    const cities = {};
    const states = {};

    $('ul li input[type="checkbox"]').bind('change', (e) => {
        const el = e.target;
        let tt;
        switch (el.id) {
            case 'state_filter':
                tt = states;
                break;
            case 'city_filter':
                tt = cities;
                break;
            case 'amenity_filter':
                tt = amenities;
                break;
        }
        if (el.checked) {
            tt[el.dataset.name] = el.dataset.id;
        } else {
            delete tt[el.dataset.name];
        }
        if (el.id === 'amenity_filter') {
            $('.amenities h4').text(Object.keys(amenities).sort().join(', '));
        } else {
            $('.locations h4').text(
                Object.keys(Object.assign({}, states, cities)).sort().join(', ')
            );
        }
    });

    // check status of api
    $.getJSON(`${HOST}/api/v1/status`, (data) => {
        if (data.status === 'OK') {
            $('div#api_status').addClass('available');
        } else {
            $('div#api_status').removeClass('available');
        }
    });
    $('.filters button').bind('click', searchPlace);
    searchPlace();

    // fetch places
    function searchPlace() {
        $.post({
            url: `${HOST}/api/v1/places_search`,
            data: JSON.stringify({
                amenities: Object.values(amenities),
                states: Object.values(states),
                cities: Object.values(cities)
            }),
            headers: {
                'Content-Type': 'application/json'
            },
            success: (data) => {
                $('section.places').empty();
                data.forEach(d => console.log(d.id));
                data.forEach((place) => {
                    $('section.places').append(
                        `<article>
              <div class="title_box">
                <h2>${place.name}</h2>
                <div class="price_by_night">$${place.price_by_night}</div>
              </div>
              <div class="information">
                <div class="max_guest">${place.max_guest} Guest${
              place.max_guest !== 1 ? 's' : ''
            }</div>
                  <div class="number_rooms">${place.number_rooms} Bedroom${
              place.number_rooms !== 1 ? 's' : ''
            }</div>
                  <div class="number_bathrooms">${
                    place.number_bathrooms
                  } Bathroom${place.number_bathrooms !== 1 ? 's' : ''}</div>
              </div> 
              <div class="description">
                ${place.description}
              </div>
              <div class="reviews" data-place="${place.id}">
                <h2></h2>
                <ul></ul>
              </div>
            </article>`
                    );
                    fetchReviews(place.id);
                });
            },
            dataType: 'json'
        });
    }