function get_publication_object(publication,idx){
    return ` <li class="list-group-item">
            <div class="card mb-3 d-flex align-items-stretch">
                <div class="row no-gutters">
                    <div class="col-md-4">
                        <h2 class="">${publication.title}</h2>
                        <img class="card-img-top" src="${publication.image}" alt="Card image cap">
                    </div>
                    <div class="col-md-8">
                        <div class="row justify-content-center">
                            <h2 class="">Publication Date:</h2>
                            <p>${publication.publish_date}</p>
                            <h2 class="">Authors</h2>
                            <p>${publication.authors}</p>
                            <h2>Publication Location</h2>
                            <p>${publication.location}</p>
                            <h2>Summary</h2>
                            <p>${publication.summary}</p>
                            <h2>Link</h2>
                            <a href="${publication.link}"> Link to publication</a>
                        </div>
                    </div>
                    </div>
                </div>
        </li>`
}
function showList(publication) {
    $('#publication_list').empty();
    publication.forEach((publication, idx) => {
        $('#publication_list').append(get_publication_object(publication, idx));
    });
}



$(document).ready(()=>{
    $.getJSON('/get_current_user').done(data=>{
        if(data.message==='success'){
            console.log(data)
            const user=data.data;
            $('.login').remove();
            $('#showname').text(user.fullname)
            $('#showname2').text(user.fullname)
        }else{
            $('.logout').remove();
        }
    })
})

$.getJSON("/get-all-publications")
    .done(function(data){
        if(data.message==='success'){
            console.log(data.data)
            showList(data.data)
        }})