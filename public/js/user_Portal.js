function get_event_object(event, idx) {
        return `<li class="list-group-item" data-m="${event._id}">
                <div class="row ${idx % 2 === 0 ? 'even_row' : 'odd_row'}">
                    <div class="col-lg-6 infoDiv">
                        <h2 class="movie_title">${event.title}</h2>
                        <p class="rating larger_text cel_noto">Event Location: ${event.location}</p>
                        <p class="rating larger_text cel_noto">Event Date: ${event.date}</p>
                    </div>
                    <div class="col-lg-3 d-flex justify-content-end buttonDiv">
                        <button class="btn btn-lg btn-danger" value="${event._id}"  onclick="unRSVP(this)">Unrsvp</button>
                    </div>
                </div>
          </li>`
}

function showList(events) {
    $('#events_list').empty();
    events.forEach((event, idx) => {
        $('#events_list').append(get_event_object(event, idx));
    });

    // $('.imgDiv,.infoDiv').on('click', function () {
    //     const movie_id = $(this).parents('li').attr('data-m');
    //     location.href = "movie_detail.html?movie_id=" + movie_id;
    // });
}


$.getJSON("/get_current_user")
    .done(function (data) {
        if (data.message === "success") {
            console.log(data.data.events);
            showList(data.data.events);
        }
    });

function unRSVP(obj) {
    $.post('/user_unrsvp', {event: obj.value}).done(data => {
        if (data.message === 'success') {
            location.href = "/portal"
        }
    })
}