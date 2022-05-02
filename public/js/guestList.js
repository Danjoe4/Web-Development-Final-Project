

function get_people_object(person, idx) {
    return `<li class="list-group-item" data-m="${person._id}">
                <div class="row ${idx % 2 === 0 ? 'even_row' : 'odd_row'}">
                    <div class="col-lg-6 infoDiv">
                        <h2 class="movie_title"> Email :${person.username}</h2>
                        <p class="rating larger_text cel_noto">Full Name: ${person.fullname}</p>
                      
                    </div>
                   
                </div>
          </li>`
}

function showList(people) {
    $('#guest_list').empty();
    console.log(people)
    people.forEach((person, idx) => {
        $('#guest_list').append(get_people_object(person, idx));
    });

    // $('.imgDiv,.infoDiv').on('click', function () {
    //     const movie_id = $(this).parents('li').attr('data-m');
    //     location.href = "movie_detail.html?movie_id=" + movie_id;
    // });
}


const query_string=window.location.search;
const url_params=new URLSearchParams(query_string);
const event_id=url_params.get('event_id');
console.log(event_id);

$(document).ready(()=>{

    if(event_id){
        $.getJSON('/get-event-by-id?event_id='+event_id)
            .done((data)=>{
                if(data.message==="success"){
                   const item=data.data.people;
                    showList(item);
                }
            });
    }
    $.getJSON('/get_current_user').done(data => {
        if (data.message === 'success') {
            console.log(data)
            const user = data.data;
            $('.login').remove();
            $('#showname').text(user.fullname)
            $('#showname2').text(user.fullname)

        } else {
            $('.logout').remove();
        }
    })
})