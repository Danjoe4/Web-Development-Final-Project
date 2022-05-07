function get_event_object(event, idx) {
    return `<li class="list-group-item" data-m="${event._id}">
                <div class="row ${idx % 2 === 0 ? 'even_row' : 'odd_row'}">
                    <div class="col-lg-6 infoDiv">
                        <h2 class="movie_title">${event.title}</h2>
                        <p class="rating larger_text cel_noto">Event Date: ${event.date}</p>
                    </div>
                    <div class="col-lg-6 d-flex justify-content-end buttonDiv">
                    <div class-"btn-group">
                        <button class="btn btn-lg btn-info" value="${event._id}"  onclick="onEdit(this)">Edit</button>
                        <button class="btn btn-lg btn-danger" value="${event._id}"  onclick="onDelete(this)">Delete</button>
                        <button class="btn btn-lg btn-info" value="${event._id}" onclick="guestList(this)">Show Guest List</button>
                    </div>
                    </div>
                </div>
          </li>`
}

function guestList(obj) {

        //console.log(data)
        location.href = '/guest-list?event_id=' + obj.value;


    }


    function showList(events) {
        $('#event_list').empty();
        events.forEach((event, idx) => {
            $('#event_list').append(get_event_object(event, idx));
        });
    }

    $.getJSON("/get-all-events")
        .done(function (data) {
            if (data.message === "success") {
                console.log(data);
                showList(data.data);
            }
        });
    const addNewEvent = () => {
        location.href = "/get-edit-event";
    }

    function onEdit(obj) {
        location.href = "/get-edit-event?event_id=" + obj.value; //error?
    }

    function onDelete(obj) {
        $.post('/delete-event-by-id', {_id: obj.value}).done(
            (data) => {
                if (data.message === "success") {
                    $.post('/unrsvp_event', {event: obj.value}).done(data => {
                        if (data.message === 'success') {
                            location.href = "/get-events-admin"
                        }
                    })
                } else {
                    //handle database error
                }
            }
        )
    }