function get_event_object(event, idx) {
    return ` <li class="list-group-item">
            <div class="card mb-3 d-flex align-items-stretch">
                <div class="row no-gutters">
                    <div class="col-md-4">
                        <h2 class="">${event.title}</h2>
                        <img class="card-img-top" src="${event.image}" alt="Card image cap">
                    </div>
                    <div class="col-md-8">
                        <div class="row justify-content-center">
                            <h2 class="">Event Date:</h2>
                            <p>${event.date}</p>
                            <h2>Event Location</h2>
                            <p>${event.location}</p>
                            <h2>Summary</h2>
                            <p>${event.summary}</p>
                            <h2>I am interested</h2>
                            <div class="rsvp">
                                <button class="btn justify-content-center rsvp"  value='${event._id}' onclick='rsvpEvents(this)'>RSVP</button>
                                <br>
                            </div>
                            
                        </div>
                    </div>
                    </div>
                </div>
        </li>`
}

$(document).ready(() => {
    $.getJSON('/get_current_user').done(data => {
        if (data.message === 'success') {
            console.log(data)
            const user = data.data;
            $('.login').remove();
            $('#showname').text(user.fullname)
            $('#showname2').text(user.fullname)
            checkEventsUser()

        } else {
            $('.logout').remove();
        }
    })


})

function checkEventsUser() {
    console.log('event user running');
    //check if user is already in the event.
    $('.rsvp').each(function () {
        console.log($(this).val())
        $.getJSON('/get_current_user').done(data => {
            console.log(data.data)
            if (data.data.events.find(event=>event._id===$(this).val())) {
                console.log('user is already in event');
                //$(this).prop('disabled', true);
                $(this).prop("disabled", true);
                $(this).after("<br><p class='rsvp_text'> You Have already rsvp'd this event</p>")
            } else {
                $(this).prop("disabled", false);

            }
        })
    })


}


function rsvpEvents(obj) {
    let event = {};

    //check if user is already in the event.

    $.getJSON('/get-event-by-id', {event_id: obj.value}).done(data => {

        if (data.message === 'success') {
            event = data.data;
            $.getJSON('/get_current_user').done(data => {
                console.log(data.data)
                if (event.people.find(person => person.username === data.data.username)) {
                    console.log('user is already in event');
                    $(this).prop("disabled", true);
                    $(this).after("<br><p class='rsvp_text'> You Have already rsvp'd this event</p>")

                }else{
                    $(this).prop("disabled", false);

                }
            })

            $.post('/rsvp_event', {event: event}).done((data) => {
                if (data.message === "success") {
                    //location.reload();
                    //console.log(data);
                    location.href='/events'
                } else {
                    location.href = '/login'
                }
            })

        } else {
            //error happened
        }

    })
}

function showList(events) {
    $('#event_list').empty();
    events.forEach((event, idx) => {
        $('#event_list').append(get_event_object(event, idx));
    });
}

$.getJSON("/get-all-events")
    .done(function (data) {
        if (data.message === 'success') {
            console.log(data.data)
            showList(data.data)
        }
    })