function renderPost(post, idx){
    return `<li class="list-group-item" data-m="${post._id}">
                <div class="row ${idx % 2 === 0 ? 'even_row' : 'odd_row'}">
                    <div class="col-lg-6 infoDiv">
                        <h2 class="movie_title">${post.title}</h2>
                        <p class="rating larger_text cel_noto">Date Published: ${post.publish_date}</p>
                        <p class="rating larger_text cel_noto">${post.author}</p>
                    </div>
                    <div class="col-lg-3 d-flex justify-content-end">
                        ${post.text} 
                    </div>
                    <div class="col-lg-3 d-flex justify-content-end">
                    <button class="btn btn-lg btn-info" value="${post._id}"  onclick="onEdit(this)">Edit</button>
                    <button class="btn btn-lg btn-danger" value="${post._id}"  onclick="onDelete(this)">Delete</button>
                    </div>
                </div>
          </li>`
}


function renderPosts(posts){
    $("#post_list").empty();
    posts.forEach((post, idx) => {
        $("#post_list").append(renderPost(post, idx));
    });
}

function getPosts() {
    $.getJSON("/get-all-blogposts")
    .done(function (data) {
        if (data.message === "success") {
            renderPosts(data.data);
        }
    });
}


function onEdit(obj) {
    location.href="/admin-edit-blog?_id="+obj.value;
}

function onDelete(obj) {
    $.post('/delete-blog-by-id',{_id:obj.value}).done(
        (data)=>{
            if(data.message ==="success"){
                location.href="/admin-blog-list"
            }else{
                //handle database error
            }
        }
    )
}


getPosts();