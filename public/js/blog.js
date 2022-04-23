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

/* admins have the ability to add new posts
$("#add_button").empty();
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('add_button') === 'true'){
    $("#add_button").append(`
    <a href="/get-edit-Blogpost" class="btn btn-primary btn-lg mt-3 mx-3" role="button">Add New Blog Post</a>
    `)
}
getPosts();
*/