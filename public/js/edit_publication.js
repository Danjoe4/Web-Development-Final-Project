






// this file should be moved to private










// title:String,
//     publish_date:String,
//     location:String,
//     summary:String,
//     link:String,

function fillPublication(publication) {
    $('#title').val(publication.title);
    $('#publish_date').val(publication.publish_date);
    $('#location').val(publication.location)
    $('#summary').val(publication.summary);
    $('#link').val(publication.link);
}

function onCancel() {
    // if(movie_id){
        //come from detail page
        location.href='/PublicationListAdmin.html'
        // location.href="/movie_detail.html?movie_id="+movie_id;
    // }else{
    //     //come from home page
    //     location.href="/"
    // }
}
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const error_message = urlParams.get('error_message');
const publication =JSON.parse(urlParams.get('input'))
const publication_id=urlParams.get('publication_id')

$('form').on('submit', function () {
    // if ($('#overview').val().length<10){
    //     $('#error_message').text("Overview must be at least 10 characters");
    //     return false;
    // }
    if(publication_id){
        $('form').append(()=>{
            const input = $('<input>')
                .attr('name','_id')
                .attr('value',publication_id)
            return input
        })
    }
});

//if error load the last input from form.
if(error_message){
    fillPublication(publication);
    $('#error_message').text(error_message);
}


//if no error load from db
if(publication_id && !error_message){
    $.getJSON('/get-publication-by-id?publication_id='+publication_id)
        .done((data)=>{
            if(data['message']==='success'){
                console.log(data.data);
                fillPublication(data.data);
            }
        })
}
