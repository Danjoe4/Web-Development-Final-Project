function fillEvent(event) {
    $('#title').val(event.title);
    $('#image').val(event.image);
    $('#location').val(event.location);
    $('#summary').val(event.summary);
    $('#date').val(event.date);

}
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const error_message = urlParams.get('error_message');
const publication =JSON.parse(urlParams.get('input'))
const event_id=urlParams.get('event_id');

function onCancel() {
    // if(movie_id){
    //come from detail page
    location.href='/get-events-admin'
    // location.href="/movie_detail.html?movie_id="+movie_id;
    // }else{
    //     //come from home page
    //     location.href="/"
    // }
}

$('form').on('submit', function () {
    // if ($('#overview').val().length<10){
    //     $('#error_message').text("Overview must be at least 10 characters");
    //     return false;
    // }
    if(event_id){
        $('form').append(()=>{
            const input = $('<input>')
                .attr('name','_id')
                .attr('value',event_id)
            return input
        })
    }
});

//if error load the last input from form.
if(error_message){
    fillPublication(publication);
    $('#error_message').text(error_message);
}

if(event_id && !error_message){
    $.getJSON('/get-event-by-id?event_id='+event_id)
        .done((data)=>{
            if(data['message']==='success'){
                console.log(data.data);
                fillEvent(data.data);
            }
        })
}