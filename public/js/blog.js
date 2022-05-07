function renderPost(post, idx) {
    let date = post.publish_date.split("T")[0];
    const rendered_comments_list = renderComments(post.comments);
    return ` <li class="list-group-item" id="${post._id}">
            <div class="card mb-3 d-flex align-items-stretch">
                <div class="row no-gutters">
                    <div class="col-md-4">
                        <img class="card-img-top" src="${post.image}" alt="Card image cap">
                    </div>
                    <div class="col-md-8">
                    <h2 class="">${post.title}</h2>
                        <div class="row justify-content-center">
                            <p>${post.text}</p>
                        </div>
                        <div class="row justify-content-end align-items-end">
                        <div class="col-8">
                            <div class="row justify-content-start">
                                <div class="col-6">
                            <p>by ${post.author}</p>
                                </div>
                                <div class="col-6">
                            <p>on ${date}</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-4 align-self-end">
                        <div class="row">
                        <div class="btn-group">
                            <button id="show_comments" type="button" class="btn btn-info" onclick="showComments(this);">Show Comments</button>
                        </div>
                        </div>
                        </div>
                        </div>
                    </div>
                    </div>

                    <div class="row" id="comments_section" style="display: none;">
                        <div class="col-lg-12">
                            <h3 class="text-start"> Comments </h3>
                            <!-- Forgiveth my sins, for I hath violated one of the ten commandments of JS: 
                            "thoust shall not render all content on page load" -->
                            ${rendered_comments_list}
                            
                            <form action="/save-blog-comment?blog_id=${post._id}" method="post">
                                <div class="form-outline w-100">
                                    <label for="comment_txt" class="form-label">Add your own comment!</label>
                                    <textarea class="form-control" id="comment_txt" rows="4" placeholder="Be nice" name="comment_txt"
                                    style="background: #fff;" required></textarea>
                                </div>
                                <div class="mb-3 mx-3">
                                    <button type="submit" class="btn btn-primary btn-small" style="width: 20%">Post comment</button>&nbsp;
                                </div>
                            </form>

                            </div>
                        </div>
                    </div>

                </div>
        </li>`
}

function renderComments(post_cmts) {
    if (post_cmts.length === 0) {
        return `<p>No comments yet</p>`
    }
    let base = `<ul class="list-group" id="comment_list">`;
    post_cmts.forEach((cmt, idx) => {
        let date = cmt.date.split("T")[0];
        base = base + `<li class="list-group-item">
        ${cmt.comment} <br>
        <small>by ${cmt.user}</small> <small> on ${date}</small> 
        </li>`
    });
    return base + `</ul>`;
}


function showComments(obj) {
    $(obj).parents(".card").find("#comments_section").toggle()
    $(obj).text($(obj).text() === "Show Comments" ? "Hide Comments" : "Show Comments")
}


function renderPosts(posts) {
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
getPosts();