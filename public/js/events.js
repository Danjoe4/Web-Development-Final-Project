function get_event_object(event, idx) {
    return ` <li class="list-group-item">
            <div class="card mb-3 d-flex align-items-stretch">
                <div class="row no-gutters">
                    <div class="col-md-4">
                        <img class="card-img-top" src="${event.image}" alt="Card image cap">
                    </div>
                    <div class="col-md-8">
                        
                        <h2 class="text-start mx-2">${event.title}</h2>
                        
                        <p class="text-start mx-2">${event.summary}</p>
                        <p class="text-start mx-2">
                        <b>Event Date:</b> ${event.date}
                        </p>
                        <p class="text-start mx-2">
                        <b>Event location:</b> ${event.location}
                        </p>
                        <div class="row">
                        <div class="col-md-6 mx-2">
                            <h4>Would you like to attend?</h4>
                        </div>
                        <div class="col-md-5 m-2">
                            <div class="rsvp">
                                <button class="btn justify-content-center rsvp"  value='${event._id}' onclick='rsvpEvents(this)'>RSVP</button>
                                <br>
                            </div>
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
            checkEventsUser()
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