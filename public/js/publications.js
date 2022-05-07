function get_publication_object(publication,idx){
    return ` <li class="list-group-item">
            <div class="card mb-3 d-flex align-items-stretch">
                <div class="row no-gutters">
                    <div class="col-md-4">
                        
                        <img class="card-img-top" src="${publication.image}" alt="Card image cap">
                    </div>
                    <div class="col-md-8">
                            <h2 class="text-start mx-2">${publication.title}</h2>
                            <p class="text-start mx-2">${publication.summary}</p>
                            <p class="text-start mx-2">
                            <b>Published on:</b> ${publication.publish_date}
                            </p>
                            <p class="text-start mx-2">
                            <b>By:</b> ${publication.authors}
                            </p>
                            <p class="text-start mx-2">
                            <b>Located at:</b> <a href="${publication.link}">${publication.location}</a>
                            </p>
                            
                            
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


$.getJSON("/get-all-publications")
    .done(function(data){
        if(data.message==='success'){
            console.log(data.data)
            showList(data.data)
        }})