function get_publication_object(publication, idx) {
    return `<li class="list-group-item" data-m="${publication._id}">
                <div class="row ${idx % 2 === 0 ? 'even_row' : 'odd_row'}">
                    <div class="col-lg-6 infoDiv">
                        <h2 class="movie_title">${publication.title}</h2>
                        <p class="rating larger_text cel_noto">Date Published: ${publication.publish_date}</p>
                    </div>
                    <div class="col-lg-3 d-flex justify-content-end buttonDiv">
                        <input type="checkbox" class="check_box" value="${publication._id}">
                        <button class="btn btn-lg btn-info" value="${publication._id}"  onclick="onEdit(this)">Edit</button>
                        <button class="btn btn-lg btn-danger" value="${publication._id}"  onclick="onDelete(this)">Delete</button>
                    </div>
                </div>
          </li>`
}

function showList(publications) {

    $('#publication_list').empty();
    publications.forEach((publication, idx) => {
        $('#publication_list').append(get_publication_object(publication, idx));
    });

    // $('.imgDiv,.infoDiv').on('click', function () {
    //     const movie_id = $(this).parents('li').attr('data-m');
    //     location.href = "movie_detail.html?movie_id=" + movie_id;
    // });
}

// showList([{
//     "title": "Minari",
//     "rating": 9,
//     "poster_path": "http://image.tmdb.org/t/p/w342/9Bb6K6HINl3vEKCu8WXEZyHvvpq.jpg",
//     "release_date": "2021-02-12", "overview": "test movie review"
// }])

$.getJSON("/get-all-publications")
    .done(function (data) {
        if (data.message === "success") {
            showList(data.data);
        }
    });

function addNewPublication() {

    location.href = "/get-edit-Publication";

}

function onEdit(obj) {
    location.href="/get-edit-Publication?publication_id="+obj.value;
}

function onDelete(obj){
    $.post('/delete-publication-by-id',{_id:obj.value}).done(
        (data)=>{
            if(data.message ==="success"){
                location.href="/get-publicaitonListAdmin"
            }else{
                //handle database error
            }
        }
    )
}